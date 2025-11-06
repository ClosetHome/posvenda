import cron, { ScheduledTask } from 'node-cron';
import {verifyScheduledMessages, followUpLost} from './ClickupposVendaservice'
import {blackNovember} from './botconversaService'
import PosVendaMessages from './posvendaMessages';
import { DateTime } from 'luxon';


const posvendaMessages = new PosVendaMessages();

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

export  async function scheduleMessagesByTitle(title: string): Promise<void> {
 const scheduledJobs = new Map<number, ScheduledTask>(); 
  const timezone = 'America/Sao_Paulo';
  const messages = await posvendaMessages.findByTitleBlack(title);

  const now = DateTime.now().setZone(timezone);
   messages.forEach(message => {
    if (!message.schadule) return;

    const runAt = DateTime.fromJSDate(message.schadule, { zone: timezone });
    if (!runAt.isValid || runAt <= now) return;

    const cronExp = `${runAt.second} ${runAt.minute} ${runAt.hour} ${runAt.day} ${runAt.month} *`;

    const existing = scheduledJobs.get(message.id);
    if (existing) existing.stop();

    console.log(
  `[Scheduler] Mensagem agendada`,
  {
    id: message.id,
    title: message.title,
    lead: message.leadposvenda?.id,
    execucao: runAt.toISO(),
    cron: cronExp,
  }
);

    const task = cron.schedule(
      cronExp,
      async () => {
        try {
          await blackNovember(message.leadposvenda.subscriberbot, message);
        } finally {
          task.stop();
          scheduledJobs.delete(message.id);
        }
      },
      { timezone }
    );

    scheduledJobs.set(message.id, task);
  });
}