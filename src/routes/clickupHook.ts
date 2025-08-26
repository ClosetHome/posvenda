import { Router } from 'express';
import { clickupHook, clickupHookMedias, clickupHookFail, clickupHookChat } from '../controllers/clickupHook.js';

const router = Router();

router.post('/', clickupHook);
router.post('/medias', clickupHookMedias);
router.post('/fail', clickupHookFail);
router.post('/chat', clickupHookChat);

export default router