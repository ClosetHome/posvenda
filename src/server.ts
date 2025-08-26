import './app.js';
import { sequelize } from './db.js';
import './modules/associations.js'
import {webHook, verifyScheduledMessages} from './services/ClickupposVendaservice.js';
import { extrairDadosPessoais } from './utils/dataExtractor';
import {calculateTriggerDates} from './utils/dateCalculator';
import {sendMessage, sendHook, respChat, shcadulesMessagesender} from './services/botconversaService.js'
import posvendaMessages from './services/posvendaMessages'
import {messagesReturn} from './services/clickupMessages.js'
import {cronJobMessages} from './services/cronJobMessages.js'
import utils from './utils/utils';

const messageService = new posvendaMessages()
async function teste(){
const sentMessages = await messageService.findSentMessages(true)
let messagesHistory:any = sentMessages.filter((message:any) => message.leadId === 37)
     .map((message:any) => {
    return `
   role: assistant,
   content: ${messagesReturn(utils.extractFirstName(message.leadposvenda.name), [message.title], message.leadposvenda.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Prazo de Entrega")?.selectedOptions || 0)[0].messageBot}
    `
     })  
    messagesHistory = messagesHistory.join('\n')
  console.log(messagesHistory)
}


async function main() {
    console.log('🎯 Sistema de Email Marketing ClosetHome iniciado!');
    console.log('📊 Dashboard disponível em: http://localhost:3000');
     await sequelize.authenticate()
    // await sequelize.sync({alter:true});
    // Funções comentadas - agora controladas pelo dashboard
    // dispararEmailPrimeiro('lista', 0)
    // dispararEmailFollowup('primeiro email', 'follow-up 1', 2, 0)
    // dispararEmailFollowup('follow-up 1', 'follow-up 2', 4, 1)
    // dispararEmailFollowup('follow-up 2', 'follow-up 3', 7, 2)
    // getTasks2('follow-up 1')
    // getTasksFollowups('primeiro email', 2)
  /* await emailSender(
  'Assunto do email',
  'Mensagem do email',
  'pilotumcx@gmail.com',
  {
    requestReadReceipt: true,
    requestDeliveryReceipt: true
  }
);*/
    //reqChat()
   /// GoogleGmailService.getSentMessagesWithReadStatus(4)
   // console.log('✅ Sistema pronto! Use o dashboard web para controlar as funções.');
   /*
   const req1 = {
    body: {
      task_id:'868f2d7hm'
    },
   }

    const req2 = {
    body: {
      task_id:'868f84aj3'
    },
   }
    const req3 = {
    body: {
      task_id:'868f3mzff'
    },
   }

     const req4 = {
    body: {
      task_id:'868f3mrfu'
    },
   }

     const req5 = {
    body: {
      task_id:'868f3mt0t'
    },
   }
   

   const resArray = [req1, req3/*, req2, req4, req5]*/
/*
   await Promise.all(resArray.map(async (req) => {
    await webHook(req)
   }))
  */
   //respChat('868f2d7hm', 'oi')

   //sendHook('+555198349674', '868f3mt0t', [])
  //const dates = calculateTriggerDates("15/08/2025")
 // console.log(dates)
//  verifyScheduledMessages()
 //const messages = ['https://1290f9d49292.ngrok-free.app/api/files/imagempos.jpg', 'https://1290f9d49292.ngrok-free.app/api/files/montagem1.mp4', 'https://1290f9d49292.ngrok-free.app/api/files/montagem2.mp4', 'https://1290f9d49292.ngrok-free.app/api/files/montagem3.mp4' ]
// sendMedia('+555198349674', messages)
//sendMessage(783947144, 'file', 'https://1290f9d49292.ngrok-free.app/api/files/montagem2.mp4')
//shcadulesMessagesender('+555198349674', 'oi', 'oi')
/*console.log(extrairDadosPessoais(`
Nome completo: Giovani Maciel, Data de Nascimento: 03/11/1995, CPF: 04038459047, Telefone: +55 51 9834-9674, E-mail: giovani.emp@gmail.com, Casa própria ou alugada: casa alugada, Cidade: Caxias do Sul, Bairro: universitario, Rua: Bangu, Número: 1726, CEP: 95040570.`))
*/
//teste()

cronJobMessages()
}

main().catch(console.error);
