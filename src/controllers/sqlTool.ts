import { Request, Response } from 'express';
import  {sequelize}  from '../db';

export const sqlToll = async (req: Request, res: Response) => {
  const { query } = req.body;
  try {
    const result: any = await sequelize.query(query);
    console.log(result[0])
    const resultString = result[0].map((item: any) => JSON.stringify(item.page_content)).join('\n\n');
    console.log(resultString)
    res.json(resultString);
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
};