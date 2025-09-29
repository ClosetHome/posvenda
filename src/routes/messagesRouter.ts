import { Router } from 'express';
import messagesController from '../controllers/messagesController.js';
import { handleUpload } from '../middlewares/upload.js';

const router = Router();

// Criar nova mensagem pós-venda
router.post('/', messagesController.create);

// Upload de arquivo para anexo
router.post('/upload', handleUpload, messagesController.uploadAttachment);

// Criar mensagem com anexo (upload + mensagem em uma única requisição)
router.post('/with-upload', handleUpload, messagesController.createMessageWithUpload);

// Criar mensagem com anexo (dados do arquivo já processados)
router.post('/with-attachment', messagesController.createWithAttachment);

// Buscar todas as mensagens com filtros
router.get('/', messagesController.findAll);

// Buscar mensagens com paginação
router.get('/paginated', messagesController.findWithPagination);

// Contar mensagens
router.get('/count', messagesController.count);

// Buscar mensagens enviadas
router.get('/sent', messagesController.findSentMessages);

// Buscar mensagens pendentes
router.get('/pending', messagesController.findPendingMessages);

// Buscar mensagens agendadas
router.get('/scheduled', messagesController.findScheduledMessages);

// Buscar mensagens agendadas para hoje
router.get('/scheduled-today', messagesController.findScheduledForToday);

// Buscar mensagens recentes
router.get('/recent', messagesController.findRecent);

// Obter estatísticas das mensagens
router.get('/stats', messagesController.getStats);

// Buscar mensagens por status de envio
router.get('/sent-status', messagesController.findBySentStatus);

// Criar mensagens em lote

router.post('/mark-multiple-sent', messagesController.markMultipleAsSent);

// Buscar mensagens por lead ID
router.get('/lead/:leadId', messagesController.findByLeadId);

// Verificar se mensagem existe
router.get('/exists/:id', messagesController.exists);

// Buscar mensagem por ID
router.get('/:id', messagesController.findById);

// Atualizar mensagem por ID
router.put('/:id', messagesController.update);

// Marcar mensagem como enviada
router.patch('/:id/sent', messagesController.markAsSent);

// Enviar mensagem agora
router.post('/:id/send', messagesController.sendMessage);

// Agendar mensagem
router.post('/:id/schedule', messagesController.schedule);

// Deletar mensagem por ID
router.delete('/:id', messagesController.delete);

export default router;
