import './app.js';
import { sequelize } from './db.js';
import './modules/associations.js'
import {cronJobMessages, cronJobMessagesFollowup1, cronJobMessagesFollowup2, cronJobMessagesFollowup3, cronJobMessagesFollowup4} from './services/cronJobMessages.js'
import {verifyScheduledMessages, webHook, followUpLost} from './services/ClickupposVendaservice.js'
import messagesMigration from './migrations/20250926-add-attachment-fields-to-posvendamessages.js'
import clickupServices from './services/clickupServices.js';
import { updateTaskCustomField } from './services/clickupServices.js';



async function main() {
    console.log('🎯 Sistema de Email Marketing ClosetHome iniciado!');
    console.log('📊 Dashboard disponível em: http://localhost:3000');
     await sequelize.authenticate()
   //  await sequelize.sync({alter:true});
   
   const req1 = {
    body: {
      task_id:'8868f84aj3'
    },
   }
/*
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
   
*/
  const resArray = [req1/*, req3, req2, req4, req5*/]
/*
   await Promise.all(resArray.map(async (req) => {
    await webHook(req)
   }))*/
    
  //clickupServices.updateClickupPre('+55 51 98349674', 'ganho', '868fz1y5f', 'ecommerce')
//followUpLost('follow-up 3')

cronJobMessages()
cronJobMessagesFollowup1()
cronJobMessagesFollowup2()
cronJobMessagesFollowup3()
cronJobMessagesFollowup4()


//messagesMigration.up(sequelize.getQueryInterface())

}

main().catch(console.error);
