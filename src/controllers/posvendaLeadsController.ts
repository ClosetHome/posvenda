import { Request, Response } from 'express';
import PosVendaLeadsService from '../services/posvendaLeads.js';

const posVendaLeadsService = new PosVendaLeadsService();

export class PosVendaLeadsController {
  /**
   * Criar um novo lead pós-venda
   */
  async create(req: Request, res: Response) {
    try {
      const lead = await posVendaLeadsService.create(req.body);
      res.status(201).json(lead);
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao criar lead pós-venda',
        message: error.message 
      });
    }
  }

  /**
   * Buscar todos os leads com filtros
   */
  async findAll(req: Request, res: Response) {
    try {
      const options = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        name: req.query.name as string,
        email: req.query.email as string,
        phone: req.query.phone as string,
        city: req.query.city as string,
        state: req.query.state as string,
        includeTasks: req.query.includeTasks === 'true',
        includeMessages: req.query.includeMessages === 'true'
      };

      const leads = await posVendaLeadsService.findAll(options);
      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar leads pós-venda',
        message: error.message 
      });
    }
  }

  /**
   * Buscar lead por ID
   */
  async findById(req: any, res: any) {
    try {
      const id = parseInt(req.params.id);
      const includeRelations = req.query.includeRelations !== 'false';
      
      const lead = await posVendaLeadsService.findById(id, includeRelations);
      
      if (!lead) {
        return res.status(404).json({ error: 'Lead pós-venda não encontrado' });
      }

      res.json(lead);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar lead pós-venda',
        message: error.message 
      });
    }
  }

  /**
   * Buscar lead por email
   */
  async findByEmail(req: any, res: any) {
    try {
      const { email } = req.params;
      const lead = await posVendaLeadsService.findByEmail(email);
      
      if (!lead) {
        return res.status(404).json({ error: 'Lead pós-venda não encontrado' });
      }

      res.json(lead);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar lead pós-venda por email',
        message: error.message 
      });
    }
  }

  /**
   * Buscar leads por status
   */
  async findByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const includeRelations = req.query.includeRelations === 'true';
      
      const leads = await posVendaLeadsService.findByStatus(status, includeRelations);
      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar leads pós-venda por status',
        message: error.message 
      });
    }
  }

  /**
   * Atualizar lead por ID
   */
  async update(req: any, res: any) {
    try {
      const id = parseInt(req.params.id);
      const lead = await posVendaLeadsService.update(id, req.body);
      
      if (!lead) {
        return res.status(404).json({ error: 'Lead pós-venda não encontrado' });
      }

      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Erro ao atualizar lead pós-venda',
        message: error.message 
      });
    }
  }

  /**
   * Deletar lead por ID
   */
  async delete(req: any, res: any) {
    try {
      const id = parseInt(req.params.id);
      const deleted = await posVendaLeadsService.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Lead pós-venda não encontrado' });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao deletar lead pós-venda',
        message: error.message 
      });
    }
  }

  /**
   * Contar leads
   */
  async count(req: Request, res: Response) {
    try {
      const options = {
        name: req.query.name as string,
        email: req.query.email as string,
        phone: req.query.phone as string
      };

      const count = await posVendaLeadsService.count(options);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao contar leads pós-venda',
        message: error.message 
      });
    }
  }

  /**
   * Buscar leads com paginação
   */
  async findWithPagination(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      
      const filters = {
        name: req.query.name as string,
        email: req.query.email as string,
        phone: req.query.phone as string,
        includeTasks: req.query.includeTasks === 'true',
        includeMessages: req.query.includeMessages === 'true'
      };

      const result = await posVendaLeadsService.findWithPagination(page, pageSize, filters);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar leads pós-venda com paginação',
        message: error.message 
      });
    }
  }

  /**
   * Verificar se lead existe
   */
  async exists(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const exists = await posVendaLeadsService.exists(id);
      res.json({ exists });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao verificar existência do lead',
        message: error.message 
      });
    }
  }

  /**
   * Verificar se email existe
   */
  async emailExists(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const excludeId = req.query.excludeId ? parseInt(req.query.excludeId as string) : undefined;
      
      const exists = await posVendaLeadsService.emailExists(email, excludeId);
      res.json({ exists });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao verificar email',
        message: error.message 
      });
    }
  }

  /**
   * Buscar leads com tasks
   */
  async findWithTasks(req: Request, res: Response) {
    try {
      const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : undefined;
      const leads = await posVendaLeadsService.findWithTasks(leadId);
      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar leads com tasks',
        message: error.message 
      });
    }
  }

  /**
   * Buscar leads com mensagens
   */
  async findWithMessages(req: Request, res: Response) {
    try {
      const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : undefined;
      const leads = await posVendaLeadsService.findWithMessages(leadId);
      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar leads com mensagens',
        message: error.message 
      });
    }
  }

  /**
   * Buscar leads com todas as relações
   */
  async findWithAllRelations(req: Request, res: Response) {
    try {
      const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : undefined;
      const leads = await posVendaLeadsService.findWithAllRelations(leadId);
      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Erro ao buscar leads com todas as relações',
        message: error.message 
      });
    }
  }
}

export default new PosVendaLeadsController();
