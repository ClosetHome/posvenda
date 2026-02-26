
import { extractBilling, extractLineItems, extractPaymentInfo, extractShipping, selectPaymentCustomField } from '../utils/extractWocommerce';
import {createSubscriber, getSubscriber, sendMessage} from '../services/botconversaService'
import utils from '../utils/utils'
import PosVendaLeadsService from './posvendaLeads';
import {getTasksCustom, updateTaskCustomField2, updateTaskCustomField, updateTask, createTaskClickup} from '../services/clickupServices'
import clickup from '../services/clickupServices'
import TaskService from './taskService';
import PosVendaMessagesService from './posvendaMessages';
import brainService from './brainSideService'
import axios from 'axios';
import brainSideService from './brainSideService';

const leadService = new PosVendaLeadsService()
const taskService = new TaskService()
const posVendaMessagesService = new PosVendaMessagesService()
export async function ProccessOrder(data: any) {
  let cor;
  let taskSdr: any[] = [];
  let taskCloser: any[] = [];
  try {
    //if (data.status !== 'processing') return;
    const { billingAddress, normalizedPhone } = extractBilling(data);
    if (!normalizedPhone) return;
    const firstName = billingAddress?.firstName ?? '';
    const lastName = billingAddress?.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    const last8 = utils.last8DigitsPhone(normalizedPhone);
    const options = { phone: last8, includeTasks: true };

    const lead: any[] = await leadService.findAll(options);
    let leadData = Array.isArray(lead) && lead.length > 0 ? lead[0] : null;

    if (!leadData) {
      let contact = await getSubscriber(normalizedPhone);
      if (!contact) {
        const created = await createSubscriber(normalizedPhone, firstName, lastName);
        if (created?.id) {
          contact = created;
        } else if (created?.status === 200) {
          contact = await getSubscriber(normalizedPhone);
        }
      }

      const leadPayload: any = {
        name: fullName || `${billingAddress?.firstName} ${billingAddress?.lastName}` || 'Sem nome',
        phone: normalizedPhone,
        subscriberbot: contact?.id,
        email: billingAddress?.email,
        city: billingAddress?.city,
        neighborhood: billingAddress?.neighborhood,
        street: billingAddress?.address1,
        number: billingAddress?.number,
        cep: billingAddress?.postcode,
        cpf: billingAddress?.cpf
      };

      leadData = await leadService.create(leadPayload);
    } else if (!leadData.subscriberbot) {
      const contact = await getSubscriber(normalizedPhone);
      if (contact?.id) {
        await leadService.update(leadData.id, { subscriberbot: contact.id });
        leadData.subscriberbot = contact.id;
      }
    }
   

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
      await clickup.updateClickupPre(normalizedPhone, 'ganho', taskSdr[0].id, 'ecommerce');
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
    
  const paymentInfo = extractPaymentInfo(data);
  const items = extractLineItems(data);

  const produtos = items.map((item) => `produto:${item.name}\nquantidade:${item.quantity}\ntotal:${item.total}`).join('\n')
  const paymentField = selectPaymentCustomField(data);

 
  
    
    await updateTaskCustomField(taskCloser[0].id, 'c15d7e46-1e1b-4e84-bafa-8a5c8a5f1fa2', '2bbc9f5e-997c-460c-9c5d-7c3715826a67');
    await updateTaskCustomField2(taskCloser[0].id, 'c7e757be-20aa-47b6-b3e7-7c6e466ffc5e', '34130af9-a24f-4295-973f-76b74c4b9851');
    await updateTaskCustomField2(taskCloser[0].id, '35718d99-a871-42e6-9afc-92153c9d6647', cor);
    await updateTaskCustomField2(taskCloser[0].id, '592bfb7c-bae8-4ed2-a38d-c3ee3895a7a2', data.total);
    await updateTaskCustomField2(taskCloser[0].id, 'c7e757be-20aa-47b6-b3e7-7c6e466ffc5e', cliente_retira);
    await updateTaskCustomField2(taskCloser[0].id, 'de23f8da-1e59-438f-b48f-fa861538e2c2', daqui10dias, true);
    await updateTaskCustomField2(taskCloser[0].id, '4b8edb1b-13cd-41f3-a74d-f659ad09203c', paymentField.optionId);


    const safeText = (value: any, fallback = 'Nao informado') => {
      if (value === null || value === undefined) return fallback;
      const text = String(value).trim();
      return text.length > 0 ? text : fallback;
    };

    const message1 = `Ola, ${safeText(firstName, 'cliente')}! Sua compra foi realizada com sucesso!`;

    const message2 = 
      `Para darmos continuidade na emissao da NF, poderia confirmar os dados abaixo.
      Nome Completo: ${safeText(fullName, 'Nao informado')}
      cidade: ${safeText(billingAddress?.city)}
      bairro: ${safeText(billingAddress?.neighborhood)}
      rua: ${safeText(billingAddress?.address1)}
      numero: ${safeText(billingAddress?.number)}
      cpf: ${safeText(billingAddress?.cpf)}
      email: ${safeText(billingAddress?.email)}
      data de nascimento: ${safeText(billingAddress?.birthdate)}
      telefone: ${safeText(billingAddress?.phone || billingAddress?.cellphone || normalizedPhone)}
      cep: ${safeText(billingAddress?.postcode)}`
    

    const objmsg1 = {
      title: 'MENSAGEM 1 ECOMMERCE',
      message_text: message1,
      sent: true,
      leadId: leadData.id
    };

    const objmsg2 = {
      title: 'MENSAGEM 2 ECOMMERCE',
      message_text: message2,
      sent: true,
      leadId: leadData.id
    };

 //  await posVendaMessagesService.bulkCreate([objmsg1, objmsg2]);
 const descritpion = `
  produtos: ${produtos},
  desconto cupom: ${paymentInfo.couponDiscount},
  desconto pix: ${paymentInfo.pixDiscount},
  valor do frete: ${paymentInfo.shippingTotal}
  `
  const obj ={
      phone: normalizedPhone,
      name:fullName,
      message1: message1,
      message2: message2
    }

    await brainSideService.sendEcommerceBrain(obj)
    await updateTask(taskCloser[0].id, 'venda', descritpion);

    
    return message2;
  } catch (error: any) {
    console.log(error.message);
    return null;
  }
}




