import './app.js';
import { sequelize } from './db.js';
import './modules/associations.js'
import posvendaMessages from './services/posvendaMessages'
import {cronJobMessages} from './services/cronJobMessages.js'
import utils from './utils/utils';



async function main() {
    console.log('🎯 Sistema de Email Marketing ClosetHome iniciado!');
    console.log('📊 Dashboard disponível em: http://localhost:3000');
     await sequelize.authenticate()
    // await sequelize.sync({alter:true});
   
   const req1 = {
    body: {
      task_id:'868f3mt0t'
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
   }))
  */
cronJobMessages()
}

main().catch(console.error);
