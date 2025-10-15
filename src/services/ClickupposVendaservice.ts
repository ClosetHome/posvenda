import {getTasksCustom, clickup} from './clickupServices'
import clickupServices from './clickupServices.js';
import utils from '../utils/utils';
import {extrairDadosPessoais} from '../utils/dataExtractor';
import {getSubscriber, sendMessage, sendHook, sendHookSegundaEtapa, setCustomFieldValue, shcadulesMessagesender, createSubscriber, sendMessagesWithDelay, addTag, deleteTag, FOLLOW_UP_MESSAGE} from './botconversaService'
import PosVendaLeadsService from './posvendaLeads'
import {getCustomFieldId} from '../utils/utlsBotConversa'
import Tasks from './taskService'
import posvendaMessages from './posvendaMessages'
import {scheduleFollowUpIfInactive, clearFollowUpTimer} from './followupTimer'

import {messagesReturn, treatMessageType, treatMessageDate, treatMessageBirthday, modelsDirect, modelsFirtsContact, modelsAniversary, modelsSchadules, mediaMessages, mediaPre } from './clickupMessages'
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
  let leadCapture:any
  try {
    const taskPosVenda: any = await clickup.tasks.get(req.body.task_id);

    let phone: string | undefined =
      taskPosVenda?.body?.custom_fields
        ?.find((f: any) => f?.name === '👤 Telefone Cliente')
        ?.value;

    if (!phone) return [];
    const task = await getTasksCustom(901108902349, phone);
    phone = phone.replace(/[^\d+]/g, '');

    let customFields: any[] = [];
    let taskData: any = null;
    let firstName: string = '';
    let lastName: string = '';
    
    if (!Array.isArray(task) || task.length === 0) {
      // Usa dados de taskPosVenda quando não encontra task no getTasksCustom
      customFields = utils.extractCustomFields(taskPosVenda.body.custom_fields);
      if (!customFields?.length) return [];
      
      firstName = utils.extractFirstName(taskPosVenda.body.name);
      lastName = utils.extractLastName(taskPosVenda.body.name);
    } else {
      // Usa dados da task encontrada
      customFields = utils.extractCustomFields(task[0]?.custom_fields);
      if (!customFields?.length) return [];
      
      taskData = task[0];
      firstName = utils.extractFirstName(task[0].name);
      lastName = utils.extractLastName(task[0].name);
    }

    let contact = await getSubscriber(phone);
    if (!contact) contact = await createSubscriber(phone, firstName, lastName);
    if(contact.status === 200){
      contact = await getSubscriber(phone);
    }
    const options = {
      subscriberbot: contact.id
    }
    
    leadCapture = await leadService.findAll(options)
    if(!leadCapture){
     const leadData = {
      name: taskData ? taskData.name : taskPosVenda.body.name,
      phone,
      subscriberbot: contact.id,
      customFields
    };
     leadCapture = await leadService.create(leadData);
    } else {
      leadCapture = leadCapture[0];
    } 


    const taskDataPosVenda = {
      id: taskPosVenda.body.id,
      name: taskPosVenda.body.name,
      listId: Number(taskPosVenda.body.list.id),
      status: taskPosVenda.body.status.status,
      data: taskPosVenda.body,
      leadId: leadCapture.id
    };

    // Só cria taskDataCloser se encontrou task no getTasksCustom
    if (taskData) {
      const taskDataCloser = {
        id: taskData.id,
        name: taskData.name,
        listId: Number(taskData.list.id),
        status: taskData.status.status,
        data: taskData,
        leadId: leadCapture.id
      };
      await taskService.bulkCreate([taskDataPosVenda, taskDataCloser]);
    } else {
      await taskService.bulkCreate([taskDataPosVenda]);
    }

    // Prazo de entrega (opcional)
    const prazoField = getField(customFields, '⚠️ Prazo de Entrega');
    const prazoOpts  = getSelectedArray(prazoField);
    const dataEntrega:any = prazoOpts[0] ?? 0;
    let modelsFirst = modelsFirtsContact
    let messages:any
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
      ? (messages as { modelo: string; message: string; messageBot?: string }[]).filter((m: { modelo: string }) => m.modelo !== 'ENTREGA VIA TRANSPORTADORA')
      : (messages as { modelo: string; message: string; messageBot?: string }[]).filter((m: { modelo: string }) => m.modelo !== 'CLIENTE RETIRA');
   }

    const messagesData = messages.map((m: any) => ({
      title: m.modelo,
      message_text: m.message,
      sent: true,
      leadId: leadCapture.id
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

     const ownCategory = getField(customFields ?? [], '⚠️ Categoria do Ganho');
      const categoryOpts = getSelectedArray(ownCategory);
      const category = categoryOpts[0];
   


   if(category === 'RECOMPRA') {
    const options = {
    leadId: leadCapture.id
    }
      await sendMessage(leadCapture.subscriberbot, 'text', messages.find((message: { modelo: string; }) => message.modelo === 'RESPONSÁVEL PELO PÓS-VENDA (01° CONTATO)').message)
      await sendMessage(leadCapture.subscriberbot, 'text', messages.find((message: { modelo: string; }) => message.modelo === 'ENTREGA VIA TRANSPORTADORA')?.message || messages.find((message: { modelo: string; }) => message.modelo === 'CLIENTE RETIRA').message)
      await deleteTag(leadCapture.subscriberbot, 15282954)
      await addTag(leadCapture.subscriberbot, 15282955)
      
      clienteRetira
      ? await clickupServices.updateTask(taskDataPosVenda.id, 'cliente retira', '', 170448045 )
      : await clickupServices.updateTask(taskDataPosVenda.id, 'envio do closet', '', 170448045 )
    } else {
    await sendHook(contact.phone, req.body.task_id, messages, customDataBotString, messagesHistory);
   }
    
    return leadCapture;
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
      let messagesSchadule: any = [];
      if (dataEntrega) {
        const dates = calculateTriggerDates(dataEntrega);
        messagesSchadule = messagesReturn(firsName, modelsSchadules, dataEntrega, dates.ninetyTwoDaysAfter);
      }

      // Diretas
      let messagesPosDirect:any = messagesReturn(firsName, modelsDirect, dataEntrega);

      // Cliente Retira (filtra mensagem de entrega)
      const retiraField = getField(leadCustom?.customFields ?? [], '⚠️ Cliente Retira');
      const retiraOpts = getSelectedArray(retiraField);
      const clienteRetira = retiraOpts.includes('Sim');
      if (clienteRetira || !dataEntrega) {
        messagesPosDirect = messagesPosDirect.filter((m: { modelo: string; }) => m.modelo !== 'INFORMAÇÕES DA ENTREGA');
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
          const botMsg = messagesReturn(firsName, [m.title], dataEntrega)?.[0]?.messageBot ?? m.message_text;
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
    console.log(messagesToSend)
    // Processa todas as mensagens em paralelo
    await Promise.all(messagesToSend.map(async (message) => {
      // Busca histórico de mensagens enviadas
     const sentMessages = await messageService.findByLeadId(message.leadId);

const messagesHistory = [
  ...sentMessages.filter((m: any) => m.sent),
  message
]
  .map((m: any) => {
    const firstName = utils.extractFirstName(message.leadposvenda.name);
    const prazo = message.leadposvenda.customFields
      .find((field: { fieldName: string }) => field.fieldName === "⚠️ Prazo de Entrega")
      ?.selectedOptions || 0;

    const res = messagesReturn(firstName, [m.title], prazo);
    const content =
      Array.isArray(res) && res.length > 0 && res[0]?.messageBot
        ? res[0].messageBot
        : (message.message_text ?? "");

    return `role: assistant,\ncontent: ${content}`;
  })
  .join('\n');

      // Envia a mensagem
      //await shcadulesMessagesender(message.leadposvenda.phone, message.message_text, messagesHistory);

       const messageHistoryId  = getCustomFieldId('messagehistory')
   
       await setCustomFieldValue(Number(message.leadposvenda.subscriberbot), messageHistoryId[0].id, messagesHistory)
       await sendMessage(Number(message.leadposvenda.subscriberbot), "text", message.message_text)
       await utils.delay(5000);
        const status = treatMessageType(message.title);
      if(message.title === 'FOLLOW-UP 02 - RECEBEU O CLOSET' || message.title === 'FOLLOW-UP 02 - BUSCOU O CLOSET'){
        await sendMessage(Number(message.leadposvenda.subscriberbot), "file", mediaMessages[6])
      }
        if(message.title === 'ANIVERSÁRIO - INÍCIO DO MÊS'){
            if (!status) return;
        const phoneField = getField(message.leadposvenda?.customFields ?? [], '👤 Telefone Cliente');
        const phoneOpts = getSelectedArray(phoneField);
        const taskCreated = await clickupServices.cliCkupTask(901111606565 ,message.leadposvenda.name, status, undefined, phoneOpts[0])
        await sendMessage(Number(message.leadposvenda.subscriberbot), "file", mediaMessages[7])

         const taskDataPosVenda = {
      id: taskCreated.id,
      name: message.leadposvenda.name,
      listId: 901111606565,
      status: status,
      data: taskCreated,
      leadId: message.leadposvenda.id
    };
        await taskService.create(taskDataPosVenda)
        messageService.update(message.id, { sent: true })
        return
      }
      if(message.title === 'ANIVERSÁRIO - NO DIA' || message.title === 'ANIVERSÁRIO - FINAL DO MÊS'){
        const taskToUpdate = message.leadposvenda.tasks.find(
        (task: { listId: string }) => task.listId === '901111606565'
      )?.id;
      messageService.update(message.id, { sent: true })
      if(!taskToUpdate || !status) return
      const taskUpdated = await clickupServices.updateTask(taskToUpdate, status)
      await Promise.all([
        taskService.update(taskUpdated.id, {
          status: taskUpdated.status.status,
          data: taskUpdated
        }),
        
      ]);
       return
      }
      
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


export async function sendMedia(subscriber: string): Promise<any> {
    try {
      for(let i = 0; i <= mediaPre.length - 1; i++){
        await sendMessage(Number(subscriber), "file", mediaPre[i])
        await utils.delay(2000);
      }
      return 'videos enviados';
    } catch (error) {
      console.error('Erro ao buscar chaves por padrão:', error);
      throw new Error('Falha ao buscar chaves no Redis');
    }
}


export async function botStop(task_id: string, summary:string): Promise<any> {
    try {
       const leadToHelp:any = await taskService.findById(task_id, true)
       if(!leadToHelp) return

       const leadToHelpData = ` 
        Cliente precisa de ajuda
        nome: ${leadToHelp.lead.name},
        telefone: ${leadToHelp.lead.phone},
        task_id: ${task_id},
        summary: ${summary}
       `
        console.log(leadToHelpData)
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
          const messagesSent = messagesReturn(firsName, [m.title], dataEntrega)?.[0].messageBot ?? m.message_text;
          return `\n   role: assistant,\n   content: ${messagesSent}\n    `;
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
    const messagesSchadule:any = messagesReturn(firsName, modelsSchadules, dataEntrega, dates.ninetyTwoDaysAfter)

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
          const messagesSent = messagesReturn(firsName, [m.title], dataEntrega)?.[0].messageBot ?? m.message_text;
          return `\n   role: assistant,\n   content: ${messagesSent}\n    `;
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


       let messagesfirst:any = messagesReturn(firsName, modelsFirtsContact, dataEntrega);
      const alvo = clienteRetira ? 'CLIENTE RETIRA' : 'ENTREGA VIA TRANSPORTADORA';

// Mantém SOMENTE a opção desejada (case-insensitive) e garante array
const selecionadas = messagesfirst.filter(
  (m: any) => (m?.modelo ?? '').toUpperCase() === alvo
);

// Se quiser garantir exatamente um item:
       messagesfirst = selecionadas.length ? [selecionadas[0]] : [];
          let FirstContact: any[] = []
       
       for (const message of messagesfirst ?? []) {
        messageData = treatMessageDate(message, dataEntrega, leadCustom);
        if (messageData) FirstContact.push(messageData);
      } 
      allMessages = FirstContact

      let messagesPosDirect:any = messagesReturn(firsName, modelsDirect, dataEntrega);
       let directMessages: any[] = []
        if (clienteRetira) {
        messagesPosDirect = messagesPosDirect.filter((m: { modelo: string; }) => m.modelo !== 'INFORMAÇÕES DA ENTREGA');
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
          const messagesSent = messagesReturn(firsName, [m.title], dataEntrega)?.[0].messageBot ?? m.message_text;
          return `\n   role: assistant,\n   content: ${messagesSent}\n    `;
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


export async function followUpLost(status:string){
try{
  let options = {
    status: status,
    listId: 901108902340,
    includeLead: true
  }

  let followUps:any
  if(status === 'follow-up 1'){
   followUps = await taskService.findAll(options)
  console.log(followUps)
  for(const leadFollow of followUps){
    await sendMessage(leadFollow.lead.subscriberbot, 'text', `Bom dia ${leadFollow.lead.name}, tudo bem?`)
     await new Promise((resolve) => setTimeout(resolve, 3000));
    await sendMessage(leadFollow.lead.subscriberbot, 'text', `Kemoel do Time da Closet Home aqui. O que você achou dos nossos closets, fazem sentido para o que você está precisando?`)
     await new Promise((resolve) => setTimeout(resolve, 3000));
     await sendMessage(leadFollow.lead.subscriberbot, 'file', `${mediaPre[5]}`)
     const options = {
      taskId: leadFollow.id,
      subscriberId: leadFollow.lead.subscriberbot,
      followUpMessage: FOLLOW_UP_MESSAGE
     }
     await scheduleFollowUpIfInactive(options)
  }
  }
  if(status === 'follow-up 2'){
    followUps = await taskService.findAll(options)
    for(const leadFollow of followUps){
      await sendMessage(leadFollow.lead.subscriberbot, 'text', `Bom dia ${leadFollow.lead.name}, tudo bem?`)
         const options = {
      taskId: leadFollow.id,
      subscriberId: leadFollow.lead.subscriberbot,
      followUpMessage: FOLLOW_UP_MESSAGE
     }
     await scheduleFollowUpIfInactive(options)
    }
  }
    if(status === 'follow-up 3'){
    followUps = await taskService.findAll(options)
    for(const leadFollow of followUps){
      await sendMessage(leadFollow.lead.subscriberbot, 'text', `Olá! Não estou conseguindo uma resposta sua. Estou a disposição para te ajudar, você ainda quer seguir com este atendimento?`)
         const options = {
      taskId: leadFollow.id,
      subscriberId: leadFollow.lead.subscriberbot,
      followUpMessage: FOLLOW_UP_MESSAGE
     }
     await scheduleFollowUpIfInactive(options)
    }
  }
  if(status === 'follow-up 4'){
    followUps = await taskService.findAll(options)
    for(const leadFollow of followUps){
      await sendMessage(leadFollow.lead.subscriberbot, 'text', `Oi ${leadFollow.lead.name}, tudo bem? Como não tivemos retorno por aqui, vamos encerrar esse atendimento por agora 😕`)
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await sendMessage(leadFollow.lead.subscriberbot, 'text', `Se em algum momento você quiser retomar ou tiver interesse em seguir com o projeto, é só me chamar por aqui. Estarei à disposição!`)
    }
  }
  return followUps
} catch (error) {
  console.error('followUpLost error:', error)
  return null
}
}