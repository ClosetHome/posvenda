import PosVendaMessages from '../modules/posvendaMessages.js';
import LeadsPosVenda from '../modules/leadsPosVenda.js';
import {sendMessage} from './botconversaService.js'
import { Op } from 'sequelize';
import Tasks from '../modules/clickupTasks.js';
import { DateTime } from 'luxon';

interface CreatePosVendaMessageData {
  title: string;
  message_text?: string;
  sent?: boolean;
  schadule?: Date;
  leadId: number;
}

interface CreatePosVendaMessageWithAttachmentData {
  title: string;
  message_text?: string;
  sent?: boolean;
  schadule?: Date;
  leadId: number;
  mimetype?: string;
  media_name?: string;
  media_json?: string;
  mediaurl?: string;
}

interface UpdatePosVendaMessageData {
  title?: string;
  message_text?: string;
  sent?: boolean;
  schadule?: Date;
  leadId?: number;
}

interface FindPosVendaMessageOptions {
  limit?: number;
  offset?: number;
  title?: string;
  sent?: boolean;
  leadId?: number;
  includeLead?: boolean;
  scheduledOnly?: boolean;
  sentOnly?: boolean;
}

class PosVendaMessagesService {
  /**
   * Criar uma nova mensagem pós-venda
   */
  async create(data: any): Promise<PosVendaMessages> {
    try {
      const message = await PosVendaMessages.create(data);
      return message;
    } catch (error) {
      throw new Error(`Erro ao criar mensagem pós-venda: ${error}`);
    }
  }

  /**
   * Buscar todas as mensagens com opções de filtro e relacionamentos
   */
  async findAll(options: FindPosVendaMessageOptions = {}): Promise<PosVendaMessages[]> {
    try {
      const whereClause: any = {};
      const include = [];
      
      if (options.title) {
        whereClause.title = {
          [Op.iLike]: `%${options.title}%`
        };
      }
      
      if (options.sent !== undefined) {
        whereClause.sent = options.sent;
      }

      if (options.leadId) {
        whereClause.leadId = options.leadId;
      }

      if (options.scheduledOnly) {
        whereClause.schadule = {
          [Op.ne]: null
        };
      }

      if (options.sentOnly) {
        whereClause.sent = true;
      }

      // Sempre incluir o lead com name e phone
      include.push({
        model: LeadsPosVenda,
        as: 'leadposvenda',
        attributes: ['id', 'name', 'phone', 'email'],
        required: false // LEFT JOIN para não excluir mensagens sem lead
      });

      const messages = await PosVendaMessages.findAll({
        where: whereClause,
        include,
        limit: options.limit,
        offset: options.offset,
        order: [['createdAt', 'DESC']]
      });

      return messages;
    } catch (error) {
      throw new Error(`Erro ao buscar mensagens pós-venda: ${error}`);
    }
  }

  /**
   * Buscar mensagem por ID com relacionamentos
   */
  async findById(id: number, includeLead: boolean = true): Promise<PosVendaMessages | null> {
    try {
      const include = [];

      // Sempre incluir o lead com informações básicas
      include.push({
        model: LeadsPosVenda,
        as: 'leadposvenda',
        attributes: ['id', 'name', 'phone', 'email'],
        required: false
      });

      const message = await PosVendaMessages.findByPk(id, { include });
      return message;
    } catch (error) {
      throw new Error(`Erro ao buscar mensagem pós-venda por ID: ${error}`);
    }
  }

  /**
   * Buscar mensagens por leadId
   */
  async findByLeadId(leadId: number, includeLead: boolean = true): Promise<PosVendaMessages[]> {
    try {
      const include = [];

      // Sempre incluir o lead com informações básicas
      include.push({
        model: LeadsPosVenda,
        as: 'leadposvenda',
        attributes: ['id', 'name', 'phone', 'email'],
        required: false
      });

      const messages = await PosVendaMessages.findAll({
        where: { leadId },
        include,
        order: [['createdAt', 'DESC']]
      });

      return messages;
    } catch (error) {
      throw new Error(`Erro ao buscar mensagens pós-venda por leadId: ${error}`);
    }
  }

  /**
   * Buscar mensagens enviadas
   */
  async findSentMessages(includeLead: boolean = true): Promise<PosVendaMessages[]> {
    try {
      const include = [];

      // Sempre incluir o lead com informações básicas
      include.push({
        model: LeadsPosVenda,
        as: 'leadposvenda',
        attributes: ['id', 'name', 'phone', 'email'],
        required: false
      });

      const messages = await PosVendaMessages.findAll({
        where: { sent: true },
        include,
        order: [['createdAt', 'DESC']]
      });

      return messages;
    } catch (error) {
      throw new Error(`Erro ao buscar mensagens enviadas: ${error}`);
    }
  }

