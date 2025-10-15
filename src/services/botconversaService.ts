import axios from 'axios';
import dotenv from 'dotenv';
import PosVendaLeadsService from './posvendaLeads'
import TaskService from './taskService'
import {historyCreate, query, dadosPedido, query2} from './FlowiseService'
import {botStop} from './ClickupposVendaservice'
import {getTasksCustom, clickup} from './clickupServices'
import {prompt_coleta_dados, prompt_pre, follow_prompt} from '../utils/createhumanMessagePrompt'
import {scheduleFollowUpIfInactive, clearFollowUpTimer} from './followupTimer'
import utils from '../utils/utils';

export let FOLLOW_UP_MESSAGE = 'Vamos dar sequencia? por favor responda e pergunta solicitada';
const DEFAULT_INACTIVITY_MS_2 = 1440 * 60 * 1000;

dotenv.config();
const leadService = new PosVendaLeadsService()
const taskService = new TaskService()

const  bot_key = process.env.BOT_CONVERSA_TOKEN as string

export async function getSubscriber(phone: string) {
  const encodedPhone = encodeURIComponent(phone);
try{
const response = await axios.get(
  `https://backend.botconversa.com.br/api/v1/webhook/subscriber/get_by_phone/${encodedPhone}/`,
  {
    headers: {
      'accept': 'application/json',
      'API-KEY': bot_key
    }
  }
);

return response.data;
} catch(error:any){
  console.log(error.message)
  return null
}
}


export async function createSubscriber(phone: string, firtName:string, lastName:string) {
  try{
  const data = {
    phone: phone,
    first_name: firtName ?? "",
    last_name: lastName ?? "none"
  }

const response = await axios.post(
  `https://backend.botconversa.com.br/api/v1/webhook/subscriber/`,
  data,
  {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'API-KEY': bot_key
    }
  }
);

return response.data;
} catch(error:any){
  console.log(error.message)
  return null
}
}

export async function sendMessage(subscriber: number, type:string, value:string): Promise<any> {
  try{
    const data = {
        "type": type,
        "value": value
    }

const response = await axios.post(
  `https://backend.botconversa.com.br/api/v1/webhook/subscriber/${subscriber}/send_message/`,
  data,
  {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'API-KEY': bot_key
    }
  }
);


return response.data;
}catch(error:any){
  console.log(error.message)
  return null
}
}

export async function sendHook(phone: string, task_id:string , messages:any[], customFields:string, messageHistory:string) {
  try{
let data = {}
let url
   if(!messages.find((message) => message.modelo === '')){
   data = {
    "phone": phone,
    "task_id": task_id,
    "message_1": messages.find((message) => message.modelo === 'RESPONSÁVEL PELO PÓS-VENDA (01° CONTATO)').message,
    "message_3": messages.find((message) => message.modelo === 'DADOS PARA CADASTRO').message,
    "message_4": messages.find((message) => message.modelo === 'CUPOM ESPECIAL').message,
    "message_5": customFields,
    "messageHistory": messageHistory
   }

  url = `https://new-backend.botconversa.com.br/api/v1/webhooks-automation/catch/150860/5ik8HZQcD3bI/`
   
   } else {
    data = {
        "phone": phone,
        "task_id": task_id,
        "message_1": messages.find((message) => message.modelo === 'RESPONSÁVEL PELO PÓS-VENDA (01° CONTATO)').message,
        "message_2": messages.find((message) => message.modelo === 'ENTREGA VIA TRANSPORTADORA')?.message || messages.find((message) => message.modelo === 'CLIENTE RETIRA').message,
        "message_3": messages.find((message) => message.modelo === 'DADOS PARA CADASTRO').message,
        "message_4": messages.find((message) => message.modelo === 'CUPOM ESPECIAL').message,
        "message_media": messages.find((message) => message.modelo === '').message,
        "message_5": customFields,
        "messageHistory": messageHistory
    }
     url = `https://new-backend.botconversa.com.br/api/v1/webhooks-automation/catch/150860/0oVuhB6JMDjG/`
   }

const response = await axios.post(
  url,
  data,
  {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
);
return response;
 }catch(error:any){
  console.log(error.message)
  return null
}
}


export async function sendHookSegundaEtapa(phone: string, messages:any[], messageHistory:string) {
  try{
    const data = {
        "phone": phone,
        "messageTutorial": messages.find((message) => message.modelo === 'TUTORIAL MONTAGEM').message,
        "messageInfoEntrega": messages.find((message) => message.modelo === 'INFORMAÇÕES DA ENTREGA')?.message || 'não entrega',
        "messageGarantia": messages.find((message) => message.modelo === 'GARANTIA VITALÍCIA').message,
        "messageHistory": messageHistory
    }

const response = await axios.post(
  `https://new-backend.botconversa.com.br/api/v1/webhooks-automation/catch/150860/wL8EF884C8Gf/`,
  data,
  {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      //'API-KEY': bot_key
    }
  }
);

return response.data;
} catch(error:any){
  console.log(error.message)
  return null
}
}

