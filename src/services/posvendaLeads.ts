import LeadsPosVenda from '../modules/leadsPosVenda.js';
import Tasks from '../modules/clickupTasks.js';
import PosVendaMessages from '../modules/posvendaMessages.js';
import TaskService from '../services/taskService.js';
import { Op } from 'sequelize';

interface CreateLeadPosVendaData {
  name: string;
  email?: string;
  city?: string;
  state?: string;
  street?: string;
  neighborhood?:string;
  number?: string;
  cep?: string;
  cpf?: string;
  birthday?: Date;
  status: string;
  phone: string;
}

interface UpdateLeadPosVendaData {
  name?: string;
  email?: string;
  city?: string;
  state?: string;
  street?: string;
  neighborhood?:string;
  number?: string;
  cep?: string;
  cpf?: string;
  birthday?: Date | null;
  phone?: string;
  customFields?: any;
}

interface FindLeadPosVendaOptions {
  limit?: number;
  offset?: number;
  name?: string;
  email?: string;
  phone?: string;
  subscriberbot?:number;
  city?: string;
  state?: string;
  includeTasks?: boolean;
  includeMessages?: boolean;
}

const taskService = new TaskService()

class PosVendaLeadsService {
  /**
   * Criar um novo lead pós-venda
   */
  async create(data: any): Promise<LeadsPosVenda> {
    try {
      const lead = await LeadsPosVenda.create(data);
      return lead;
    } catch (error) {
      throw new Error(`Erro ao criar lead pós-venda: ${error}`);
    }
  }

  /**
   * Buscar todos os leads com opções de filtro e relacionamentos
   */
  async findAll(options: FindLeadPosVendaOptions = {}): Promise<LeadsPosVenda[]> {
    try {
      const whereClause: any = {};
      const include = [];
      
      if (options.name) {
        whereClause.name = {
          [Op.iLike]: `%${options.name}%`
        };
      }
      
      if (options.email) {
        whereClause.email = {
          [Op.iLike]: `%${options.email}%`
        };
      }

        if (options.subscriberbot) {
        whereClause.email = {
          [Op.iLike]: `%${options.subscriberbot}%`
        };
      }

      
      if (options.phone) {
        whereClause.phone = {
          [Op.iLike]: `%${options.phone}%`
        };
      }

      if (options.city) {
        whereClause.city = {
          [Op.iLike]: `%${options.city}%`
        };
      }

      if (options.state) {
        whereClause.state = {
          [Op.iLike]: `%${options.state}%`
        };
      }

      if (options.includeTasks) {
        include.push({
          model: Tasks,
          as: 'tasks'
        });
      }

      if (options.includeMessages) {
        include.push({
          model: PosVendaMessages,
          as: 'posvendamessages'
        });
      }

      const leads = await LeadsPosVenda.findAll({
        where: whereClause,
        include,
        limit: options.limit,
        offset: options.offset,
        order: [['createdAt', 'DESC']]
      });

      return leads;
    } catch (error) {
      throw new Error(`Erro ao buscar leads pós-venda: ${error}`);
    }
  }

  /**
   * Buscar lead por ID com relacionamentos
   */
  async findById(id: number, includeRelations: boolean = true): Promise<LeadsPosVenda | null> {
    try {
      const include = [];

      if (includeRelations) {
        include.push(
          {
            model: Tasks,
            as: 'tasks'
          },
          {
            model: PosVendaMessages,
            as: 'posvendamessages'
          }
        );
      }

      const lead = await LeadsPosVenda.findByPk(id, { include });
      return lead?.toJSON() || null;
    } catch (error) {
      throw new Error(`Erro ao buscar lead pós-venda por ID: ${error}`);
    }
  }

  /**
   * Buscar lead por email
   */
  async findByEmail(email: string): Promise<LeadsPosVenda | null> {
    try {
      const lead = await LeadsPosVenda.findOne({
        where: {
          email: {
            [Op.iLike]: email
          }
        }
      });
      return lead;
    } catch (error) {
      throw new Error(`Erro ao buscar lead pós-venda por email: ${error}`);
    }
  }

  /**
   * Buscar leads por status
   */
  async findByStatus(status: string, includeRelations: boolean = false): Promise<LeadsPosVenda[]> {
    try {
      const include = [];

      if (includeRelations) {
        include.push(
          {
            model: Tasks,
            as: 'tasks'
          },
          {
            model: PosVendaMessages,
            as: 'posvendamessages'
          }
        );
      }

      const leads = await LeadsPosVenda.findAll({
        where: {
          status: {
            [Op.iLike]: `%${status}%`
          }
        },
        include,
        order: [['createdAt', 'DESC']]
      });
      return leads;
    } catch (error) {
      throw new Error(`Erro ao buscar leads pós-venda por status: ${error}`);
    }
  }