  /**
   * Buscar mensagens não enviadas
   */
  async findPendingMessages(includeLead: boolean = true): Promise<PosVendaMessages[]> {
    try {
      const include = [];

      // Sempre incluir o lead com informações básicas
      include.push({
        model: LeadsPosVenda,
        as: 'leadposvenda',
        attributes: ['id', 'name', 'phone', 'email'],
        required: false
      });

      const messages = await PosVendaMessages.findAll({
        where: { sent: false },
        include,
        order: [['createdAt', 'DESC']]
      });

      return messages;
    } catch (error) {
      throw new Error(`Erro ao buscar mensagens pendentes: ${error}`);
    }
  }

  /**
   * Buscar mensagens agendadas
   */
  async findScheduledMessages(includeLead: boolean = true): Promise<PosVendaMessages[]> {
    try {
      const include = [];

      // Sempre incluir o lead com informações básicas
      include.push({
        model: LeadsPosVenda,
        as: 'leadposvenda',
        attributes: ['id', 'name', 'phone', 'email'],
        required: false
      });

      const messages = await PosVendaMessages.findAll({
        where: { 
          schadule: {
            [Op.ne]: null
          }
        },
        include,
        order: [['schadule', 'ASC']]
      });

      return messages;
    } catch (error) {
      throw new Error(`Erro ao buscar mensagens agendadas: ${error}`);
    }
  }

  /**
   * Buscar mensagens agendadas para hoje
   */
 async findScheduledForToday(includeLead: boolean = false): Promise<PosVendaMessages[]> {
  try {
    const tz = 'America/Sao_Paulo';

    // Limites do dia *em São Paulo*, convertidos para UTC (Date) para comparar no banco
  const startOfDay = DateTime.utc().startOf('day').toJSDate(); // 2025-09-24T00:00:00.000Z
  const endOfDay   = DateTime.utc().endOf('day').toJSDate();
     console.log(startOfDay, endOfDay)
    const include: any[] = [];
    if (includeLead) {
      include.push({
        model: LeadsPosVenda,
        as: 'leadposvenda',
        include: [{ model: Tasks, as: 'tasks' }],
      });
    }

    const messages = await PosVendaMessages.findAll({
      where: {
        schadule: { [Op.between]: [startOfDay, endOfDay] },
        sent: false,
      },
      include,
      order: [['schadule', 'ASC']],
    });

    return messages.map(m => m.toJSON());
  } catch (error) {
    throw new Error(`Erro ao buscar mensagens agendadas para hoje: ${error}`);
  }
}
  /**
   * Atualizar mensagem por ID
   */
  async update(id: number, data: UpdatePosVendaMessageData): Promise<PosVendaMessages | null> {
    try {
      const message = await PosVendaMessages.findByPk(id);
      
      if (!message) {
        return null;
      }

      await message.update(data);
      return message;
    } catch (error) {
      throw new Error(`Erro ao atualizar mensagem pós-venda: ${error}`);
    }
  }

    async updateForTask(message: UpdatePosVendaMessageData): Promise<PosVendaMessages | null> {
    try {
      const [count ,messageReturn ] =  await PosVendaMessages.update(
       { schadule: message.schadule, message_text: message.message_text }, // as 2 colunas
      { where: { leadId: message.leadId, title: message.title },
       returning: true } // condição de busca
      );
      return messageReturn[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar mensagem pós-venda: ${error}`);
    }
  }

  /**
   * Marcar mensagem como enviada
   */
  async markAsSent(id: number): Promise<PosVendaMessages | null> {
    try {
      const message = await PosVendaMessages.findByPk(id);
      
      if (!message) {
        return null;
      }

      await message.update({ sent: true });
      return message;
    } catch (error) {
      throw new Error(`Erro ao marcar mensagem como enviada: ${error}`);
    }
  }

  /**
   * Agendar mensagem
   */
  async schedule(id: number, scheduleDate: Date): Promise<PosVendaMessages | null> {
    try {
      const message = await PosVendaMessages.findByPk(id);
      
      if (!message) {
        return null;
      }

      await message.update({ schadule: scheduleDate });
      return message;
    } catch (error) {
      throw new Error(`Erro ao agendar mensagem: ${error}`);
    }
  }

  /**
   * Deletar mensagem por ID
   */
  async delete(id: number): Promise<boolean> {
    try {
      const message = await PosVendaMessages.findByPk(id);
      
      if (!message) {
        return false;
      }

      await message.destroy();
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar mensagem pós-venda: ${error}`);
    }
  }

  /**
   * Contar total de mensagens
   */
  async count(options: FindPosVendaMessageOptions = {}): Promise<number> {
    try {
      const whereClause: any = {};
      
      if (options.title) {
        whereClause.title = {
          [Op.iLike]: `%${options.title}%`
        };
      }
      
      if (options.sent !== undefined) {
        whereClause.sent = options.sent;
      }

      if (options.leadId) {
        whereClause.leadId = options.leadId;
      }

      if (options.scheduledOnly) {
        whereClause.schadule = {
          [Op.ne]: null
        };
      }

      const count = await PosVendaMessages.count({
        where: whereClause
      });

      return count;
    } catch (error) {
      throw new Error(`Erro ao contar mensagens pós-venda: ${error}`);
    }
  }

