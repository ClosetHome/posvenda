import './app.js';
import { sequelize } from './db.js';
import './modules/associations.js'
import posvendaMessages from './services/posvendaMessages'
import {cronJobMessages} from './services/cronJobMessages.js'
import {mediaMessages} from './services/clickupMessages.js'
import utils from './utils/utils';
import {webHook, getMessageBot} from './services/ClickupposVendaservice'



async function main() {
    console.log('🎯 Sistema de Email Marketing ClosetHome iniciado!');
    console.log('📊 Dashboard disponível em: http://localhost:3000');
     await sequelize.authenticate()
    // await sequelize.sync({alter:true});
   /*
   const req1 = {
    body: {
      task_id:'868faxc2u'
    },
   }*/
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
  // const resArray = [req1/*, req3, req2, req4, req5*/]
/*
   await Promise.all(resArray.map(async (req) => {
    await webHook(req)
   }))
    */
   
/*  getMessageBot('868faxc2u', `
Nome completo: Jeruza Freitas Weber
Data de Nascimento: 06/08/1980
CPF: 032.857.489-90
Telefone: 47 997478424
E-mail: jeruzaw@hotmail.com
Cidade: Joinville
Bairro: Glória
Rua: Colon
Número: 575
CEP: 89216-400`)
*/
cronJobMessages()

}

main().catch(console.error);
