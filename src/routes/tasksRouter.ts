import { Router } from 'express';
import clickupTasksController from '../controllers/clickupTaks.js';

const router = Router();

// Criar nova task
router.post('/', clickupTasksController.create);

// Criar tasks em lote
router.post('/bulk', clickupTasksController.bulkCreate);

// Buscar todas as tasks com filtros
router.get('/', clickupTasksController.findAll);

// Buscar tasks com paginação
router.get('/paginated', clickupTasksController.findWithPagination);

// Contar tasks
router.get('/count', clickupTasksController.count);

// Contar tasks por status
router.get('/status-count', clickupTasksController.countByStatus);

// Buscar tasks recentes
router.get('/recent', clickupTasksController.findRecent);

// Buscar tasks por período
router.get('/date-range', clickupTasksController.findByDateRange);

// Buscar tasks por lead ID
router.get('/lead/:leadId', clickupTasksController.findByLeadId);

// Buscar tasks por status
router.get('/status/:status', clickupTasksController.findByStatus);

// Buscar tasks por list ID
router.get('/list/:listId', clickupTasksController.findByListId);

// Verificar se task existe
router.get('/exists/:id', clickupTasksController.exists);

// Atualizar múltiplos status
router.patch('/status/bulk', clickupTasksController.updateMultipleStatus);

// Atualizar status de uma task
router.patch('/:id/status', clickupTasksController.updateStatus);

// Atualizar task
router.put('/:id', clickupTasksController.update);

// Deletar task por ID
router.delete('/:id', clickupTasksController.delete);

// Buscar task por ID
router.get('/:id', clickupTasksController.findById);

export default router;
