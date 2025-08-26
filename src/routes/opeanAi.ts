import { Router } from 'express';

import { opaenAiHook } from '../controllers/opeanai.js';


const router = Router();

router.post('/', opaenAiHook);

export default router;
