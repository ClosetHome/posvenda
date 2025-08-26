import {getTasksCustom, clickup} from './clickupServices'
import clickupServices from './clickupServices.js';
import utils from '../utils/utils';
import {extrairDadosPessoais} from '../utils/dataExtractor';
import {getSubscriber, sendMessage, sendHook, sendHookSegundaEtapa, shcadulesMessagesender, createSubscriber} from './botconversaService'
import PosVendaLeadsService from './posvendaLeads'
import Tasks from './taskService'
import posvendaMessages from './posvendaMessages'

import {messagesReturn, treatMessageType, treatMessageDate, treatMessageBirthday, modelsDirect, modelsFirtsContact, modelsAniversary, modelsSchadules, mediaMessages } from './clickupMessages'
import { calculateTriggerDates } from '../utils/dateCalculator';

const leadService = new PosVendaLeadsService()
export const taskService = new Tasks()
const messageService = new posvendaMessages()

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
    const dataEntrega = prazoOpts[0] ?? 0;

    // Mensagens base
    let messages = messagesReturn(firstName, modelsFirtsContact, dataEntrega);

    // Cliente Retira
    const retiraField = getField(customFields, '⚠️ Cliente Retira');
    const retiraOpts  = getSelectedArray(retiraField);
    const clienteRetira = retiraOpts.includes('Sim');

    messages = clienteRetira
      ? messages.filter(m => m.modelo !== 'ENTREGA VIA TRANSPORTADORA')
      : messages.filter(m => m.modelo !== 'CLIENTE RETIRA');

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
    } else {
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

  export async function getMessageBot(phone: string, task_id:string, description:string): Promise<any> {

    let directMessages = []
    let schaduleMessages = []
    let aniversaryMessages = []
    let lead
    let messageData 
    let allMessages = []
    let extractedCadastro
    let messagesHistory:any 
    try {
      try {
    extractedCadastro = JSON.parse(description);
} catch {
    extractedCadastro = extrairDadosPessoais(description);
}
// console.log(extractedCadastro)
      const leadToUpdate:any = await taskService.findById(task_id)
       if(!leadToUpdate) return
       
      const updateLeadData = {
        city: extractedCadastro.cidade,
        email: extractedCadastro.email,
        neighborhood: extractedCadastro.bairro,
        street: extractedCadastro.rua,
        number: extractedCadastro.numero,
        cep: extractedCadastro.cep,
        cpf: extractedCadastro.cpf,
        birthday: extractedCadastro.dataDeNascimento ? utils.parseDate(extractedCadastro.dataDeNascimento) : null
      }
////update lead banco local e clickup
     const leadCustom:any = await leadService.update(leadToUpdate.leadId, updateLeadData)
       lead = leadCustom.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Cliente Retira").selectedOptions[0]?.name === "Sim"
       ? await clickupServices.updateTask(task_id, 'cliente retira', description, undefined )
       : await clickupServices.updateTask(task_id, 'envio do closet', description, undefined )

 //obtem mensagens       
    const firsName = utils.extractFirstName(leadCustom.name)
    const dataEntrega = leadCustom.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Prazo de Entrega")?.selectedOptions || 0
    const dates = calculateTriggerDates(dataEntrega)
    const messagesSchadule = messagesReturn(firsName, modelsSchadules, dataEntrega, dates.ninetyTwoDaysAfter)
    let messagesPosDirect = messagesReturn(firsName, modelsDirect, dataEntrega)
    ///envia mensagem botConversa
    
////criar mensagens de cadastro
 const clienteRetira:boolean = leadCustom.customFields.find((field: { fieldName: string }) => field.fieldName === "⚠️ Cliente Retira").selectedOptions[0]?.name === "Sim";
 if (clienteRetira) {
  messagesPosDirect = messagesPosDirect.filter(
    (msg) => msg.modelo !== "INFORMAÇÕES DA ENTREGA"
  );
}
 
      for(const message of messagesPosDirect){
      messageData = treatMessageDate(message, dataEntrega, leadCustom)
      if(messageData){
      directMessages.push(messageData)
      } else {
        continue
      }
    }

    for(const message of messagesSchadule){
      messageData = treatMessageDate(message, dataEntrega, leadCustom)
      if(messageData){
      schaduleMessages.push(messageData)
      } else {
        continue
      }
    }
    allMessages = directMessages.concat(schaduleMessages)
/// cria mensagens de aniversario
if(extractedCadastro.dataDeNascimento != undefined){
 const messagesBirthdayReturn = messagesReturn(firsName, modelsAniversary, undefined, extractedCadastro.dataDeNascimento)
     for(const message of messagesBirthdayReturn){
      messageData = treatMessageBirthday(message, extractedCadastro.dataDeNascimento, leadCustom)
      if(messageData){
     aniversaryMessages.push(messageData)
      } else {
        continue
        }
      }
      allMessages = allMessages.concat(aniversaryMessages)
    }
    //// bulk all messages

     const messagesCreated = await messageService.bulkCreate(allMessages)
     messagesHistory = await messageService.findByLeadId(leadToUpdate.leadId, true)
     messagesHistory = messagesHistory.filter((message:any) => message.sent === true)
     .map((message:any) => {
    return `
   role: assistant,
   content: ${messagesReturn(firsName, [message.title], dataEntrega)[0].messageBot}
    `
     })  
    messagesHistory = messagesHistory.join('\n')
    ////////
     await sendHookSegundaEtapa(leadCustom.phone, messagesPosDirect, messagesHistory)
      return lead;
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
      await shcadulesMessagesender(message.leadposvenda.phone, message.message_text, messagesHistory);

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