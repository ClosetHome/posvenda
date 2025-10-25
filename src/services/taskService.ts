import { sequelize } from '../db.js';
import Tasks from '../modules/clickupTasks.js';
import LeadsPosVenda from '../modules/leadsPosVenda.js';
import { Op } from 'sequelize';

interface CreateTaskData {
  id: string;
  name: string;
  listId: number;
  status: string;
  leadId: number;
  data?: any;
}

interface UpdateTaskData {
  name?: string;
  listId?: number;
  status?: string;
  leadId?: string;
  data?: any;
}

interface FindTaskOptions {
  limit?: number;
  offset?: number;
  name?: string;
  status?: string;
  leadId?: string;
  listId?: number;
  includeLead?: boolean;
}

class TaskService {
  /**
   * Criar uma nova task
   */
  async create(data: any): Promise<Tasks> {
    try {
      const task = await Tasks.create(data);
      return task;
    } catch (error) {
      throw new Error(`Erro ao criar task: ${error}`);
    }
  }

  /**
   * Buscar todas as tasks com opções de filtro e relacionamentos
   */
  async findAll(options: FindTaskOptions = {}): Promise<Tasks[]> {
    try {
      const whereClause: any = {};
      const include = [];
      
      if (options.name) {
        whereClause.name = {
          [Op.iLike]: `%${options.name}%`
        };
      }
      
      if (options.status) {
        whereClause.status = {
          [Op.iLike]: `%${options.status}%`
        };
      }

      if (options.leadId) {
        whereClause.leadId = options.leadId;
      }

      if (options.listId) {
        whereClause.listId = options.listId;
      }

      if (options.includeLead) {
        include.push({
          model: LeadsPosVenda,
          as: 'lead'
        });
      }

      const tasks = await Tasks.findAll({
        where: whereClause,
        include,
        limit: options.limit,
        offset: options.offset,
        order: [['createdAt', 'DESC']]
      });

      return tasks;
    } catch (error) {
      throw new Error(`Erro ao buscar tasks: ${error}`);
    }
  }

  /**
   * Buscar task por ID com relacionamentos
   */
  async findById(id: string, includeLead: boolean = true): Promise<Tasks | null> {
    try {
      const include = [];

      if (includeLead) {
        include.push({
          model: LeadsPosVenda,
          as: 'lead'
        });
      }

      const task = await Tasks.findByPk(id, { include });
      if(!task) return null
      return task.toJSON();
    } catch (error) {
      throw new Error(`Erro ao buscar task por ID: ${error}`);
    }
  }

  /**
   * Buscar tasks por leadId
   */
  async findByLeadId(leadId: string, includeLead: boolean = false): Promise<Tasks[]> {
    try {
      const include = [];

      if (includeLead) {
        include.push({
          model: LeadsPosVenda,
          as: 'lead'
        });
      }

      const tasks = await Tasks.findAll({
        where: { leadId },
        include,
        order: [['createdAt', 'DESC']]
      });

      return tasks;
    } catch (error) {
      throw new Error(`Erro ao buscar tasks por leadId: ${error}`);
    }
  }

  /**
   * Buscar tasks por status
   */
  async findByStatus(status: string, includeLead: boolean = false): Promise<Tasks[]> {
    try {
      const include = [];

      if (includeLead) {
        include.push({
          model: LeadsPosVenda,
          as: 'lead'
        });
      }

      const tasks = await Tasks.findAll({
        where: {
          status: {
            [Op.iLike]: `%${status}%`
          }
        },
        include,
        order: [['createdAt', 'DESC']]
      });

      return tasks;
    } catch (error) {
      throw new Error(`Erro ao buscar tasks por status: ${error}`);
    }
  }

  /**
   * Buscar tasks por listId
   */
  async findByListId(listId: number, includeLead: boolean = false): Promise<Tasks[]> {
    try {
      const include = [];

      if (includeLead) {
        include.push({
          model: LeadsPosVenda,
          as: 'lead'
        });
      }

      const tasks = await Tasks.findAll({
        where: { listId },
        include,
        order: [['createdAt', 'DESC']]
      });

      return tasks;
    } catch (error) {
      throw new Error(`Erro ao buscar tasks por listId: ${error}`);
    }
  }

  /**
   * Atualizar task por ID
   */
  async update(id: string, data: UpdateTaskData): Promise<Tasks | null> {
    try {
      const task = await Tasks.findByPk(id);
      
      if (!task) {
        return null;
      }

      const updatedTask = await task.update(data);
      return updatedTask.toJSON();
    } catch (error) {
      throw new Error(`Erro ao atualizar task: ${error}`);
    }
  }

