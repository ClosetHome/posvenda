import { Router } from 'express';
import { redisController } from '../controllers/redisController.js';

const router = Router();

// Rotas para Estados
router.get('/estados', redisController.getEstados.bind(redisController));
router.get('/estados/:estadoId', redisController.getEstado.bind(redisController));
router.post('/message', redisController.updateTaksData.bind(redisController));
// Rotas para Municípios
router.get('/municipios/:estado', redisController.getMunicipiosByEstado.bind(redisController));
router.get('/municipios/:estado/:municipioId', redisController.getMunicipio.bind(redisController));

// Rotas para CNAEs
router.get('/cnaes', redisController.getCnaes.bind(redisController));
router.get('/cnaes/:cnaeId', redisController.getCnae.bind(redisController));

// Rotas utilitárias
router.get('/keys', redisController.getKeysByPattern.bind(redisController));
router.get('/exists/:key', redisController.checkKeyExists.bind(redisController));

export default router;
