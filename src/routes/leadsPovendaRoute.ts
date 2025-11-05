import { Router } from 'express';
import posVendaLeadsController from '../controllers/posvendaLeadsController.js';

const router = Router();

// Criar novo lead pós-venda
router.post('/', posVendaLeadsController.create);

// Buscar todos os leads com filtros e paginação
router.get('/', posVendaLeadsController.findAll);

// Buscar leads com paginação
router.get('/paginated', posVendaLeadsController.findWithPagination);

// Contar leads
router.get('/count', posVendaLeadsController.count);

// Buscar leads com tasks
router.get('/with-tasks', posVendaLeadsController.findWithTasks);

// Buscar leads com mensagens
router.get('/with-messages', posVendaLeadsController.findWithMessages);

// Buscar leads com todas as relações
router.get('/with-relations', posVendaLeadsController.findWithAllRelations);

// Verificar se email existe
router.get('/email-exists/:email', posVendaLeadsController.emailExists);

// Buscar leads por status
router.get('/status/:status', posVendaLeadsController.findByStatus);

// Buscar lead por email
router.get('/email/:email', posVendaLeadsController.findByEmail);

// Verificar se lead existe
router.get('/exists/:id', posVendaLeadsController.exists);

// Buscar lead por ID
router.get('/:id', posVendaLeadsController.findById);

// Atualizar lead por ID
router.put('/:id', posVendaLeadsController.update);

// Deletar lead por ID
router.delete('/:id', posVendaLeadsController.delete);

// Atualizar nome do lead por task ID
router.post('/updatename/bytask', posVendaLeadsController.updateLeadNameByTaskId);

export default router;