  /**
   * Atualizar lead por ID
   */
  async update(id: number, data: UpdateLeadPosVendaData): Promise<LeadsPosVenda | null> {
    try {
      const lead = await LeadsPosVenda.findByPk(id);
      
      if (!lead) {
        return null;
      }

      await lead.update(data);
      return lead;
    } catch (error) {
      throw new Error(`Erro ao atualizar lead pós-venda: ${error}`);
    }
  }

  /**
   * Deletar lead por ID
   */
  async delete(id: number): Promise<boolean> {
    try {
      const lead = await LeadsPosVenda.findByPk(id);
      
      if (!lead) {
        return false;
      }

      await lead.destroy();
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar lead pós-venda: ${error}`);
    }
  }

  /**
   * Contar total de leads
   */
  async count(options: FindLeadPosVendaOptions = {}): Promise<number> {
    try {
      const whereClause: any = {};
      
      if (options.name) {
        whereClause.name = {
          [Op.iLike]: `%${options.name}%`
        };
      }
      
      if (options.email) {
        whereClause.email = {
          [Op.iLike]: `%${options.email}%`
        };
      }

      

      if (options.phone) {
        whereClause.phone = {
          [Op.iLike]: `%${options.phone}%`
        };
      }

      const count = await LeadsPosVenda.count({
        where: whereClause
      });

      return count;
    } catch (error) {
      throw new Error(`Erro ao contar leads pós-venda: ${error}`);
    }
  }

  /**
   * Buscar leads com paginação
   */
  async findWithPagination(page: number = 1, pageSize: number = 10, filters: FindLeadPosVendaOptions = {}) {
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
      
      if (filters.email) {
        whereClause.email = {
          [Op.iLike]: `%${filters.email}%`
        };
      }

      if (filters.phone) {
        whereClause.phone = {
          [Op.iLike]: `%${filters.phone}%`
        };
      }

      if (filters.includeTasks) {
        include.push({
          model: Tasks,
          as: 'tasks'
        });
      }

      if (filters.includeMessages) {
        include.push({
          model: PosVendaMessages,
          as: 'posvendamessages'
        });
      }

      const { count, rows } = await LeadsPosVenda.findAndCountAll({
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
      throw new Error(`Erro ao buscar leads pós-venda com paginação: ${error}`);
    }
  }

  /**
   * Verificar se lead existe
   */
  async exists(id: number): Promise<boolean> {
    try {
      const count = await LeadsPosVenda.count({
        where: { id }
      });
      return count > 0;
    } catch (error) {
      throw new Error(`Erro ao verificar existência do lead pós-venda: ${error}`);
    }
  }

  /**
   * Verificar se email já existe
   */
  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = {
        email: {
          [Op.iLike]: email
        }
      };

      if (excludeId) {
        whereClause.id = {
          [Op.ne]: excludeId
        };
      }

      const count = await LeadsPosVenda.count({
        where: whereClause
      });
      return count > 0;
    } catch (error) {
      throw new Error(`Erro ao verificar email: ${error}`);
    }
  }

  /**
   * Buscar leads com suas tasks
   */
  async findWithTasks(leadId?: number): Promise<LeadsPosVenda[]> {
    try {
      const whereClause = leadId ? { id: leadId } : {};

      const leads = await LeadsPosVenda.findAll({
        where: whereClause,
        include: [
          {
            model: Tasks,
            as: 'tasks'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return leads;
    } catch (error) {
      throw new Error(`Erro ao buscar leads com tasks: ${error}`);
    }
  }

  /**
   * Buscar leads com suas mensagens
   */
  async findWithMessages(leadId?: number): Promise<LeadsPosVenda[]> {
    try {
      const whereClause = leadId ? { id: leadId } : {};

      const leads = await LeadsPosVenda.findAll({
        where: whereClause,
        include: [
          {
            model: PosVendaMessages,
            as: 'posvendamessages'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return leads;
    } catch (error) {
      throw new Error(`Erro ao buscar leads com mensagens: ${error}`);
    }
  }

  /**
   * Buscar leads com tasks e mensagens
   */
  async findWithAllRelations(leadId?: number): Promise<LeadsPosVenda[]> {
    try {
      const whereClause = leadId ? { id: leadId } : {};

      const leads = await LeadsPosVenda.findAll({
        where: whereClause,
        include: [
          {
            model: Tasks,
            as: 'tasks'
          },
          {
            model: PosVendaMessages,
            as: 'posvendamessages'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return leads;
    } catch (error) {
      throw new Error(`Erro ao buscar leads com todas as relações: ${error}`);
    }
  }

  async updateLeadName(taskId: string, newName: string): Promise<any> {
    try {
      const task:any = await taskService.findById(taskId, true);
      console.log(task)
      if (!task) return;
      const lead = await this.findById(task.lead.id, true);
      if (!lead) return;
      await this.update(lead.id, { name: newName });
      return lead;
    } catch (error) {
      throw new Error(`Erro ao atualizar nome do lead: ${error}`);
    }
  }
}

export default PosVendaLeadsService;
