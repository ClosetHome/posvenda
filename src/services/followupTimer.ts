import { redis } from '../db.js';
import TaskService from './taskService';
import { sendMessage } from './botconversaService.js';
import clickupServices from './clickupServices';
import {addTag} from './botconversaService'
import {respChatPrefollow1} from './botconversaService'

const FOLLOW_UP_CACHE_PREFIX = 'followup:lastMessage';
const DEFAULT_INACTIVITY_MS = 10 * 60 * 1000; // 10 minutos
const DEFAULT_INACTIVITY_MS_2 = 120 * 60 * 1000;

const taskService = new TaskService();
const activeTimers = new Map<string, NodeJS.Timeout>();

export interface FollowUpOptions {
  taskId: string;
  subscriberId: number;
  followUpMessage: string;
  inactivityMs?: number;
}

interface FollowUpCacheEntry {
  lastInteractionAt: number;
  attempts: number;
}

function normalizeStatus(status: string | undefined): string {
  if (!status) return '';
  return status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function buildCacheKey(taskId: string): string {
  return `${FOLLOW_UP_CACHE_PREFIX}:${taskId}`;
}

async function readCacheEntry(taskId: string): Promise<FollowUpCacheEntry | null> {
  const raw = await redis.get(buildCacheKey(taskId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as FollowUpCacheEntry;
    if (typeof parsed.lastInteractionAt !== 'number' || typeof parsed.attempts !== 'number') {
      throw new Error('invalid follow-up cache payload');
    }
    return parsed;
  } catch {
    await redis.del(buildCacheKey(taskId));
    return null;
  }
}

async function writeCacheEntry(taskId: string, entry: FollowUpCacheEntry): Promise<void> {
  await redis.set(buildCacheKey(taskId), JSON.stringify(entry));
}

export async function scheduleFollowUpIfInactive(options: FollowUpOptions): Promise<void> {
  const {
    taskId,
    subscriberId,
    followUpMessage,
    inactivityMs = DEFAULT_INACTIVITY_MS
  } = options;

  if (!taskId) {
    throw new Error('taskId is required to schedule the follow-up.');
  }

  if (!subscriberId) {
    throw new Error('subscriberId is required to schedule the follow-up.');
  }

  if (!followUpMessage) {
    throw new Error('followUpMessage is required to schedule the follow-up.');
  }
   
  const now = Date.now();
  const currentEntry = await readCacheEntry(taskId);
  const entry: FollowUpCacheEntry = {
    lastInteractionAt: now,
    attempts: currentEntry ? currentEntry.attempts : 0
  };
  await writeCacheEntry(taskId, entry);

  const currentTimer = activeTimers.get(taskId);
  if (currentTimer) {
    clearTimeout(currentTimer);
  }

  const timerHandle = setTimeout(async () => {
    activeTimers.delete(taskId);
     let statusUpdate:string = ''
    try {
      const latestEntry = await readCacheEntry(taskId);
      if (!latestEntry) return;

      const inactiveFor = Date.now() - latestEntry.lastInteractionAt;
      if (inactiveFor < inactivityMs) return;

      const task:any = await taskService.findById(taskId, true);
      if (!task) return;

      const status = normalizeStatus(task.status);
      if (status.includes('novo lead')){
        statusUpdate = 'follow-up 1'
      }
      if (status.includes('follow-up 1')){
        statusUpdate = 'follow-up 2'
      }
      if (status.includes('follow-up 2')){
        statusUpdate = 'follow-up 3'
      }
      if (status.includes('follow-up 3')){
        statusUpdate = 'follow-up 4'
      }
        
        if(followUpMessage === 'fim') {
        await clickupServices.updateClickupPre(task.lead.phone, 'perdido', taskId, 'perdido');
        await clearFollowUpTimer(String(taskId));
        await addTag(subscriberId, 12804129)
        return;
      }
      
      //await sendMessage(subscriberId, 'text', followUpMessage);

      if(followUpMessage === 'Hum... Parece que você não está disponível agora. Voltaremos a conversar em breve!') {
        await sendMessage(subscriberId, 'text', followUpMessage);
        await clearFollowUpTimer(String(taskId));
        await addTag(subscriberId, 12804129)
        await addTag(subscriberId, 15658601)
        const task = await clickupServices.updateTask(taskId, statusUpdate, `lead para ${statusUpdate}`, undefined)
        await taskService.update(task.id, {
          status: task.status.status,
          data: task
        })
        return;
      }
      await respChatPrefollow1(task.lead.phone, 'Crie uma mensagem de follow-up para insentivar o usuario a continuar o atendimento de onde parou. Essa mensagem não é do cliente, é instrução do sistema. Responda somente a mensagem de follow-up.', taskId)
      const options ={
        taskId,
        subscriberId,
        followUpMessage: 'Hum... Parece que você não está disponível agora. Voltaremos a conversar em breve!',
        inactivityMs: DEFAULT_INACTIVITY_MS_2
      }

     await scheduleFollowUpIfInactive(options)
     return

     /*
      if(latestEntry.attempts === 1){
       message = 'Hum... Parece que você não está disponível agora. Vou encerrar a conversa, mas para retomar o atendimento é só chamar novamente. Até breve. 🧡'
       await sendMessage(subscriberId, 'text', message);
       await clearFollowUpTimer(String(taskId));
      } else {
      await sendMessage(subscriberId, 'text', followUpMessage);

      const updatedEntry: FollowUpCacheEntry = {
        lastInteractionAt: Date.now(),
        attempts: latestEntry.attempts + 1
      };
      await writeCacheEntry(taskId, updatedEntry);
      }*/
    } catch (error) {
      console.error(`Erro ao processar follow-up para a task ${taskId}:`, error);
    }
  }, inactivityMs);

  activeTimers.set(taskId, timerHandle);
}

export async function clearFollowUpTimer(taskId: string): Promise<void> {
  const timer = activeTimers.get(taskId);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(taskId);
  }

  await redis.del(buildCacheKey(taskId));
}

export async function getLastFollowUpTimestamp(taskId: string): Promise<number | null> {
  const entry = await readCacheEntry(taskId);
  return entry ? entry.lastInteractionAt : null;
}

export async function getFollowUpAttempts(taskId: string): Promise<number> {
  const entry = await readCacheEntry(taskId);
  return entry ? entry.attempts : 0;
}

export function isFollowUpTimerActive(taskId: string): boolean {
  return activeTimers.has(taskId);
}
