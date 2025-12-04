import { mercadoPago } from '../controllers/mercadoPagoController';
import { Router } from 'express';

const router = Router();

router.post('/woocommerce', mercadoPago);

export default router;

