import cron from 'node-cron';
import {verifyScheduledMessages} from './ClickupposVendaservice'



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