  /**
   * Buscar mensagens com paginação
   */
  async findWithPagination(page: number = 1, pageSize: number = 10, filters: FindPosVendaMessageOptions = {}) {
    try {
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      const whereClause: any = {};
      const include = [];
      
      if (filters.title) {
        whereClause.title = {
          [Op.iLike]: `%${filters.title}%`
        };
      }
      
      if (filters.sent !== undefined) {
        whereClause.sent = filters.sent;
      }

      if (filters.leadId) {
        whereClause.leadId = filters.leadId;
      }

      if (filters.scheduledOnly) {
        whereClause.schadule = {
          [Op.ne]: null
        };
      }

      // Sempre incluir o lead com informações básicas
      include.push({
        model: LeadsPosVenda,
        as: 'leadposvenda',
        attributes: ['id', 'name', 'phone', 'email'],
        required: false
      });

      const { count, rows } = await PosVendaMessages.findAndCountAll({
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
      throw new Error(`Erro ao buscar mensagens pós-venda com paginação: ${error}`);
    }
  }

  /**
   * Verificar se mensagem existe
   */
  async exists(id: number): Promise<boolean> {
    try {
      const count = await PosVendaMessages.count({
        where: { id }
      });
      return count > 0;
    } catch (error) {
      throw new Error(`Erro ao verificar existência da mensagem: ${error}`);
    }
  }

  /**
   * Estatísticas de mensagens
   */
  async getStats(): Promise<any> {
    try {
      const totalMessages = await PosVendaMessages.count();
      const sentMessages = await PosVendaMessages.count({ where: { sent: true } });
      const pendingMessages = await PosVendaMessages.count({ where: { sent: false } });
      const scheduledMessages = await PosVendaMessages.count({ 
        where: { 
          schadule: { [Op.ne]: null }
        }
      });

      return {
        total: totalMessages,
        sent: sentMessages,
        pending: pendingMessages,
        scheduled: scheduledMessages,
        sentPercentage: totalMessages > 0 ? Math.round((sentMessages / totalMessages) * 100) : 0
      };
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas das mensagens: ${error}`);
    }
  }

  /**
   * Buscar mensagens recentes
   */
  async findRecent(limit: number = 10, includeLead: boolean = true): Promise<PosVendaMessages[]> {
    try {
      const include = [];

      // Sempre incluir o lead com informações básicas
      include.push({
        model: LeadsPosVenda,
        as: 'leadposvenda',
        attributes: ['id', 'name', 'phone', 'email'],
        required: false
      });

      const messages = await PosVendaMessages.findAll({
        include,
        limit,
        order: [['createdAt', 'DESC']]
      });

      return messages;
    } catch (error) {
      throw new Error(`Erro ao buscar mensagens recentes: ${error}`);
    }
  }

  /**
   * Criar mensagem com anexo
   */
  async createWithAttachment(data: any): Promise<PosVendaMessages> {
    try {
      const message = await PosVendaMessages.create(data);
      return message;
    } catch (error) {
      throw new Error(`Erro ao criar mensagem com anexo: ${error}`);
    }
  }

  /**
   * Bulk create mensagens
   */
  async bulkCreate(messagesData: any[]): Promise<PosVendaMessages[]> {
    try {
      const messages = await PosVendaMessages.bulkCreate(messagesData, {
        validate: true,
        ignoreDuplicates: true
      });
      return messages;
    } catch (error) {
      throw new Error(`Erro ao criar mensagens em lote: ${error}`);
    }
  }

  /**
   * Marcar múltiplas mensagens como enviadas
   */
  async markMultipleAsSent(ids: number[]): Promise<number> {
    try {
      const [affectedCount] = await PosVendaMessages.update(
        { sent: true },
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
      throw new Error(`Erro ao marcar mensagens como enviadas: ${error}`);
    }
  }
  async sendMessage(id: number): Promise<PosVendaMessages | null> {
    try {
      const message:any = await PosVendaMessages.findByPk(id, {
        include: [
          {
            model: LeadsPosVenda,
            as: 'leadposvenda',
            attributes: ['id', 'name', 'phone', 'email', 'subscriberbot']
          }
        ]
      });

      
      if (!message) {
        return null;
      }
     if(message.message_text){ 
     await sendMessage(Number(message.leadposvenda.subscriberbot), 'text', message.message_text)
     } 
     if(message.mediaurl){
      console.log(message.mediaurl)
      await sendMessage(Number(message.leadposvenda.subscriberbot), 'file', message.mediaurl)
     }

      await message.update({ sent: true });
      return message;
    } catch (error) {
      throw new Error(`Erro ao marcar mensagem como enviada: ${error}`);
    }
  }
}

export default PosVendaMessagesService;
