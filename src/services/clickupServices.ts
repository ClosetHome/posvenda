import  {Clickup}  from '@damotech/clickup';
import dotenv from 'dotenv';
import axios from 'axios';
import utils from '../utils/utils';
import {messagesReturn, treatMessageType, treatMessageDate, treatMessageBirthday, modelsDirect, modelsFirtsContact, modelsAniversary, modelsSchadules } from './clickupMessages'
import {getSubscriber, sendMessage, sendHook, addTag} from './botconversaService'
import TaskService from './taskService'
import {clearFollowUpTimer} from './followupTimer'
import {getField, getSelectedArray} from './ClickupposVendaservice'
dotenv.config();

const clickup_key = process.env.CLICKUP_TOKEN as string
export const clickup = new Clickup(clickup_key)
const taskService = new TaskService()

interface EmailBatchResult {
  total: number;
  success: number;
  errors: number;
  stopped: boolean;
  stopReason?: string;
  results: Array<{
    leadId: string;
    email: string;
    status: 'success' | 'error';
    error?: string;
  }>;
}

export async function updateTask(taskId:string, status?:string, description?: string, assingeTo?:number, ecommerce?:string) {
  
  let taskData: any = {};
  let customFields: any[] = [];

  if(status) {
    taskData.status = status
  }
    
   if(description) {
    taskData.description = description
   }
    if(assingeTo){
      taskData.assignees = { add: [assingeTo] };
    }
    if(ecommerce){
       customFields.push({
        id: "c15d7e46-1e1b-4e84-bafa-8a5c8a5f1fa2",
        value: [ecommerce]
      });
    }

     if (customFields.length > 0) {
      taskData.custom_fields = customFields;
    }
    try{
    const response:any = await clickup.tasks.update(taskId, taskData);
  return response.body
} catch(error){
    console.log(error);
}
}

export async function updateTaskCustomField(taskId:string, field_id:string, label_id?:any) {
  

  const data = {value:[label_id]}

    try{
    const response:any = await clickup.tasks.addCustomFieldValue(taskId, field_id, data);
  return response.body
} catch(error){
    console.log(error);
}
}


async function cliCkupTask(listId: number, name:string, status: string ,email?: string, telefone?: string, descricao?: string, category?:string, linkReference?:string, telefoneSdr?:string ) {
  
      try {
    // Objeto base da requisição
    const taskData: any = {
      name: name,
      status: status
    };

    // Array para custom_fields (só adiciona se houver pelo menos um campo)
    const customFields: any[] = [];

    // Adiciona email se fornecido
    if (email) {
      customFields.push({
        value: email,
        id: '4d36dbd0-a7f9-4aa3-a413-e15535d85add'
      });
    }

    // Adiciona telefone se fornecido
    if (telefone) {
      customFields.push({
        id: '7ac04885-0d22-454d-abcd-a8dbc8c814b7',
        value: telefone
      });
    }
       if (telefoneSdr) {
      customFields.push({
        id: '329ee3ef-c499-47fb-a66d-6a407a3222cb',
        operator: 'ANY',
        value: telefoneSdr
      });
    }

    if(category){
       customFields.push({
        id: "c15d7e46-1e1b-4e84-bafa-8a5c8a5f1fa2",
        value: [category]
      });
    }

    if(linkReference){
      taskData.links_to = linkReference
    }

    if (descricao) {
      taskData.description = descricao;
    }

    // Só adiciona custom_fields se houver campos
    if (customFields.length > 0) {
      taskData.custom_fields = customFields;
    }

    // Só adiciona description se fornecida
   

    const response: any = await clickup.lists.createTask(listId, taskData);
    return response.body
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
  }
}


 async function getTasks(status: string) {
    const stat = status.replace(' ', '%20')
    let tasks: any = []
    let contatos: any = []
    let page = 0
    let stop = false
    
    while (!stop) {
        const options = {
            method: 'GET',
            url: `https://api.clickup.com/api/v2/list/901107847949/task?page=${page}&reverse=false&statuses=${stat}&statuses=concluido`,
            headers: {
                accept: 'application/json',
                Authorization: clickup_key
            }
        };
        
        try {
            const response = await axios.request(options);
            
        
              for(const lead of response.data.tasks){
                const info = utils.extractCompanyInfo(lead.description);
                const contato = {
                 id: lead.id,
                 name:lead.name,
                 owner: info.socios,
                 city: info.cidade,
                 state: info.estado,
                 status: lead.status.status,
                 email: lead.custom_fields.find((field:any) => field.name === "Email").value,
                 phone: lead.custom_fields.find((field:any) => field.name === "Numero").value,
                 description: lead.description,
                 lastUpdate: lead.date_updated,
                 data: lead
                }
         
                contatos.push(contato)
              }

            
            // Use spread operator ou concat para concatenar as arrays
            tasks = [...tasks, ...response.data.tasks]
            // Alternativa: tasks = tasks.concat(response.data.tasks)
            
       
            
            if (response.data.tasks.length < 100) {
                stop = true
            }
            page++
        } catch (error) {
            console.log(error);
            break; // Adicione break para sair do loop em caso de erro
        }
    }
    
    return tasks
}

