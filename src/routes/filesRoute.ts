import express from 'express';
import path from 'path';
import fs from 'fs';
import {Request, Response} from 'express'
export const filesRouter = express.Router();

filesRouter.get('/files/:filename', (req:Request, res:Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'files', filename);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Arquivo não encontrado' });
      return;
    }
    
    // Verificar se é um arquivo (não diretório)
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      res.status(404).json({ error: 'Arquivo não encontrado' });
      return;
    }
    
    // Servir o arquivo
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('Erro ao servir arquivo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
