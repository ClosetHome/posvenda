
import { extractBilling } from '../utils/extractWocommerce';
import {getSubscriber, sendMessage} from '../services/botconversaService'
import utils from '../utils/utils'
import PosVendaLeadsService from './posvendaLeads';
import {getTasksCustom, updateTaskCustomField2, updateTaskCustomField, updateTask} from '../services/clickupServices'
import TaskService from './taskService';
import PosVendaMessagesService from './posvendaMessages';

const leadService = new PosVendaLeadsService()
const taskService = new TaskService()
const posVendaMessagesService = new PosVendaMessagesService()
export async function ProccessOrder(data: any) {
  let cor
  try {
    if (data.status !== 'processed' && data.status !== 'processing') return;
    const { billingAddress, normalizedPhone } = extractBilling(data);
    if (!normalizedPhone) return;

    const last8 = utils.last8DigitsPhone(normalizedPhone);
    const options = { phone: last8, includeTasks: true };

    const lead: any[] = await leadService.findAll(options);
    if (!lead?.length) return;

    const subscriber = lead[0].subscriberbot;
    let task = lead[0].tasks?.find((t: any) => t.listId === 901108902349);

    if (!task) {
      const tasks = await getTasksCustom(901108902349, normalizedPhone);
      task = tasks?.[0];
    }
    if (!task) return;

    const daqui10dias = utils.timestampPlusDays();
    
    cor = data.line_items.sku.include('BR')?'a39d1e36-7b54-4238-acfb-9e41dfc285fe':'f89ca60b-5a59-4f26-8fdf-17a8a4b54a2d';

    await updateTaskCustomField(task.id, 'c15d7e46-1e1b-4e84-bafa-8a5c8a5f1fa2', '2bbc9f5e-997c-460c-9c5d-7c3715826a67');
    await updateTaskCustomField2(task.id, 'c7e757be-20aa-47b6-b3e7-7c6e466ffc5e', '34130af9-a24f-4295-973f-76b74c4b9851');
    await updateTaskCustomField2(task.id, '35718d99-a871-42e6-9afc-92153c9d6647', cor);
    await updateTaskCustomField2(task.id, '592bfb7c-bae8-4ed2-a38d-c3ee3895a7a2', data.total);
    await updateTaskCustomField2(task.id, 'de23f8da-1e59-438f-b48f-fa861538e2c2', daqui10dias, true);

    await updateTask(task.id, 'venda');

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

 const objmsg1 = {
  title: 'MENSAGEM 1 ECOMMERCE',
  message_text: message1,
  sent:true,
  leadId: lead[0].id,
 }

  const objmsg2 = {
  title: 'MENSAGEM 2 ECOMMERCE',
  message_text: message2,
  sent:true,
  leadId: lead[0].id,
 }
  await posVendaMessagesService.bulkCreate([objmsg1, objmsg2]);

    return message2;
  } catch (error: any) {
    console.log(error.message);
    return null;
  }
}
