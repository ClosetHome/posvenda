import { redis } from '../db.js'
import { redisBot } from '../db.js';

import clickupServices from './clickupServices.js';

export class RedisService {
  
  /**
   * Busca todos os estados
   * @returns Array com todos os estados
   */
  async getEstados(): Promise<string[]> {
    try {
      const keys = await redis.keys('estados:*');
      const estados: string[] = [];
      
      for (const key of keys) {
        const estado = await redis.get(key);
        if (estado) {
          estados.push(estado);
        }
      }
      
      return estados;
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
      throw new Error('Falha ao buscar estados no Redis');
    }
  }

  /**
   * Busca um estado específico
   * @param estadoId ID do estado
   * @returns Estado encontrado ou null
   */
  async getEstado(estadoId: string): Promise<string | null> {
    try {
      const estado = await redis.get(`estados:${estadoId}`);
      return estado;
    } catch (error) {
      console.error('Erro ao buscar estado:', error);
      throw new Error('Falha ao buscar estado no Redis');
    }
  }

  /**
   * Busca todos os municípios de um estado
   * @param estado Nome ou código do estado
   * @returns Array com todos os municípios do estado
   */
  async getMunicipiosByEstado(estado: string): Promise<string[]> {
    try {
      const res:any = await redis.get(`municipios:${estado}`);
      const municipios = JSON.parse(res);
      
      return municipios;
    } catch (error) {
      console.error('Erro ao buscar municípios:', error);
      throw new Error('Falha ao buscar municípios no Redis');
    }
  }

  /**
   * Busca um município específico
   * @param estado Nome ou código do estado
   * @param municipioId ID do município
   * @returns Município encontrado ou null
   */
  async getMunicipio(estado: string, municipioId: string): Promise<string | null> {
    try {
      const municipio = await redis.get(`municipios:${estado}:${municipioId}`);
      return municipio;
    } catch (error) {
      console.error('Erro ao buscar município:', error);
      throw new Error('Falha ao buscar município no Redis');
    }
  }

  /**
   * Busca todos os CNAEs
   * @returns Array com todos os CNAEs
   */
  async getCnaes(): Promise<any> {
    try {
      const cnaes:any = await redis.get('cnaes');
      const jsCnaes = JSON.parse(cnaes);
      return jsCnaes;
    } catch (error) {
      console.error('Erro ao buscar CNAEs:', error);
      throw new Error('Falha ao buscar CNAEs no Redis');
    }
  }

  /**
   * Busca um CNAE específico
   * @param cnaeId ID do CNAE
   * @returns CNAE encontrado ou null
   */
  async getCnae(cnaeId: string): Promise<string | null> {
    try {
      const cnae = await redis.get(`cnaes:${cnaeId}`);
      return cnae;
    } catch (error) {
      console.error('Erro ao buscar CNAE:', error);
      throw new Error('Falha ao buscar CNAE no Redis');
    }
  }

  /**
   * Busca CNAEs por padrão
   * @param pattern Padrão de busca (ex: "01*" para CNAEs que começam com 01)
   * @returns Array com CNAEs que correspondem ao padrão
   */
  async getCnaesByPattern(pattern: string): Promise<string[]> {
    try {
      const keys = await redis.keys(`cnaes:${pattern}`);
      const cnaes: string[] = [];
      
      for (const key of keys) {
        const cnae = await redis.get(key);
        if (cnae) {
          cnaes.push(cnae);
        }
      }
      
      return cnaes;
    } catch (error) {
      console.error('Erro ao buscar CNAEs por padrão:', error);
      throw new Error('Falha ao buscar CNAEs por padrão no Redis');
    }
  }

  /**
   * Verifica se uma chave existe no Redis
   * @param key Chave a ser verificada
   * @returns true se existe, false caso contrário
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Erro ao verificar existência da chave:', error);
      throw new Error('Falha ao verificar chave no Redis');
    }
  }

  /**
   * Busca chaves por padrão customizado
   * @param pattern Padrão de busca
   * @returns Array com as chaves encontradas
   */
  async getKeysByPattern(pattern: string): Promise<string[]> {
    try {
      const keys = await redis.keys(pattern);
      return keys;
    } catch (error) {
      console.error('Erro ao buscar chaves por padrão:', error);
      throw new Error('Falha ao buscar chaves no Redis');
    }
  }

  async getMessageBot(phone: string, task_id:string, description:string): Promise<any> {
    try {
      const obj:any = await redisBot.get(`botconversa:${phone}`);
      let lead 
      console.log(phone)
      const parsed = JSON.parse(obj)
       if(parsed.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Cliente Retira")){
       lead = await clickupServices.updateTask(parsed.id, 'cliente retira', description, undefined )
       } else {
        lead = await clickupServices.updateTask(parsed.id, 'envio do closet', description, undefined )
       }
      let messages
      return lead;
    } catch (error) {
      console.error('Erro ao buscar chaves por padrão:', error);
      throw new Error('Falha ao buscar chaves no Redis');
    }
  }
}

// Exporta uma instância da classe para uso direto
export const redisService = new RedisService();





