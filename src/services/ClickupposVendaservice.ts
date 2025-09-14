import {getTasksCustom, clickup} from './clickupServices'
import clickupServices from './clickupServices.js';
import utils from '../utils/utils';
import {extrairDadosPessoais} from '../utils/dataExtractor';
import {getSubscriber, sendMessage, sendHook, sendHookSegundaEtapa, setCustomFieldValue,shcadulesMessagesender, createSubscriber, sendMessagesWithDelay} from './botconversaService'
import PosVendaLeadsService from './posvendaLeads'
import {getCustomFieldId} from '../utils/utlsBotConversa'
import Tasks from './taskService'
import posvendaMessages from './posvendaMessages'

import {messagesReturn, treatMessageType, treatMessageDate, treatMessageBirthday, modelsDirect, modelsFirtsContact, modelsAniversary, modelsSchadules, mediaMessages } from './clickupMessages'
import { calculateTriggerDates } from '../utils/dateCalculator';

function delayDb(ms:any) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

const leadService = new PosVendaLeadsService()
export const taskService = new Tasks()
const messageService = new posvendaMessages()

type ClickUpAttachment = { url?: string, title?:string};
type ClickUpHistoryItem = { attachments?: ClickUpAttachment[], custom_field?:any, after?:any };

type ClickUpHookBody = { task_id?: string; history_items?: ClickUpHistoryItem[] };

// Função para converter data DD/MM/YYYY para Date no fuso horário de São Paulo

function getField(fields: any[], name: string) {
  return fields?.find(f => f.fieldName === name);
}

function getSelectedArray(field: any): string[] {
  const sel = field?.selectedOptions;
  if (!sel) return [];
  // suporta [{name|label}] ou ["Branco"]
  if (Array.isArray(sel)) {
    return sel.map((v: any) => (typeof v === 'string' ? v : (v?.name ?? v?.label))).filter(Boolean);
  }
  // suporta string única
  if (typeof sel === 'string') return [sel];
  return [];
}

