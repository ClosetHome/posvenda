import { webHook, sendMedia, botStop, taskUpdatedHook} from "../services/ClickupposVendaservice";
import clickupServices from "../services/clickupServices";
import {respChat, respChatPre, respChatPrefollow1} from '../services/botconversaService'
import {Request, Response} from 'express'
import TaskService from '../services/taskService'
import axios from 'axios'
const taskService = new TaskService()

export async function clickupHook(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'webhook recebido' }); // ACK imediato
    void webHook(req); // executa fora do ciclo da resposta
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao processar webhook' });
  }
}

export async function clickupHookMedias(req: Request, res: Response) {
  const { subscriber} = req.body ?? {};
  try {
    res.status(200).json({ message: 'medias enviadas' });
    void sendMedia(subscriber);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao enviar mídias' });
  }
}

export async function clickupHookFail(req: Request, res: Response) {
  const { task_id, summary } = req.body ?? {};
  try {
    res.status(200).json({ message: 'notificação enviada' });
    void botStop(task_id, summary);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao enviar notificação' });
  }
}

export async function clickupHookChat(req: Request, res: Response) {
  const { phone, message, task_id } = req.body ?? {};
  try {
    res.status(200).json({ message: 'mensagem enviada' });
    void respChat(phone, message, task_id);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao enviar mensagem' });
  }
}

export async function clickupTaskUpdatedHook(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'webhook recebido' }); // ACK imediato
    void taskUpdatedHook(req); // executa fora do ciclo da resposta
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao processar webhook' });
  }
}


export async function clickupHookChatPre(req: Request, res: Response) {
  const { phone, message, task_id } = req.body ?? {};
  try {
    res.status(200).json({ message: 'mensagem enviada' });
    void respChatPre(phone, message, task_id);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao enviar mensagem' });
  }
}


export async function clickupHookUpdatePre(req: Request, res: Response) {
  const { telefone, situacao, taskID, atendimento } = req.body ?? {};
  try {
     res.status(200).json({ message: 'atualizado' });
 void clickupServices.updateClickupPre(telefone, situacao, taskID, atendimento)

  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao enviar mensagem' });
  }
}

export async function clickupHookChatPreFollow(req: Request, res: Response) {
  const { phone, message, task_id } = req.body ?? {};
  try {
    res.status(200).json({ message: 'mensagem enviada' });
    void respChatPrefollow1(phone, message, task_id);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao enviar mensagem' });
  }
}


