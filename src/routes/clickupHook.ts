import { Router } from 'express';
import { clickupHook, clickupHookMedias, clickupHookFail, clickupHookChat, clickupTaskUpdatedHook, clickupHookChatPre, clickupHookUpdatePre, clickupHookChatPreFollow } from '../controllers/clickupHook.js';

const router = Router();

router.post('/', clickupHook);
router.post('/medias', clickupHookMedias);
router.post('/fail', clickupHookFail);
router.post('/chat', clickupHookChat);
router.post('/task-updated', clickupTaskUpdatedHook);
router.post('/chat-pre', clickupHookChatPre);
router.post('/update-pre', clickupHookUpdatePre);
router.post('/chat-pre-follow', clickupHookChatPreFollow);

export default router