export async function webHook(req: any) {
  try {
    const taskPosVenda: any = await clickup.tasks.get(req.body.task_id);

    let phone: string | undefined =
      taskPosVenda?.body?.custom_fields
        ?.find((f: any) => f?.name === '👤 Telefone Cliente')
        ?.value;

    if (!phone) return [];
   const task = await getTasksCustom(901108902349, phone);
    phone = phone.replace(/[^\d+]/g, '');

   
    if (!Array.isArray(task) || task.length === 0) return [];

    const customFields: any[] = utils.extractCustomFields(task[0]?.custom_fields);
    if (!customFields?.length) return [];

    let contact = await getSubscriber(phone);
    const firstName = utils.extractFirstName(task[0].name);
    const lastName  = utils.extractLastName(task[0].name);
    if (!contact) contact = await createSubscriber(phone, firstName, lastName);
    if(contact.status === 200){
      contact = await getSubscriber(phone);
    }

    const leadData = {
      name: task[0].name,
      phone,
      subscriberbot: contact.id,
      customFields
    };
    const leadCreated = await leadService.create(leadData);

    const taskDataPosVenda = {
      id: taskPosVenda.body.id,
      name: taskPosVenda.body.name,
      listId: Number(taskPosVenda.body.list.id),
      status: taskPosVenda.body.status.status,
      data: taskPosVenda.body,
      leadId: leadCreated.id
    };
    const taskDataCloser = {
      id: task[0].id,
      name: task[0].name,
      listId: Number(task[0].list.id),
      status: task[0].status.status,
      data: task[0],
      leadId: leadCreated.id
    };

    await taskService.bulkCreate([taskDataPosVenda, taskDataCloser]);

    // Prazo de entrega (opcional)
    const prazoField = getField(customFields, '⚠️ Prazo de Entrega');
    const prazoOpts  = getSelectedArray(prazoField);
    const dataEntrega:any = prazoOpts[0] ?? 0;
    let modelsFirst = modelsFirtsContact
    let messages
    let clienteRetira:any = 'off'
   if(dataEntrega === 0){
      modelsFirst = modelsFirtsContact.filter((m) => m !== 'CLIENTE RETIRA' && m !== 'ENTREGA VIA TRANSPORTADORA');
      messages = messagesReturn(firstName, modelsFirst)
   } else {
    messages = messagesReturn(firstName, modelsFirtsContact, dataEntrega);
    const retiraField = getField(customFields, '⚠️ Cliente Retira');
    const retiraOpts  = getSelectedArray(retiraField);
    clienteRetira = retiraOpts.includes('Sim');

    messages = clienteRetira
      ? messages.filter(m => m.modelo !== 'ENTREGA VIA TRANSPORTADORA')
      : messages.filter(m => m.modelo !== 'CLIENTE RETIRA');
   }

    const messagesData = messages.map((m: any) => ({
      title: m.modelo,
      message_text: m.message,
      sent: true,
      leadId: leadCreated.id
    }));

    await messageService.bulkCreate(messagesData);

    // Texto para bot (seguro)
    const customDataBot = customFields.map((f: any) => {
      const vals = getSelectedArray(f).join(', ');
      return `${f.fieldName}: ${vals}`;
    });
    const customDataBotString = customDataBot.join('\n');

    const messagesHistory = messages
      .map((m: any) => `role: assistant,\ncontent: ${m.messageBot ?? ''}`)
      .join('\n');

    // Media conforme cor (somente quando cliente retira)
    if (!clienteRetira) {
      messages.push({ modelo: '', message: mediaMessages[3], messageBot: '' });
    } else if (clienteRetira && clienteRetira !== 'off'){
      const corField = getField(customFields, '⚠️ Cor');
      const corOpts  = getSelectedArray(corField);
      const isBranco = corOpts.includes('Branco');
      const media    = isBranco ? mediaMessages[4] : mediaMessages[5];
      messages.push({ modelo: '', message: media, messageBot: '' });
    }

    await sendHook(contact.phone, req.body.task_id, messages, customDataBotString, messagesHistory);

    return leadData;
  } catch (error) {
    console.log(error);
    return [];
  }
}

  export async function getMessageBot(task_id: string, description: string): Promise<any> {

    let directMessages: any[] = [];
    let schaduleMessages: any[] = [];
    let aniversaryMessages: any[] = [];
    let messageData: any;
    let allMessages: any[] = [];
    let extractedCadastro: any;
    let messagesHistory: string = '';
    let dataEntrega: string | undefined;

    try {
      // Tenta JSON; se falhar, faz parsing heurístico
      try {
        extractedCadastro = JSON.parse(description);
      } catch {
        extractedCadastro = extrairDadosPessoais(description);
      }

      const leadToUpdate: any = await taskService.findById(task_id);
      if (!leadToUpdate) return null;

      const updateLeadData = {
        city: extractedCadastro?.cidade,
        email: extractedCadastro?.email,
        neighborhood: extractedCadastro?.bairro,
        street: extractedCadastro?.rua,
        number: extractedCadastro?.numero,
        cep: extractedCadastro?.cep,
        cpf: extractedCadastro?.cpf,
        birthday: extractedCadastro?.dataDeNascimento ? utils.parseDate(extractedCadastro.dataDeNascimento) : null
      };

      // Atualiza lead banco local e clickup
      const leadCustom: any = await leadService.update(leadToUpdate.leadId, updateLeadData);
      if (!leadCustom) return null;
  
      const firsName = utils.extractFirstName(leadCustom?.name ?? '');

      // Prazo de Entrega (como string, 1ª opção)
      const prazoField = getField(leadCustom?.customFields ?? [], '⚠️ Prazo de Entrega');
      const prazoOpts = getSelectedArray(prazoField);
      dataEntrega = prazoOpts[0];
      if (!dataEntrega) {
        await clickupServices.updateTask(task_id, undefined, description, 170448045 )
      } else {
     leadCustom.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Cliente Retira").selectedOptions[0]?.name === "Sim"
       ? await clickupServices.updateTask(task_id, 'cliente retira', description, 170448045 )
       : await clickupServices.updateTask(task_id, 'envio do closet', description, 170448045 )
      }

      // Agendadas dependem do prazo
      let messagesSchadule: any[] = [];
      if (dataEntrega) {
        const dates = calculateTriggerDates(dataEntrega);
        messagesSchadule = messagesReturn(firsName, modelsSchadules, dataEntrega, dates.ninetyTwoDaysAfter);
      }

      // Diretas
      let messagesPosDirect = messagesReturn(firsName, modelsDirect, dataEntrega);

      // Cliente Retira (filtra mensagem de entrega)
      const retiraField = getField(leadCustom?.customFields ?? [], '⚠️ Cliente Retira');
      const retiraOpts = getSelectedArray(retiraField);
      const clienteRetira = retiraOpts.includes('Sim');
      if (clienteRetira || !dataEntrega) {
        messagesPosDirect = messagesPosDirect.filter(m => m.modelo !== 'INFORMAÇÕES DA ENTREGA');
      }

      // Monta mensagens diretas
      for (const message of messagesPosDirect ?? []) {
        messageData = treatMessageDate(message, dataEntrega, leadCustom);
        if (messageData) directMessages.push(messageData);
      }

      // Monta mensagens agendadas (se houver data)
      if (dataEntrega) {
        for (const message of messagesSchadule ?? []) {
          messageData = treatMessageDate(message, dataEntrega, leadCustom);
          if (messageData) schaduleMessages.push(messageData);
        }
        allMessages = directMessages.concat(schaduleMessages);
      } else {
        allMessages = directMessages;
      }

      // Mensagens de aniversário
      if (extractedCadastro?.dataDeNascimento) {
        const messagesBirthdayReturn = messagesReturn(firsName, modelsAniversary, undefined, extractedCadastro.dataDeNascimento);
        for (const message of messagesBirthdayReturn ?? []) {
          messageData = treatMessageBirthday(message, extractedCadastro.dataDeNascimento, leadCustom);
          if (messageData) aniversaryMessages.push(messageData);
        }
        allMessages = allMessages.concat(aniversaryMessages);
      }

      // Persiste todas as mensagens (ignora se vazio)
      if (allMessages.length > 0) {
        await messageService.bulkCreate(allMessages);
      }

      // Histórico para contexto do bot
      const sentHistory = await messageService.findByLeadId(leadToUpdate.leadId, true);
      messagesHistory = (sentHistory ?? [])
        .filter((m: any) => m?.sent === true)
        .map((m: any) => {
          const botMsg = messagesReturn(firsName, [m.title], dataEntrega)?.[0]?.messageBot ?? '';
          return `\n   role: assistant,\n   content: ${botMsg}\n    `;
        })
        .join('\n');

      await sendHookSegundaEtapa(leadCustom.phone, messagesPosDirect, messagesHistory);

      // Retorna o lead atualizado para o caller
      return leadCustom;
    } catch (error) {
      console.error('Erro ao buscar chaves por padrão:', error);
      throw new Error('Falha ao buscar chaves no Redis');
    }
}

