import { Request, Response } from 'express';
import { redisService } from '../services/redisServices.js';
import {getMessageBot} from '../services/ClickupposVendaservice.js'

export class RedisController {

  /**
   * Busca todos os estados
   */
  async getEstados(req: Request, res: Response): Promise<void> {
    try {
      const estados = await redisService.getEstados();
      
      res.status(200).json({
        success: true,
        data: estados,
        count: estados.length
      });
    } catch (error) {
      console.error('Erro no controller ao buscar estados:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar estados',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Busca um estado específico
   */
  async getEstado(req: Request, res: Response): Promise<void> {
    try {
      const { estadoId } = req.params;
      
      if (!estadoId) {
        res.status(400).json({
          success: false,
          message: 'ID do estado é obrigatório'
        });
        return;
      }

      const estado = await redisService.getEstado(estadoId);
      
      if (!estado) {
        res.status(404).json({
          success: false,
          message: 'Estado não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: estado
      });
    } catch (error) {
      console.error('Erro no controller ao buscar estado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar estado',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Busca todos os municípios de um estado
   */
  async getMunicipiosByEstado(req: Request, res: Response): Promise<void> {
    try {
      const { estado } = req.params;
      
      if (!estado) {
        res.status(400).json({
          success: false,
          message: 'Estado é obrigatório'
        });
        return;
      }

      const municipios = await redisService.getMunicipiosByEstado(estado);
      
      res.status(200).json({
        success: true,
        data: municipios,
        count: municipios.length
      });
    } catch (error) {
      console.error('Erro no controller ao buscar municípios:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar municípios',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Busca um município específico
   */
  async getMunicipio(req: Request, res: Response): Promise<void> {
    try {
      const { estado, municipioId } = req.params;
      
      if (!estado || !municipioId) {
        res.status(400).json({
          success: false,
          message: 'Estado e ID do município são obrigatórios'
        });
        return;
      }

      const municipio = await redisService.getMunicipio(estado, municipioId);
      
      if (!municipio) {
        res.status(404).json({
          success: false,
          message: 'Município não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: municipio
      });
    } catch (error) {
      console.error('Erro no controller ao buscar município:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar município',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Busca todos os CNAEs
   */
  async getCnaes(req: Request, res: Response): Promise<void> {
    try {
    const cnaes = await redisService.getCnaes();
      res.status(200).json({
        success: true,
        data: cnaes,
        count: cnaes.length
      });
    } catch (error) {
      console.error('Erro no controller ao buscar CNAEs:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar CNAEs',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Busca um CNAE específico
   */
  async getCnae(req: Request, res: Response): Promise<void> {
    try {
      const { cnaeId } = req.params;
      
      if (!cnaeId) {
        res.status(400).json({
          success: false,
          message: 'ID do CNAE é obrigatório'
        });
        return;
      }

      const cnae = await redisService.getCnae(cnaeId);
      
      if (!cnae) {
        res.status(404).json({
          success: false,
          message: 'CNAE não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: cnae
      });
    } catch (error) {
      console.error('Erro no controller ao buscar CNAE:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar CNAE',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
   async updateTaksData(req: Request, res: Response): Promise<void> {
    try {
      const { dados_cadastro, task_id, phone } = req.body;
      if (!dados_cadastro || !phone) {
        res.status(400).json({
          success: false,
          message: 'Dados não recebidos'
        });
        return;
      }

     const lead = await getMessageBot(task_id, dados_cadastro)
     
      if (!lead) {
        res.status(404).json({
          success: false,
          message: 'Erro ao atualizar'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data:lead
      });
    } catch (error) {
      console.error('Erro no controller ao buscar CNAE:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar CNAE',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Busca chaves por padrão customizado
   */
  async getKeysByPattern(req: Request, res: Response): Promise<void> {
    try {
      const { pattern } = req.query;
      
      if (!pattern || typeof pattern !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Padrão de busca é obrigatório'
        });
        return;
      }

      const keys = await redisService.getKeysByPattern(pattern);
      
      res.status(200).json({
        success: true,
        data: keys,
        count: keys.length
      });
    } catch (error) {
      console.error('Erro no controller ao buscar chaves por padrão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar chaves',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Verifica se uma chave existe
   */
  async checkKeyExists(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      
      if (!key) {
        res.status(400).json({
          success: false,
          message: 'Chave é obrigatória'
        });
        return;
      }

      const exists = await redisService.exists(key);
      
      res.status(200).json({
        success: true,
        data: {
          key,
          exists
        }
      });
    } catch (error) {
      console.error('Erro no controller ao verificar chave:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao verificar chave',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}

// Exporta uma instância da classe para uso nas rotas
export const redisController = new RedisController();
