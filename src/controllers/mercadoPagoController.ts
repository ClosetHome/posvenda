import { Request, Response } from 'express';
import { ProccessOrder } from '../services/mercadoPagoService';



export async function mercadoPago(req: Request, res: Response) {
    try {
        console.log(JSON.stringify(req.body, null, 2))
        const response = await ProccessOrder(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error creating preference:', error);
        res.status(500).json({ error: 'Error creating preference' });
    }
}