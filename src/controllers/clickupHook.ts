import { webHook, sendMedia, botFail, taskUpdatedHook} from "../services/ClickupposVendaservice";
import {respChat} from '../services/botconversaService'
import {Request, Response} from 'express'

export async function clickupHook(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'webhook recebido' }); // ACK imediato
    void webHook(req); // executa fora do ciclo da resposta
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao processar webhook' });
  }
}

export async function clickupHookMedias(req: Request, res: Response) {
  const { task_id } = req.body ?? {};
  try {
    res.status(200).json({ message: 'medias enviadas' });
    void sendMedia(task_id);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao enviar mídias' });
  }
}

export async function clickupHookFail(req: Request, res: Response) {
  const { task_id, summary } = req.body ?? {};
  try {
    res.status(200).json({ message: 'notificação enviada' });
    void botFail(task_id, summary);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Erro ao enviar notificação' });
  }
}

export async function clickupHookChat(req: Request, res: Response) {
  const { phone, message } = req.body ?? {};
  try {
    res.status(200).json({ message: 'mensagem enviada' });
    void respChat(phone, message);
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