async function cliCkupTaskGet(listId: number, name?:string, status?: string ,email?: string, telefone?: string, descricao?: string, chatEcom?: number, linkReference?:string, telefoneSdr?:string ) {
  
      try {
    // Objeto base da requisição
    const taskData: any = {};

    // Array para custom_fields (só adiciona se houver pelo menos um campo)
    const customFields: any[] = [];

    // Adiciona email se fornecido
    if (email) {
      customFields.push({
        value: email,
        id: '4d36dbd0-a7f9-4aa3-a413-e15535d85add'
      });
    }

    // Adiciona telefone se fornecido
    if (telefone) {
      customFields.push({
        id: "329ee3ef-c499-47fb-a66d-6a407a3222cb",
        value: telefone
      });
    }
      // if (telefoneSdr) {
      customFields.push({
        field_id: '329ee3ef-c499-47fb-a66d-6a407a3222cb',
        operator: 'ANY',
        value: "+5547988078451"
      });
   // }

    if(chatEcom){
       customFields.push({
        id: 'e5d18511-9c48-4c01-bcba-f4ae6120e623',
        value: chatEcom
      });
    }

    if(linkReference){
      taskData.links_to = linkReference
    }

    if (descricao) {
      taskData.description = descricao;
    }

    // Só adiciona custom_fields se houver campos
    if (customFields.length > 0) {
      taskData.custom_fields = customFields;
    }

    // Só adiciona description se fornecida
   

    const response: any = await clickup.lists.getTasks(listId, taskData);
    return response.body
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
  }
}
 async function getTasksCreate(status: string) {
    const stat = status.replace(' ', '%20')
    let contatos: any = []
    let page = 0
    let stop = false
    
    while (!stop) {
        const options = {
            method: 'GET',
            url: `https://api.clickup.com/api/v2/list/901107847949/task?page=${page}&reverse=false&statuses=${stat}&statuses=concluido`,
            headers: {
                accept: 'application/json',
                Authorization: clickup_key
            }
        };
        
        try {
            const response = await axios.request(options);
            
            
              for(const lead of response.data.tasks){
                const info = utils.extractCompanyInfo(lead.description);
                const contato = {
                 id: lead.id,
                 name:lead.name,
                 owner: info.socios,
                 city: info.cidade,
                 state: info.estado,
                 status: lead.status.status,
                 email: lead.custom_fields.find((field:any) => field.name === "Email").value,
                 phone: lead.custom_fields.find((field:any) => field.name === "Numero").value,
                 description: lead.description,
                 lastUpdate: utils.convertTimestampToDate(lead.date_updated),
                 data: lead
                }
           
                contatos.push(contato)
              }

            
            if (response.data.tasks.length < 100) {
                stop = true
            }
            page++
        } catch (error) {
            console.log(error);
            break; // Adicione break para sair do loop em caso de erro
        }
    }
    
    return contatos
}

export async function getTasksCustom(listId:number ,phone?:string) {
    try {
        if (!phone) {
            console.log('⚠️ Telefone não fornecido para busca');
            return [];
        }

        const response: any = await clickup.lists.getTasks(listId, {
            custom_fields: `[{"field_id":"329ee3ef-c499-47fb-a66d-6a407a3222cb","operator":"=","value":"${phone}"}]`,
            include_closed: 'true'
        });

        // Verificar se há tasks válidas
        const tasks = response.body?.tasks || [];
        console.log(`📞 Busca por telefone ${phone}: ${tasks.length} task(s) encontrada(s)`);
        
        // Retornar apenas tasks válidas (não undefined)
        return tasks.filter((task: any) => task && task.id);
        
    } catch (error) {
        console.error('❌ Erro ao buscar tasks por telefone:', error);
        return [];
    }
}