export async function respChat(phone: string, message: string, task_id?:any ) {
  console.log(task_id)
 try{
  const task:any = await taskService.findById(task_id, true)
  
const conversationHistory = await historyCreate(task.lead)
console.log(conversationHistory)

const info_pedido = dadosPedido(task.lead)
console.log(info_pedido)
  const data = {
  question: message,
  overrideConfig:  {
        sessionId: phone,
        // ChatPromptTemplate variables should be passed via promptValues
        promptValues: {
            historico_mensagens: conversationHistory,
            info_pedido: info_pedido
        },
  },
}

  const response = await query(data)
 
const respostaUser = JSON.parse(response.text)
 console.log(respostaUser)
 const status = respostaUser.status
 const summary = respostaUser.summary
const subscriberId = Number(task.lead.subscriberbot);
  if(status === 'failure' || status === 'success' && summary && task_id != undefined){
        console.log(status)
        console.log(summary)
        console.log(task_id)
        await botStop(task_id, summary)
       // await deleteTag(subscriberId, 15296727)
      }

function getDelayTime(messageText: string): number {
  const wordCount = messageText.trim().split(/\s+/).length;
  const baseDelay = 1000;
  const delayPerWord = 400;
  const maxDelay = 5000;

  const delayTime = Math.min(baseDelay + wordCount * delayPerWord, maxDelay);
  return delayTime;
}



 const splitMessages = respostaUser.message.split(/(?:\n\s*\n|(?<=[.?!])\s+)/);
 console.log(splitMessages.length)
for (const messageText of splitMessages) {
        const formattedMessageText = messageText.trim();
    
        const finalPunctuation = /[.]$/;
        const formattedMessageTextWithoutPunctuation = formattedMessageText.replace(finalPunctuation, '');
            const data2 = {
        "type": 'text',
        "value": messageText
    }
       const response2 = await axios.post(
  `https://backend.botconversa.com.br/api/v1/webhook/subscriber/${subscriberId}/send_message/`,
  data2,
  {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'API-KEY': bot_key
    }
  }
);
      
        const delayTime = getDelayTime(formattedMessageTextWithoutPunctuation);
        await new Promise((resolve) => setTimeout(resolve, delayTime));
      }


return response
} catch(error:any) {
  console.log(error.message)
  return ''
}}

export async function shcadulesMessagesender(phone: string, message: string, messagehistory:string) {
  
   const data = {
    "phone": phone,
    "message": message,
    "messageHistory": messagehistory
   }

   try{
   const response = await axios.post(
  `https://new-backend.botconversa.com.br/api/v1/webhooks-automation/catch/150860/m6DdAhyiEcjx/`,
  data,
  {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
     // 'API-KEY': bot_key
    }
  }
);
return message
} catch(error) {
  console.log(error)
  return ''
}
}


export async function sendMessagesWithDelay(
subscriber: number,
messages: Array<string | undefined>,
type: string = 'text',
intervalMs: number = 3000
): Promise<void> {
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
for (let i = 0; i < messages.length; i++) {
const value = messages[i];
// Skip undefined/empty messages (e.g., missing "INFORMAÇÕES DA ENTREGA")
if (typeof value !== 'string' || value.trim().length === 0) continue;

try {
await sendMessage(subscriber, type, value);
} catch (err) {
// Log and continue with the next message
console.error('sendMessagesWithDelay error:', err);
}

// Wait 3s before the next message (no wait after the last one)
if (i < messages.length - 1) {
await delay(intervalMs);
}
}
}

export async function setCustomFieldValue(subscriber:number, custom_field_id:number, value:string){
 
  try{
  const data = {
    value: value
  }

const response = await axios.post(
  `https://backend.botconversa.com.br/api/v1/webhook/subscriber/${subscriber}/custom_fields/${custom_field_id}/`,
  data,
  {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'API-KEY': bot_key
    }
  }
);

return response.data;
} catch(error:any){
  console.log(error.message)
  return null
}
}


