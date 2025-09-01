import { Router } from 'express';
import { clickupHook, clickupHookMedias, clickupHookFail, clickupHookChat, clickupTaskUpdatedHook } from '../controllers/clickupHook.js';

const router = Router();

router.post('/', clickupHook);
router.post('/medias', clickupHookMedias);
router.post('/fail', clickupHookFail);
router.post('/chat', clickupHookChat);
router.post('/task-updated', clickupTaskUpdatedHook);

export default router