export async function verifyScheduledMessages() {
  try {
    const messagesToSend: any[] = await messageService.findScheduledForToday(true);

    // Processa todas as mensagens em paralelo
    await Promise.all(messagesToSend.map(async (message) => {
      // Busca histórico de mensagens enviadas
      const sentMessages = await messageService.findByLeadId(message.leadId);
      const messagesHistory = [
        ...sentMessages.filter((m: any) => m.sent),
        message
      ]
        .map((m: any) => `role: assistant,\ncontent: ${messagesReturn(utils.extractFirstName(message.leadposvenda.name), [m.title], message.leadposvenda.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Prazo de Entrega")?.selectedOptions || 0)[0].messageBot}`)
        .join('\n');

      // Envia a mensagem
      //await shcadulesMessagesender(message.leadposvenda.phone, message.message_text, messagesHistory);

       const messageHistoryId  = getCustomFieldId('messagehistory')
   
       await setCustomFieldValue(Number(message.leadposvenda.subscriberbot), messageHistoryId[0].id, messagesHistory)
       await sendMessage(Number(message.leadposvenda.subscriberbot), "text", message.message_text)
       await utils.delay(5000);
      if(message.title === 'FOLLOW-UP 02 - RECEBEU O CLOSET' || message.title === 'FOLLOW-UP 02 - BUSCOU O CLOSET'){
        await sendMessage(Number(message.leadposvenda.subscriberbot), "file", mediaMessages[6])
      }
      const status = treatMessageType(message.title);
      // Atualiza somente o status de enviado, se não houver mudança de tarefa
      if (!status) {
        await messageService.update(message.id, { sent: true });
        return;
      }

      // Atualiza tarefa no ClickUp
      const taskToUpdate = message.leadposvenda.tasks.find(
        (task: { listId: string }) => task.listId === '901108902430'
      )?.id;

      if (!taskToUpdate) {
        console.warn(`Nenhuma task encontrada para o lead ${message.leadId}`);
        return;
      }

      const taskUpdated = await clickupServices.updateTask(taskToUpdate, status);
      
      await Promise.all([
        taskService.update(taskUpdated.id, {
          status: taskUpdated.status.status,
          data: taskUpdated
        }),
        messageService.update(message.id, { sent: true })
      ]);
    }));

    return messagesToSend;
  } catch (error) {
    console.error(error);
    return [];
  }
}