export async function deleteTag(subscriber: number, tag:number): Promise<any> {
  try{
const response = await axios.delete(
  `https://backend.botconversa.com.br/api/v1/webhook/subscriber/${subscriber}/tags/${tag}/`,
  {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'API-KEY': bot_key
    }
  }
);


return response.data;
}catch(error:any){
  console.log(error.message)
  return null
}
}


export async function addTag(subscriber: number, tag:number): Promise<any> {
  const data ={}
  try{
const response = await axios.post(
  `https://backend.botconversa.com.br/api/v1/webhook/subscriber/${subscriber}/tags/${tag}/`,
  data,
  {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'API-KEY': bot_key
    }
  }
);


return response.data;
}catch(error:any){
  console.log(error.message)
  return null
}
}

export async function sendMessagesWithDelayFlowise(
subscriber: number,
messages: Array<any | undefined>,
type: string = 'text',
intervalMs: number = 3000,
phone:string
): Promise<void> {
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
for (let i = 0; i < messages.length; i++) {
const value = messages[i].message;
// Skip undefined/empty messages (e.g., missing "INFORMAÇÕES DA ENTREGA")
if (typeof value !== 'string' || value.trim().length === 0) continue;
if(messages[i].modelo === ''){ await sendMessage(subscriber, 'file', value)
   continue;
  }
try { 
  const data = {
  question: '',
  overrideConfig:  {
        sessionId: phone,
        // ChatPromptTemplate variables should be passed via promptValues
        promptValues: {
            prompt: 'retorne exatamente a mensagem que vem do user, ela é parte de um grupo de mensagens automáticas padrão.',
            info_pedido: '',
            text: value
        },
  },
}
const response = await query(data)
await sendMessage(subscriber, type, response.text);
} catch (err) {
console.error('sendMessagesWithDelay error:', err);
}

// Wait 3s before the next message (no wait after the last one)
if (i < messages.length - 1) {
await delay(intervalMs);
}
}
}


async function dispatchFollowUpMessage(
  subscriberId: number,
  type: string,
  value: string,
  taskId?: any,
  fim?: any
) {
  if (!value) return;

  await sendMessage(subscriberId, type, value);

  if (!taskId) return;

if(fim) {
  await scheduleFollowUpIfInactive({
    taskId: String(taskId),
    subscriberId,
    followUpMessage: fim,
    inactivityMs: DEFAULT_INACTIVITY_MS_2
  });
} else {
  await scheduleFollowUpIfInactive({
    taskId: String(taskId),
    subscriberId,
    followUpMessage: FOLLOW_UP_MESSAGE
  });
}
}

export async function respChatPre(phone: string, message: string, task_id?:any ) {  
  let taskData: any = null;
  let firstName:any;
  let lastName:any;
  let subscriberId:any
  let taskPre:any
 try{
 taskPre = await taskService.findById(task_id, true)
if(!taskPre) {
    taskPre = await clickup.tasks.get(task_id);
     let phone: string | undefined =
      taskPre?.body?.custom_fields
        ?.find((f: any) => f?.name === '👤 Telefone Cliente')
        ?.value;
       console.log(taskPre.body)
    if (!phone) return [];
          taskData = taskPre.body;
          firstName = utils.extractFirstName(taskPre.name);
          lastName = utils.extractLastName(taskPre.name);
        phone = phone.replace(/[^\d+]/g, '');
      let contact = await getSubscriber(phone);
    if (!contact) contact = await createSubscriber(phone, firstName, lastName);
    if(contact.status === 200){
      contact = await getSubscriber(phone);
    }
      const leadData = {
      name: taskData ? taskData.name : taskPre.body.name,
      phone,
      subscriberbot: contact.id
    };
    const leadCreated = await leadService.create(leadData);
    subscriberId = contact.id
       taskData = {
        id: taskData.id,
        name: taskData.name,
        listId: Number(taskData.list.id),
        status: taskData.status.status,
        data: taskData,
        leadId: leadCreated.id
      };
     subscriberId = contact.id
     await taskService.bulkCreate([taskData]);
} else { 
 subscriberId = Number(taskPre.lead.subscriberbot);
}

  const data = {
  question: message,
  overrideConfig:  {
        sessionId: subscriberId,
        systemMessage: prompt_pre,
        vars: {
            task_id: task_id,
            telefone: phone
        }
        },
 }
 const response = await query(data)
 console.log(response)

const responseText = typeof response?.text === 'string' ? response.text : '';
let isJsonText = false;
let parsedJson: any;

function getDelayTime(messageText: string): number {
  const wordCount = messageText.trim().split(/\s+/).length;
  const baseDelay = 1000;
  const delayPerWord = 400;
  const maxDelay = 5000;
  const delayTime = Math.min(baseDelay + wordCount * delayPerWord, maxDelay);
  return delayTime;
}

if (responseText) {
  try {
    parsedJson = JSON.parse(responseText);
    isJsonText = true;
  } catch {
    isJsonText = false;
  }
}

if(!isJsonText) {
const splitMessages = responseText ? responseText.split(/(?:\n\s*\n|(?<=[.?!])\s+)/) : [];
for (const messageText of splitMessages) {
        const formattedMessageText = messageText.trim();
    
        const finalPunctuation = /[.]$/;
        const formattedMessageTextWithoutPunctuation = formattedMessageText.replace(finalPunctuation, '');
     
        await dispatchFollowUpMessage(subscriberId, 'text', messageText, task_id)
      
        const delayTime = getDelayTime(formattedMessageTextWithoutPunctuation);
        await new Promise((resolve) => setTimeout(resolve, delayTime));
      }
    } else {
      if (parsedJson.message_personalizado) {
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.message_personalizado, task_id)
        await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.message_medidas, task_id)
        await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'file', parsedJson.video, task_id)
        await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.especialista2, task_id)
       if (task_id) await clearFollowUpTimer(String(task_id));
        await addTag(subscriberId, 12805127)
    } else if(parsedJson.message_1) {
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.message_1, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'file', parsedJson.video, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.message_2, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'file', parsedJson.image, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'file', parsedJson.image2, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'file', parsedJson.image3, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.message_3, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.message_menu, task_id)
    }
  }