export async function webHook(req:any){
  try{
   
   const response:any = await clickup.tasks.get(req.body.task_id);
   const phone:any = utils.formatPhoneNumberFlexible(response.body.custom_fields.find((field: { name: string; }) => field.name === "👤 Telefone Cliente")?.value)
   const task = await getTasksCustom(901108902349, phone)

  if(task.length === 0){
     return [];
  }

   const customFields = task[0].custom_fields.map((customField: { value:any; type_config: { options: any[]; }; type: string; id: any; name: any; }) => {
  
  let selectedOptions = [];
  if (customField.value && !customField.type_config?.options) {
 
    const custom = {
    fieldId: customField.id,
    fieldName: customField.name,
    fieldType: customField.type,
    selectedOptions: customField.value
    }
    if(customField.type === 'date'){
      const data:any = utils.convertTimestampToDate(customField.value)
       custom.selectedOptions = data
  }
       
      return custom
  }
  // Para campos do tipo "labels" (value é array de IDs)
  if (customField.type === "labels" && Array.isArray(customField.value)) {
    selectedOptions = customField.type_config.options.filter((option) =>
      customField.value.includes(option.id)
    );
  }
  // Para campos do tipo "drop_down" (value é índice numérico)
  else if (customField.type === "drop_down" && typeof customField.value === "number") {
    const selectedOption = customField.type_config.options[customField.value];
    if (selectedOption) {
      selectedOptions = [selectedOption];
    }
  }
  return selectedOptions.length > 0 ? {
    fieldId: customField.id,
    fieldName: customField.name,
    fieldType: customField.type,
    selectedOptions: selectedOptions
  } : null;
}).filter(Boolean);

  let obj:any = {
            id: req.body.task_id,
            name: task[0].name,
            owner: task[0].assignees[0]?.username || task[0].watchers[0]?.username || 'assistente',
            customFields: customFields
          }

  const contact = await getSubscriber(phone)
  const dataEntrega = obj.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Prazo de Entrega")?.selectedOptions || 0
  
 let messages:any = messagesReturn(task[0].name, modelsFirtsContact, dataEntrega)
 
  messages = customFields.find((field: { fieldName: string; }) => field.fieldName === '⚠️ Cliente Retira')
   ? messages.filter((msg: { modelo: string; }) => msg.modelo !== 'ENTREGA VIA TRANSPORTADORA')
   : messages.filter((msg: { modelo: string; }) => msg.modelo !== 'CLIENTE RETIRA');
  await sendHook(contact.phone, obj.id,messages, '', '')
return obj
//redis.set(`clickup:${req.body.task_id}`, JSON.stringify(req.body))
} catch(error){
 console.log(error);
        return [];
}
}

async function updateClickupPre(telefone: string, situacao: string, taskID: string, atendimento: string) {
  const normalizedTaskId = String(taskID);
  let payload: any;
  let cachedTask: any = null;
  let category: string | null = null;

  try {
    payload = {
      taskID: normalizedTaskId,
      situacao,
      telefone
    };

    console.log(payload);

    if (atendimento !== 'perdido') {
      payload.atendimento = 'personalizado'
    }

    if (atendimento === 'ecommerce' || atendimento !== 'perdido') {
      cachedTask = await taskService.findById(normalizedTaskId, true);
    }
       let phone: string | undefined =
      cachedTask?.data?.custom_fields
        ?.find((f: any) => f?.name === '👤 Telefone Cliente')
        ?.value;

    if (atendimento === 'ecommerce' && cachedTask?.lead?.subscriberbot) {
      await addTag(cachedTask.lead.subscriberbot, 12804161);
      category = '2bbc9f5e-997c-460c-9c5d-7c3715826a67';
    }

    if (atendimento !== 'perdido' && cachedTask?.lead?.subscriberbot) {
      await addTag(cachedTask.lead.subscriberbot, 12805127);
    }
    if(atendimento === 'perdido' && cachedTask?.lead?.subscriberbot) {
      await addTag(cachedTask.lead.subscriberbot, 12804129);
    }

    console.log(payload);

    await axios.post(
      'https://webhooks.closethome.com.br/webhook/alteracaosdr',
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
   


    const updatedTask = await taskService.update(normalizedTaskId, { status: situacao });
    if (!updatedTask) {
      console.warn(`Task ${normalizedTaskId} not found for status update.`);
      return;
    }

    console.log(updatedTask.name);
    console.log(telefone);
    console.log(category);
       await new Promise((resolve) => setTimeout(resolve, 10000));
    if (situacao === 'ganho' && atendimento === 'ecommerce' && category) {
    const taskCloser = await getTasksCustom(901108902349, phone);
    await updateTaskCustomField(taskCloser[0].id, 'c15d7e46-1e1b-4e84-bafa-8a5c8a5f1fa2', category );
    }
  } catch (error: any) {
    console.log(error.message);
  } finally {
    if (taskID) {
      
      await clearFollowUpTimer(normalizedTaskId);
    }
  }
}

export default {getTasks, getTasksCreate, cliCkupTask, updateTask, cliCkupTaskGet, getTasksCustom, webHook, updateClickupPre}
