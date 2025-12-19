
import { extractBilling } from '../utils/extractWocommerce';
import {getSubscriber, sendMessage} from '../services/botconversaService'
import utils from '../utils/utils'
import PosVendaLeadsService from './posvendaLeads';
import {getTasksCustom, updateTaskCustomField2, updateTaskCustomField, updateTask, createTaskClickup} from '../services/clickupServices'
import clickup from '../services/clickupServices'
import TaskService from './taskService';
import PosVendaMessagesService from './posvendaMessages';

const leadService = new PosVendaLeadsService()
const taskService = new TaskService()
const posVendaMessagesService = new PosVendaMessagesService()
export async function ProccessOrder(data: any) {
  let cor;
  let taskSdr: any[] = [];
  let taskCloser: any[] = [];
  try {
  //  if (data.status !== 'processing') return;
    const { billingAddress, normalizedPhone } = extractBilling(data);
    if (!normalizedPhone) return;
    const last8 = utils.last8DigitsPhone(normalizedPhone);
    const options = { phone: last8, includeTasks: true };

    const lead: any[] = await leadService.findAll(options);
    const leadData = Array.isArray(lead) && lead.length > 0 ? lead[0] : null;
   // if (!leadData) return;

    const leadTasks = leadData?.tasks || [];
    const leadTaskSdr = leadTasks.filter((t: any) => t.listId === 901108902340);
    const leadTaskCloser = leadTasks.filter((t: any) => t.listId === 901108902349);

    if (leadTaskSdr.length > 0) taskSdr = leadTaskSdr;
    if (leadTaskCloser.length > 0) taskCloser = leadTaskCloser;

    if (taskSdr.length === 0) {
      taskSdr = await getTasksCustom(901108902340, normalizedPhone);
    }

    if (taskSdr.length === 0) {
      const customFields = [
        {
          id: '329ee3ef-c499-47fb-a66d-6a407a3222cb',
          value: normalizedPhone
        }
      ];
      const payload = {
        list_id: 901108902340,
        taskData: {
          name: `${billingAddress.firstName} ${billingAddress.lastName}`,
          status: 'novo lead',
          custom_fields: customFields
        }
      };
      const createdSdr = await createTaskClickup(payload);
      console.log(createdSdr)
      if (createdSdr) {
        taskSdr = [createdSdr];
        await new Promise((resolve) => setTimeout(resolve, 10000));
        taskCloser = await getTasksCustom(901108902349, normalizedPhone);
      }
    }

    if (taskCloser.length === 0 && taskSdr.length > 0) {
      await clickup.updateClickupPre(normalizedPhone, 'encaminhado closer', taskSdr[0].id, 'ecommerce');
      await new Promise((resolve) => setTimeout(resolve, 10000));
      taskCloser = await getTasksCustom(901108902349, normalizedPhone);
    }

    if (taskCloser.length === 0) {
      const customFields = [
        {
          id: '329ee3ef-c499-47fb-a66d-6a407a3222cb',
          value: normalizedPhone
        }
      ];
      const payload = {
        list_id: 901108902349,
        taskData: {
          name: `${billingAddress.firstName} ${billingAddress.lastName}`,
          status: 'nova oportunidade',
          custom_fields: customFields
        }
      };
      const createdCloser = await createTaskClickup(payload);
      if (createdCloser) {
        taskCloser = [createdCloser];
      }
    }

    if (!taskCloser.length) return;

    const daqui10dias = utils.timestampPlusDays();
    const skuList = Array.isArray(data.line_items)
      ? data.line_items.map((item: any) => item?.sku || '').filter(Boolean)
      : [data?.line_items?.sku || ''];
    const hasBrSku = skuList.join('|').includes('BR');

    cor = hasBrSku ? 'a39d1e36-7b54-4238-acfb-9e41dfc285fe' : 'f89ca60b-5a59-4f26-8fdf-17a8a4b54a2d';
    const cliente_retira = data?.shipping_lines[0]?.method_id === "local_pickup" ? 'f69d4416-e67f-4e4c-a8f4-e5b7ac895f2a' : '34130af9-a24f-4295-973f-76b74c4b9851';

    await updateTaskCustomField(taskCloser[0].id, 'c15d7e46-1e1b-4e84-bafa-8a5c8a5f1fa2', '2bbc9f5e-997c-460c-9c5d-7c3715826a67');
    await updateTaskCustomField2(taskCloser[0].id, 'c7e757be-20aa-47b6-b3e7-7c6e466ffc5e', '34130af9-a24f-4295-973f-76b74c4b9851');
    await updateTaskCustomField2(taskCloser[0].id, '35718d99-a871-42e6-9afc-92153c9d6647', cor);
    await updateTaskCustomField2(taskCloser[0].id, '592bfb7c-bae8-4ed2-a38d-c3ee3895a7a2', data.total);
    await updateTaskCustomField2(taskCloser[0].id, 'c7e757be-20aa-47b6-b3e7-7c6e466ffc5e', cliente_retira);
    await updateTaskCustomField2(taskCloser[0].id, 'de23f8da-1e59-438f-b48f-fa861538e2c2', daqui10dias, true);

    const message1 = `Olá, ${billingAddress.firstName} . Sua compra foi realizada com sucesso!`;

    const message2 = `
 Para darmos continuidade na emissão da NF, poderia confirmar os dados a baixo.
 Nome Completo:${billingAddress.firstName} ${billingAddress.lastName},
 cidade: ${billingAddress.city},
 bairro: ${billingAddress.neighborhood},
 rua: ${billingAddress.address1},
 numero: ${billingAddress.number},
 cpf: ${billingAddress.cpf},
 email: ${billingAddress.email},
 data de nascimento: ${billingAddress.birthdate},
 telefone: ${billingAddress?.phone || billingAddress?.cellphone || 'Não informado'},
 cep: ${billingAddress.postcode},
 `;
/*
 const objmsg1 = {
  title: 'MENSAGEM 1 ECOMMERCE',
  message_text: message1,
  sent:true,
  leadId: leadData.id,
 }

  const objmsg2 = {
  title: 'MENSAGEM 2 ECOMMERCE',
  message_text: message2,
  sent:true,
  leadId: leadData.id,
 }*/
  //await posVendaMessagesService.bulkCreate([objmsg1, objmsg2]);
  await updateTask(taskCloser[0].id, 'venda');
    return message2;
  } catch (error: any) {
    console.log(error.message);
    return null;
  }
}
