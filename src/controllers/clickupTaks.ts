import { Request, Response } from 'express';
import TaskService from '../services/taskService.js';

const taskService = new TaskService();

class ClickupTasksController {
  /**
   * Criar uma nova task
   */
  async create(req: Request, res: Response) {
    try {
      const task = await taskService.create(req.body);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({
        error: 'Erro ao criar task',
        message: error.message
      });
    }
  }

  /**
   * Buscar todas as tasks com filtros opcionais
   */
  async findAll(req: Request, res: Response) {
    try {
      const options = {
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
        name: req.query.name as string,
        status: req.query.status as string,
        leadId: req.query.leadId as string,
        listId: req.query.listId ? parseInt(req.query.listId as string, 10) : undefined,
        includeLead: req.query.includeLead === 'true'
      };

      const tasks = await taskService.findAll(options);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro ao buscar tasks',
        message: error.message
      });
    }
  }

  /**
   * Buscar task por ID
   */
  async findById(req: any, res: any) {
    try {
      const { id } = req.params;
      const includeLead = req.query.includeLead !== 'false';

      const task = await taskService.findById(id, includeLead);

      if (!task) {
        return res.status(404).json({ error: 'Task não encontrada' });
      }

      res.json(task);
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro ao buscar task por ID',
        message: error.message
      });
    }
  }

  /**
   * Buscar tasks por leadId
   */
  async findByLeadId(req: Request, res: Response) {
    try {
      const { leadId } = req.params;
      const includeLead = req.query.includeLead === 'true';

      const tasks = await taskService.findByLeadId(leadId, includeLead);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro ao buscar tasks por leadId',
        message: error.message
      });
    }
  }

  /**
   * Buscar tasks por status
   */
  async findByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const includeLead = req.query.includeLead === 'true';

      const tasks = await taskService.findByStatus(status, includeLead);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro ao buscar tasks por status',
        message: error.message
      });
    }
  }

  /**
   * Buscar tasks por listId
   */
  async findByListId(req: Request, res: Response) {
    try {
      const listId = parseInt(req.params.listId, 10);
      const includeLead = req.query.includeLead === 'true';

      const tasks = await taskService.findByListId(listId, includeLead);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro ao buscar tasks por listId',
        message: error.message
      });
    }
  }

  /**
   * Atualizar task
   */
  async update(req: any, res: any) {
    try {
      const { id } = req.params;
      const task = await taskService.update(id, req.body);

      if (!task) {
        return res.status(404).json({ error: 'Task não encontrada' });
      }

      res.json(task);
    } catch (error: any) {
      res.status(400).json({
        error: 'Erro ao atualizar task',
        message: error.message
      });
    }
  }

  /**
   * Atualizar status de uma task
   */
  async updateStatus(req: any, res: any) {
    try {
      const { id } = req.params;
      const { status } = req.body ?? {};

      if (!status) {
        return res.status(400).json({
          error: 'Status é obrigatório'
        });
      }

      const task = await taskService.update(id, { status });

      if (!task) {
        return res.status(404).json({ error: 'Task não encontrada' });
      }

      res.json(task);
    } catch (error: any) {
      res.status(400).json({
        error: 'Erro ao atualizar status da task',
        message: error.message
      });
    }
  }

  /**
   * Deletar task
   */
  async delete(req: any, res: any) {
    try {
      const { id } = req.params;
      const deleted = await taskService.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Task não encontrada' });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro ao deletar task',
        message: error.message
      });
    }
  }

  /**
   * Contar total de tasks com filtros
   */
  async count(req: Request, res: Response) {
    try {
      const options = {
        name: req.query.name as string,
        status: req.query.status as string,
        leadId: req.query.leadId as string,
        listId: req.query.listId ? parseInt(req.query.listId as string, 10) : undefined
      };

      const count = await taskService.count(options);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro ao contar tasks',
        message: error.message
      });
    }
  }

  /**
   * Buscar tasks com paginação
   */
  async findWithPagination(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;

      const filters = {
        name: req.query.name as string,
        status: req.query.status as string,
        leadId: req.query.leadId as string,
        listId: req.query.listId ? parseInt(req.query.listId as string, 10) : undefined,
        includeLead: req.query.includeLead === 'true'
      };

      const result = await taskService.findWithPagination(page, pageSize, filters);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro ao buscar tasks com paginação',
        message: error.message
      });
    }
  }

  /**
   * Verificar se uma task existe
   */
  async exists(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const exists = await taskService.exists(id);
      res.json({ exists });
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro ao verificar existência da task',
        message: error.message
      });
    }
  }

  /**
   * Atualizar status de múltiplas tasks
   */
  async updateMultipleStatus(req: any, res: any) {
    try {
      const { ids, status } = req.body ?? {};

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Lista de IDs é obrigatória' });
      }

      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }

      const affectedCount = await taskService.updateMultipleStatus(ids, status);
      res.json({ updated: affectedCount });
    } catch (error: any) {
      res.status(400).json({
        error: 'Erro ao atualizar status das tasks',
        message: error.message
      });
    }
  }

  /**
   * Buscar tasks por período
   */
  async findByDateRange(req: any, res: any) {
    try {
      const { startDate, endDate } = req.query;
      const includeLead = req.query.includeLead === 'true';

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'Parâmetros startDate e endDate são obrigatórios'
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Datas inválidas' });
      }

      const tasks = await taskService.findByDateRange(start, end, includeLead);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro ao buscar tasks por período',
        message: error.message
      });
    }
  }

  /**
   * Contar tasks agrupadas por status
   */
  async countByStatus(req: Request, res: Response) {
    try {
      const counts = await taskService.countByStatus();
      res.json(counts);
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro ao contar tasks por status',
        message: error.message
      });
    }
  }

  /**
   * Buscar tasks recentes
   */
  async findRecent(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const includeLead = req.query.includeLead === 'true';

      const tasks = await taskService.findRecent(limit, includeLead);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro ao buscar tasks recentes',
        message: error.message
      });
    }
  }

  /**
   * Criar tasks em lote
   */
  async bulkCreate(req: any, res: any) {
    try {
      const tasksData = Array.isArray(req.body) ? req.body : req.body?.tasks;

      if (!Array.isArray(tasksData) || tasksData.length === 0) {
        return res.status(400).json({
          error: 'Lista de tasks é obrigatória'
        });
      }

      const tasks = await taskService.bulkCreate(tasksData);
      res.status(201).json(tasks);
    } catch (error: any) {
      res.status(400).json({
        error: 'Erro ao criar tasks em lote',
        message: error.message
      });
    }
  }
}

export default new ClickupTasksController();
