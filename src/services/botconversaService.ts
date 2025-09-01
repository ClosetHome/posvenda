import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

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

export async function sendHook(phone: string, task_id:string ,messages:any[], customFields:string, messageHistory:string) {
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
return response.data;
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

export async function respChat(phone: string, message: string) {
   const data = {
    "phone": phone,
    "message": message,
   }
   try{
   const response = await axios.post(
  `https://new-backend.botconversa.com.br/api/v1/webhooks-automation/catch/150860/4NRVIGfvGY1t/`,
  data,
  {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
     // 'API-KEY': bot_key
    }
  }
);
return response
} catch(error) {
  console.log(error)
  return ''
}
}

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