return {
  ...response,
  isJsonText,
  parsedJson
}

} catch(error:any) {
  console.log(error.message)
  return ''
  }
}


export async function respChatPrefollow1(phone: string, message: string, task_id?:any ){
try{
 const taskPre:any = await taskService.findById(task_id, true)
 let subscriberId = taskPre?.lead.subscriberbot
 const data = {
  question: message,
  overrideConfig:  {
        sessionId: subscriberId,
        systemMessage: follow_prompt,
        vars: {
            task_id: task_id,
            telefone: phone
        }
        },
 }
 const response = await query2(data)
  console.log(response)

const responseText = typeof response?.text === 'string' ? response.text : '';
let isJsonText = false;
let parsedJson: any;
function getDelayTime(messageText: string): number {
  const wordCount = messageText.trim().split(/\s+/).length;
  const baseDelay = 1000;
  const delayPerWord = 400;
  const maxDelay = 5000;

  const delayTime = Math.min(baseDelay + wordCount * delayPerWord, maxDelay);
  return delayTime;
}

if (responseText) {
  try {
    parsedJson = JSON.parse(responseText);
    isJsonText = true;
  } catch {
    isJsonText = false;
  }
}
if(!isJsonText) {
const splitMessages = responseText ? responseText.split(/(?:\n\s*\n|(?<=[.?!])\s+)/) : [];
for (const messageText of splitMessages) {
        const formattedMessageText = messageText.trim();
    
        const finalPunctuation = /[.]$/;
        const formattedMessageTextWithoutPunctuation = formattedMessageText.replace(finalPunctuation, '');
     
        await dispatchFollowUpMessage(subscriberId, 'text', messageText, task_id)
      
        const delayTime = getDelayTime(formattedMessageTextWithoutPunctuation);
        await new Promise((resolve) => setTimeout(resolve, delayTime));
      }
    } else {
      if (parsedJson.message_personalizado) {
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.message_personalizado, task_id)
        await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.message_medidas, task_id)
        await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'file', parsedJson.video, task_id)
        await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.agradecimento, task_id)
        await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.especialista2, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'text',parsedJson.espero_receber, task_id)
        await addTag(subscriberId, 12805127)
    } else if(parsedJson.message_1) {
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.message_1, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'file', parsedJson.video, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.message_2, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'file', parsedJson.image, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'file', parsedJson.image2, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'file', parsedJson.image3, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.message_3, task_id)
       await new Promise((resolve) => setTimeout(resolve, 3000));
       await dispatchFollowUpMessage(subscriberId, 'text', parsedJson.message_menu, task_id)
    }
  }
return response
} catch(error:any) {
  console.log(error.message)
  return ''
}}
