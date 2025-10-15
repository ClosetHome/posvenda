import cron from 'node-cron';
import {verifyScheduledMessages, followUpLost} from './ClickupposVendaservice'



export async function cronJobMessages(){

 cron.schedule('0 0 9 * * *', async () => {
      console.log('🔄 Iniciando processamento automático de leads do e-commerce...');
      
      try {
        const result = await verifyScheduledMessages();
        
        if (result) {
          console.log('✅ Processamento de leads do e-commerce concluído com sucesso!');
        } else {
          console.log('⚠️ Processamento de leads do e-commerce finalizado com alguns erros.');
        }
      } catch (error) {
        console.error('❌ Erro no processamento automático de leads do e-commerce:', error);
      }
    }, {
      timezone: "America/Sao_Paulo" // Ajuste para seu timezone
    });

    console.log('📅 Cron job configurada para executar diariamente às 09:00 (America/Sao_Paulo)');
  }


  export async function cronJobMessagesFollowup1(){

 cron.schedule('0 0 10 * * 1-5', async () => {
      console.log('🔄 Iniciando processamento automático de leads do e-commerce...');
      
      try {
        const result = await followUpLost('follow-up 1');
        
        if (result) {
          console.log('✅ Processamento de leads do e-commerce concluído com sucesso!');
        } else {
          console.log('⚠️ Processamento de leads do e-commerce finalizado com alguns erros.');
        }
      } catch (error) {
        console.error('❌ Erro no processamento automático de leads do e-commerce:', error);
      }
    }, {
      timezone: "America/Sao_Paulo" // Ajuste para seu timezone
    });

    console.log('📅 Cron job configurada para executar diariamente às 09:00 (America/Sao_Paulo)');
  }

    export async function cronJobMessagesFollowup2(){

 cron.schedule('0 0 11 * * 1-5', async () => {
      console.log('🔄 Iniciando processamento automático de leads do e-commerce...');
      
      try {
       const result = await followUpLost('follow-up 2');
        
        if (result) {
          console.log('✅ Processamento de leads do e-commerce concluído com sucesso!');
        } else {
          console.log('⚠️ Processamento de leads do e-commerce finalizado com alguns erros.');
        }
      } catch (error) {
        console.error('❌ Erro no processamento automático de leads do e-commerce:', error);
      }
    }, {
      timezone: "America/Sao_Paulo" // Ajuste para seu timezone
    });

    console.log('📅 Cron job configurada para executar diariamente às 09:00 (America/Sao_Paulo)');
  }

    export async function cronJobMessagesFollowup3(){

 cron.schedule('0 0 16 * * 1-5', async () => {
      console.log('🔄 Iniciando processamento automático de leads do e-commerce...');
      
      try {
        const result = await followUpLost('follow-up 3');
        
        if (result) {
          console.log('✅ Processamento de leads do e-commerce concluído com sucesso!');
        } else {
          console.log('⚠️ Processamento de leads do e-commerce finalizado com alguns erros.');
        }
      } catch (error) {
        console.error('❌ Erro no processamento automático de leads do e-commerce:', error);
      }
    }, {
      timezone: "America/Sao_Paulo" // Ajuste para seu timezone
    });

    console.log('📅 Cron job configurada para executar diariamente às 09:00 (America/Sao_Paulo)');
  }


    export async function cronJobMessagesFollowup4(){

 cron.schedule('0 0 17 * * 1-5', async () => {
      console.log('🔄 Iniciando processamento automático de leads do e-commerce...');
      
      try {
        const result = await followUpLost('follow-up 4');
        
        if (result) {
          console.log('✅ Processamento de leads do e-commerce concluído com sucesso!');
        } else {
          console.log('⚠️ Processamento de leads do e-commerce finalizado com alguns erros.');
        }
      } catch (error) {
        console.error('❌ Erro no processamento automático de leads do e-commerce:', error);
      }
    }, {
      timezone: "America/Sao_Paulo" // Ajuste para seu timezone
    });

    console.log('📅 Cron job configurada para executar diariamente às 09:00 (America/Sao_Paulo)');
  }
