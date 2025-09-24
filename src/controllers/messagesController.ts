import { Request, Response } from 'express';
import PosVendaMessagesService from '../services/posvendaMessages.js';

const posVendaMessagesService = new PosVendaMessagesService();

export class MessagesController {
  /**
   * Criar uma nova mensagem pós-venda
   */
  async create(req: Request, res: Response) {
    try {
      const message = await posVendaMessagesService.create(req.body);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao criar mensagem pós-venda',
        message: error.message 
      });
    }
  }

  /**
   * Buscar todas as mensagens com filtros
   */
  async findAll(req: Request, res: Response) {
    try {
      const options = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        title: req.query.title as string,
        sent: req.query.sent === 'true' ? true : req.query.sent === 'false' ? false : undefined,
        leadId: req.query.leadId ? parseInt(req.query.leadId as string) : undefined,
        includeLead: req.query.includeLead === 'true',
        scheduledOnly: req.query.scheduledOnly === 'true',
        sentOnly: req.query.sentOnly === 'true',
      };

      const messages = await posVendaMessagesService.findAll(options);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar mensagens pós-venda',
        message: error.message 
      });
    }
  }

  /**
   * Buscar mensagem por ID
   */
  async findById(req: any, res: any) {
    try {
      const id = parseInt(req.params.id);
      const includeLead = req.query.includeLead !== 'false';
      
      const message = await posVendaMessagesService.findById(id, includeLead);
      
      if (!message) {
        return res.status(404).json({ error: 'Mensagem pós-venda não encontrada' });
      }

      res.json(message);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar mensagem pós-venda',
        message: error.message 
      });
    }
  }

  /**
   * Buscar mensagens por lead ID
   */
  async findByLeadId(req: Request, res: Response) {
    try {
      const leadId = parseInt(req.params.leadId);
      const includeLead = req.query.includeLead === 'true';
      
      const messages = await posVendaMessagesService.findByLeadId(leadId, includeLead);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar mensagens por lead',
        message: error.message 
      });
    }
  }

  /**
   * Buscar mensagens enviadas
   */
  async findSentMessages(req: Request, res: Response) {
    try {
      const includeLead = req.query.includeLead === 'true';
      const messages = await posVendaMessagesService.findSentMessages(includeLead);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar mensagens enviadas',
        message: error.message 
      });
    }
  }

  /**
   * Buscar mensagens pendentes
   */
  async findPendingMessages(req: Request, res: Response) {
    try {
      const includeLead = req.query.includeLead === 'true';
      const messages = await posVendaMessagesService.findPendingMessages(includeLead);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar mensagens pendentes',
        message: error.message 
      });
    }
  }

  /**
   * Buscar mensagens agendadas
   */
  async findScheduledMessages(req: Request, res: Response) {
    try {
      const includeLead = req.query.includeLead === 'true';
      const messages = await posVendaMessagesService.findScheduledMessages(includeLead);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar mensagens agendadas',
        message: error.message 
      });
    }
  }

  /**
   * Buscar mensagens agendadas para hoje
   */
  async findScheduledForToday(req: Request, res: Response) {
    try {
      const includeLead = req.query.includeLead === 'true';
      const messages = await posVendaMessagesService.findScheduledForToday(includeLead);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar mensagens agendadas para hoje',
        message: error.message 
      });
    }
  }

  /**
   * Atualizar mensagem por ID
   */
  async update(req: any, res: any) {
    try {
      const id = parseInt(req.params.id);
      const message = await posVendaMessagesService.update(id, req.body);
      
      if (!message) {
        return res.status(404).json({ error: 'Mensagem pós-venda não encontrada' });
      }

      res.json(message);
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao atualizar mensagem pós-venda',
        message: error.message 
      });
    }
  }

  /**
   * Marcar mensagem como enviada
   */
  async markAsSent(req: any, res: any) {
    try {
      const id = parseInt(req.params.id);
      const message = await posVendaMessagesService.markAsSent(id);
      
      if (!message) {
        return res.status(404).json({ error: 'Mensagem pós-venda não encontrada' });
      }

      res.json(message);
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao marcar mensagem como enviada',
        message: error.message 
      });
    }
  }

  /**
   * Agendar mensagem
   */
  async schedule(req: any, res: any) {
    try {
      const id = parseInt(req.params.id);
      const { scheduleDate } = req.body;
      
      if (!scheduleDate) {
        return res.status(400).json({ error: 'Data de agendamento é obrigatória' });
      }

      const message = await posVendaMessagesService.schedule(id, new Date(scheduleDate));
      
      if (!message) {
        return res.status(404).json({ error: 'Mensagem pós-venda não encontrada' });
      }

      res.json(message);
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao agendar mensagem',
        message: error.message 
      });
    }
  }

  /**
   * Deletar mensagem por ID
   */
  async delete(req: any, res: any) {
    try {
      const id = parseInt(req.params.id);
      const deleted = await posVendaMessagesService.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Mensagem pós-venda não encontrada' });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao deletar mensagem pós-venda',
        message: error.message 
      });
    }
  }

  /**
   * Contar mensagens
   */
  async count(req: Request, res: Response) {
    try {
      const options = {
        title: req.query.title as string,
        sent: req.query.sent === 'true' ? true : req.query.sent === 'false' ? false : undefined,
        leadId: req.query.leadId ? parseInt(req.query.leadId as string) : undefined,
        scheduledOnly: req.query.scheduledOnly === 'true',
      };

      const count = await posVendaMessagesService.count(options);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao contar mensagens pós-venda',
        message: error.message 
      });
    }
  }

  /**
   * Buscar mensagens com paginação
   */
  async findWithPagination(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      
      const filters = {
        title: req.query.title as string,
        sent: req.query.sent === 'true' ? true : req.query.sent === 'false' ? false : undefined,
        leadId: req.query.leadId ? parseInt(req.query.leadId as string) : undefined,
        includeLead: req.query.includeLead === 'true',
        scheduledOnly: req.query.scheduledOnly === 'true',
        sentOnly: req.query.sentOnly === 'true',
      };

      const result = await posVendaMessagesService.findWithPagination(page, pageSize, filters);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar mensagens pós-venda com paginação',
        message: error.message 
      });
    }
  }

  /**
   * Verificar se mensagem existe
   */
  async exists(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const exists = await posVendaMessagesService.exists(id);
      res.json({ exists });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao verificar existência da mensagem',
        message: error.message 
      });
    }
  }

  /**
   * Obter estatísticas de mensagens
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await posVendaMessagesService.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao obter estatísticas das mensagens',
        message: error.message 
      });
    }
  }

  /**
   * Buscar mensagens recentes
   */
  async findRecent(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const includeLead = req.query.includeLead === 'true';
      
      const messages = await posVendaMessagesService.findRecent(limit, includeLead);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar mensagens recentes',
        message: error.message 
      });
    }
  }

  /**
   * Criar mensagens em lote
   */
  async bulkCreate(req: Request, res: Response) {
    try {
      const { messages } = req.body;
      
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Array de mensagens é obrigatório' });
      }

      const createdMessages = await posVendaMessagesService.bulkCreate(messages);
      res.status(201).json(createdMessages);
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao criar mensagens em lote',
        message: error.message 
      });
    }
  }

  /**
   * Marcar múltiplas mensagens como enviadas
   */
  async markMultipleAsSent(req: any, res: any) {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Array de IDs é obrigatório' });
      }

      const affectedCount = await posVendaMessagesService.markMultipleAsSent(ids);
      res.json({ affectedCount, message: `${affectedCount} mensagens marcadas como enviadas` });
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao marcar mensagens como enviadas',
        message: error.message 
      });
    }
  }

  /**
   * Buscar mensagens por status de envio
   */
  async findBySentStatus(req: Request, res: Response) {
    try {
      const sent = req.query.sent === 'true';
      const includeLead = req.query.includeLead === 'true';
      
      const messages = sent ? 
        await posVendaMessagesService.findSentMessages(includeLead) :
        await posVendaMessagesService.findPendingMessages(includeLead);
        
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar mensagens por status',
        message: error.message 
      });
    }
  }

  /**
   * Enviar mensagem (marcar como enviada e processar)
   */
  async sendMessage(req: any, res: any) {
    try {
      const id = parseInt(req.params.id);
      
      // Marcar como enviada
      const message = await posVendaMessagesService.sendMessage(id);
      
      if (!message) {
        return res.status(404).json({ error: 'Mensagem pós-venda não encontrada' });
      }

      // Aqui você pode adicionar lógica adicional para processar o envio
      // Por exemplo: enviar via WhatsApp, email, SMS, etc.
      
      res.json({ 
        message: 'Mensagem enviada com sucesso',
        data: message 
      });
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao enviar mensagem',
        message: error.message 
      });
    }
  }
}

export default new MessagesController();