  /**
   * Deletar task por ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const task = await Tasks.findByPk(id);
      
      if (!task) {
        return false;
      }

      await task.destroy();
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar task: ${error}`);
    }
  }

  /**
   * Contar total de tasks
   */
  async count(options: FindTaskOptions = {}): Promise<number> {
    try {
      const whereClause: any = {};
      
      if (options.name) {
        whereClause.name = {
          [Op.iLike]: `%${options.name}%`
        };
      }
      
      if (options.status) {
        whereClause.status = {
          [Op.iLike]: `%${options.status}%`
        };
      }

      if (options.leadId) {
        whereClause.leadId = options.leadId;
      }

      if (options.listId) {
        whereClause.listId = options.listId;
      }

      const count = await Tasks.count({
        where: whereClause
      });

      return count;
    } catch (error) {
      throw new Error(`Erro ao contar tasks: ${error}`);
    }
  }

  /**
   * Buscar tasks com paginação
   */
  async findWithPagination(page: number = 1, pageSize: number = 10, filters: FindTaskOptions = {}) {
    try {
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      const whereClause: any = {};
      const include = [];
      
      if (filters.name) {
        whereClause.name = {
          [Op.iLike]: `%${filters.name}%`
        };
      }
      
      if (filters.status) {
        whereClause.status = {
          [Op.iLike]: `%${filters.status}%`
        };
      }

      if (filters.leadId) {
        whereClause.leadId = filters.leadId;
      }

      if (filters.listId) {
        whereClause.listId = filters.listId;
      }

      if (filters.includeLead) {
        include.push({
          model: LeadsPosVenda,
          as: 'lead'
        });
      }

      const { count, rows } = await Tasks.findAndCountAll({
        where: whereClause,
        include,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        data: rows,
        pagination: {
          currentPage: page,
          pageSize,
          totalItems: count,
          totalPages: Math.ceil(count / pageSize)
        }
      };
    } catch (error) {
      throw new Error(`Erro ao buscar tasks com paginação: ${error}`);
    }
  }

  /**
   * Verificar se task existe
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await Tasks.count({
        where: { id }
      });
      return count > 0;
    } catch (error) {
      throw new Error(`Erro ao verificar existência da task: ${error}`);
    }
  }

  /**
   * Atualizar status de múltiplas tasks
   */
  async updateMultipleStatus(ids: string[], status: string): Promise<number> {
    try {
      const [affectedCount] = await Tasks.update(
        { status },
        {
          where: {
            id: {
              [Op.in]: ids
            }
          }
        }
      );
      return affectedCount;
    } catch (error) {
      throw new Error(`Erro ao atualizar status das tasks: ${error}`);
    }
  }

  /**
   * Buscar tasks por período de criação
   */
  async findByDateRange(startDate: Date, endDate: Date, includeLead: boolean = false): Promise<Tasks[]> {
    try {
      const include = [];

      if (includeLead) {
        include.push({
          model: LeadsPosVenda,
          as: 'lead'
        });
      }

      const tasks = await Tasks.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        include,
        order: [['createdAt', 'DESC']]
      });

      return tasks;
    } catch (error) {
      throw new Error(`Erro ao buscar tasks por período: ${error}`);
    }
  }

  /**
   * Buscar tasks por status com tempo de atualiza��o maior que 8 horas
   */
  async findStaleByStatus(status: string, includeLead: boolean = false): Promise<Tasks[]> {
    try {
      const include = [];

      if (includeLead) {
        include.push({
          model: LeadsPosVenda,
          as: 'lead'
        });
      }

      const eightHoursAgo = new Date(Date.now() - 11 * 60 * 60 * 1000);

      const tasks = await Tasks.findAll({
        where: {
          status,
          updatedAt: {
            [Op.lte]: eightHoursAgo
          }
        },
        include,
        order: [['updatedAt', 'ASC']]
      });

      return tasks;
    } catch (error) {
      throw new Error(`Erro ao buscar tasks por status e tempo de atualiza��o: ${error}`);
    }
  }
  /**
   * Contar tasks por status
   */
  async countByStatus(): Promise<any> {
    try {
      const statusCounts = await Tasks.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      return statusCounts;
    } catch (error) {
      throw new Error(`Erro ao contar tasks por status: ${error}`);
    }
  }

  /**
   * Buscar tasks recentes
   */
  async findRecent(limit: number = 10, includeLead: boolean = false): Promise<Tasks[]> {
    try {
      const include = [];

      if (includeLead) {
        include.push({
          model: LeadsPosVenda,
          as: 'lead'
        });
      }

      const tasks = await Tasks.findAll({
        include,
        limit,
        order: [['createdAt', 'DESC']]
      });

      return tasks;
    } catch (error) {
      throw new Error(`Erro ao buscar tasks recentes: ${error}`);
    }
  }

  /**
   * Bulk create tasks
   */
  async bulkCreate(tasksData: any[]): Promise<Tasks[]> {
    try {
      const tasks = await Tasks.bulkCreate(tasksData, {
        validate: true,
        ignoreDuplicates: true
      });
      return tasks;
    } catch (error) {
      throw new Error(`Erro ao criar tasks em lote: ${error}`);
    }
  }
}

export default TaskService;