export async function sendMedia(task_id: string): Promise<any> {
    try {
      const leadToUpdate:any = await taskService.findById(task_id, true)
       if(!leadToUpdate) return
    
      for(let i = 0; i < mediaMessages.length - 1; i++){
        await sendMessage(Number(leadToUpdate.lead.subscriberbot), "file", mediaMessages[i])
        await utils.delay(5000);
      }
      
      return 'videos enviados';
    } catch (error) {
      console.error('Erro ao buscar chaves por padrão:', error);
      throw new Error('Falha ao buscar chaves no Redis');
    }
}


export async function botFail(task_id: string, summary:string): Promise<any> {
    try {
       const leadToHelp:any = await taskService.findById(task_id, true)
       if(!leadToHelp) return

       const leadToHelpData =` 
        Cliente precisa de ajuda
        nome: ${leadToHelp.lead.name},
        telefone: ${leadToHelp.lead.phone},
        task_id: ${task_id},
        summary: ${summary}
       `
        await sendMessage(795504790, "text", leadToHelpData)
       
      return 'notificado';
    } catch (error) {
      console.error('Erro ao buscar chaves por padrão:', error);
      throw new Error('Falha ao buscar chaves no Redis');
    }
}


export async function taskUpdatedHook(req: any) {
  let messageData
  let schaduleMessages = []
  try {
    const body = (req?.body ?? {}) as ClickUpHookBody;

    // Guard clauses
    if (!body.task_id) return { ok: false, reason: 'missing task_id' };
    const history:any = body.history_items;
    const attachments = body.history_items?.[0]?.attachments ?? [];
  const urls = (attachments ?? [])
.filter(a => {
const url = a?.url;
const title = a?.title;
const urlOk = typeof url === 'string' && /^https?:///i.test(url);
const titleOk = typeof title === 'string' && title.includes('NF'); // case-insensitive: title?.toLowerCase().includes('nf')
return urlOk && titleOk;
})
.map(a => a.url as string);

if (urls.length === 0 && history.length === 0) return { ok: false, reason: 'no_attachments or custom_fields' };

    // Busca a task apenas uma vez (evita requisições duplicadas)
    const task: any = await taskService.findById(body.task_id, true).catch(e => {
      console.error('findById error:', e);
      return null;
    });
    if (!task) return { ok: false, reason: 'task_not_found' };

    // Task lookup com tratamento de erro
    if(urls.length > 0 ){
    const subscriberRaw = task?.lead?.subscriberbot;
    const subscriberId = Number(subscriberRaw);
    if (!Number.isFinite(subscriberId)) return { ok: false, reason: 'invalid_subscriberbot' };

    // Envia só o primeiro anexo (mesma semântica do seu código). Se quiser todos, remova o slice.
    const toSend = urls.slice(0, 1);
    const retiraField = getField( task?.lead?.customFields, '⚠️ Cliente Retira');
    const retiraOpts  = getSelectedArray(retiraField);
    const clienteRetira = retiraOpts.includes('Sim');
    const firsName = utils.extractFirstName(task?.lead?.name)
    const messageFirst = clienteRetira? `Ola ${firsName}, segue em anexo a notafiscal do seu Closet` : `Ola ${firsName}, segue em anexo a notafiscal do seu Closet. Referente ao seu código de rastreio você vai entrar neste link, selecionar Nota Fiscal, digitar o número da sua nota, juntamente com seu CPF:
https://portaldocliente.expressosaomiguel.com.br:2041/track
Depois é só confirmar a sequência de letras que o sistema pedir, e prontinho! Você terá acesso a todas as informações do seu envio e vai poder acompanhar este pedido até a sua casa!`
         const dataEntrega = task?.lead?.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Prazo de Entrega")?.selectedOptions || 0

      const sentHistory = await messageService.findByLeadId(task?.lead?.id, true);
      let messagesHistoryArr = (sentHistory ?? [])
        .filter((m: any) => m?.sent === true)
        .map((m: any) => {
          const messagesSent = messagesReturn(firsName, [m.title], dataEntrega)?.[0];
          return `\n   role: assistant,\n   content: ${messagesSent.messageBot}\n    `;
        });   

      messagesHistoryArr.push(messageFirst);
      let messagesHistory = messagesHistoryArr.join('');
 
    const messageHistoryId  = getCustomFieldId('messagehistory')

          await Promise.all([
     setCustomFieldValue(task?.lead?.subscriberbot, messageHistoryId[0].id, messagesHistory),
    ])
  

await sendMessage(subscriberId, 'text', messageFirst)
await delayDb(3000)
await sendMessage(subscriberId, 'file', toSend[0])

    return { ok: true, sent: 'ok'};
    } else if(history.length > 0 && history[0]?.custom_field) {
       
     const retiraField = getField(task.lead.customFields ?? [], '⚠️ Cliente Retira');
     const entregaField = getField(task.lead.customFields ?? [], '⚠️ Prazo de Entrega');
     const customUpdated =  handleCustomFields(history[0], task.lead.customFields)

     
     const data = {
      customFields: customUpdated
     }

     const leadCustom:any = await leadService.update(task.leadId, data);

     if(history[0].custom_field.name === '⚠️ Prazo de Entrega' && entregaField && retiraField ){ 
      const firsName = utils.extractFirstName(leadCustom.name)
      const dataEntrega = leadCustom.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Prazo de Entrega")?.selectedOptions || 0
    const dates = calculateTriggerDates(dataEntrega)
    const messagesSchadule = messagesReturn(firsName, modelsSchadules, dataEntrega, dates.ninetyTwoDaysAfter)

    for(const message of messagesSchadule){
      messageData = treatMessageDate(message, dataEntrega, leadCustom)
      if(messageData){
      await messageService.updateForTask(messageData)
      } else {
        continue
      }
    }
       const customDataBot = leadCustom.customFields.map((f: any) => {
        const vals = getSelectedArray(f).join(', ');
        return `${f.fieldName}: ${vals}`;
      });
      const customDataBotString = customDataBot.join('\n');
  
      const sentHistory = await messageService.findByLeadId(leadCustom.id, true);
   
      let messagesHistoryArr = (sentHistory ?? [])
        .filter((m: any) => m?.sent === true)
        .map((m: any) => {
          const messagesSent = messagesReturn(firsName, [m.title], dataEntrega)?.[0];
          return `\n   role: assistant,\n   content: ${messagesSent.messageBot}\n    `;
        });
      const reschaduleMessage = `Olá ${firsName}, por meio deste gostaria de informar que o prazo de entrega do seu Closet foi alterado para dia ${dataEntrega}`;
      messagesHistoryArr.push(reschaduleMessage);
      let messagesHistory = messagesHistoryArr.join('');
 
    const messageHistoryId  = getCustomFieldId('messagehistory')
    const customData = getCustomFieldId('dados pedido')
    await Promise.all([
     setCustomFieldValue(leadCustom.subscriberbot, messageHistoryId[0].id, messagesHistory),
     setCustomFieldValue(leadCustom.subscriberbot, customData[0].id, customDataBotString)
    ])
    
      await sendMessage(Number(leadCustom.subscriberbot), "text", reschaduleMessage)
      return { ok: true, updated: true };
     }
     const verifyRetira = getField(leadCustom.customFields, '⚠️ Cliente Retira');
     const verifyPrazo = getField(leadCustom.customFields, '⚠️ Prazo de Entrega');
     if(history[0].custom_field.name === '⚠️ Prazo de Entrega'|| history[0].custom_field.name === '⚠️ Cliente Retira' && !entregaField || !retiraField && verifyRetira != undefined && verifyPrazo != undefined){
      const firsName = utils.extractFirstName(leadCustom.name)
      const dataEntrega = leadCustom.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Prazo de Entrega")?.selectedOptions || 0
      let messages
     
       
        const retiraOpts  = getSelectedArray(leadCustom.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Cliente Retira"));
        const clienteRetira = retiraOpts.includes('Sim');

           leadCustom.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Cliente Retira").selectedOptions[0]?.name === "Sim"
       ? await clickupServices.updateTask(body.task_id, 'cliente retira', undefined, 170448045 )
       : await clickupServices.updateTask(body.task_id, 'envio do closet', undefined, 170448045 )
           let allMessages: any[] = []


       let messagesfirst = messagesReturn(firsName, modelsFirtsContact, dataEntrega);
        messagesfirst = clienteRetira
          ? messagesfirst.filter(m => m.modelo !== 'ENTREGA VIA TRANSPORTADORA')
          : messagesfirst.filter(m => m.modelo !== 'CLIENTE RETIRA');

          let FirstContact: any[] = []
       
       for (const message of messagesfirst ?? []) {
        messageData = treatMessageDate(message, dataEntrega, leadCustom);
        if (messageData) FirstContact.push(messageData);
      } 
      allMessages = FirstContact

      let messagesPosDirect = messagesReturn(firsName, modelsDirect, dataEntrega);
       let directMessages: any[] = []
        if (clienteRetira) {
        messagesPosDirect = messagesPosDirect.filter(m => m.modelo !== 'INFORMAÇÕES DA ENTREGA');
      }
    for (const message of messagesPosDirect ?? []) {
        messageData = treatMessageDate(message, dataEntrega, leadCustom);
        if (messageData) directMessages.push(messageData);
      }

      // Monta mensagens agendadas (se houver data)
     
      if (dataEntrega) {
        const dates = calculateTriggerDates(dataEntrega);
        const messagesSchadule = messagesReturn(firsName, modelsSchadules, dataEntrega, dates.ninetyTwoDaysAfter);
        for (const message of messagesSchadule ?? []) {
          messageData = treatMessageDate(message, dataEntrega, leadCustom);
          if (messageData) schaduleMessages.push(messageData);
        }
        allMessages = directMessages.concat(schaduleMessages);
      } else {
        allMessages = directMessages;
      }

    const existingMessages = (await messageService.findByLeadId(leadCustom.id)) ?? [];
          const existingTitles = new Set(
existingMessages.map(m => String(m.title ?? '').trim().toLowerCase())
);
const toCreate = (allMessages ?? [])
.filter(m => m?.title)
.filter(m => !existingTitles.has(String(m.title).trim().toLowerCase()));
if (toCreate.length) {
await messageService.bulkCreate(toCreate);
}
  
      // Texto para bot (seguro)
      const customDataBot = leadCustom.customFields.map((f: any) => {
        const vals = getSelectedArray(f).join(', ');
        return `${f.fieldName}: ${vals}`;
      });
      const customDataBotString = customDataBot.join('\n');
  
      const sentHistory = await messageService.findByLeadId(leadCustom.id, true);
      let messagesHook:any[] = []
      const messagesHistory = (sentHistory ?? [])
        .filter((m: any) => m?.sent === true)
        .map((m: any) => {
          const messagesSent = messagesReturn(firsName, [m.title], dataEntrega)?.[0];
          return `\n   role: assistant,\n   content: ${messagesSent.messageBot}\n    `;
        })
        .join('\n');

        messagesHook = (sentHistory ?? [])
        .filter((m: any) => m?.sent === true)
        .map((m: any) => {
          const messagesSent = messagesReturn(firsName, [m.title], dataEntrega)?.[0];
          return messagesSent;
        });

 
    const messageHistoryId  = getCustomFieldId('messagehistory')
    const customData = getCustomFieldId('dados pedido')
    await Promise.all([
     setCustomFieldValue(leadCustom.subscriberbot, messageHistoryId[0].id, messagesHistory),
     setCustomFieldValue(leadCustom.subscriberbot, customData[0].id, customDataBotString)
    ])
    const messagesToSend = [`Olá ${firsName}, como está? Esperamos que esteja bem! 😄 `, messagesHook.find((message) => message.modelo === 'ENTREGA VIA TRANSPORTADORA')?.message || messagesHook.find((message) => message.modelo === 'CLIENTE RETIRA')?.message, messagesHook.find((message) => message.modelo === 'INFORMAÇÕES DA ENTREGA')?.message, 'Se tiver alguma dúvida estamos a diposição. Desde já, grato']
    const subscriber = Number(leadCustom.subscriberbot);
    await sendMessagesWithDelay(subscriber, messagesToSend, 'text', 3000);

  }
    return { ok: true, reason: 'success' };
}
  } catch (err) {
    console.error('taskUpdatedHook fatal:', err);
    return { ok: false, reason: 'unexpected_error' };
  }
}

type ParsedField = { fieldName: string; selectedOptions: any[] };

function handleCustomFields(history_items: any, customFields: any[] = []): any[] {
 const cf = history_items?.custom_field;
  if (!cf?.name) return customFields;

  const up = { ...cf, value: history_items.after };           // evita mutar o original
  const [parsed] = utils.extractCustomFields([up]) ?? [];
  if (!parsed?.fieldName) return customFields;

  const idx = customFields.findIndex(f => f.fieldName === parsed.fieldName);

  if (idx >= 0) {
    // substitui ou mescla — escolha o que fizer sentido:
    customFields[idx] = { ...customFields[idx], ...parsed };
    // se quiser só trocar o valor/opções:
    // customFields[idx].selectedOptions = parsed.selectedOptions;
    // customFields[idx].value = parsed.value;
  } else {
    customFields.push(parsed);
  }
  return customFields;
}
