import { Request, Response } from 'express';
import  {sequelize}  from '../db';

export const sqlToll = async (req: Request, res: Response) => {
  const { query } = req.body;
  try {
    const result: any = await sequelize.query(query);
    console.log(result[0])
    res.json(result);
  } catch (error) {
    res.status(500).send(error);
  }
};