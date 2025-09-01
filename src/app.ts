import express from 'express';
import redisRoutes from './routes/redisRoutes.js';
import clickupHook from './routes/clickupHook.js';
import { filesRouter } from './routes/filesRoute.js';
import cors from 'cors'
const app = express();

const PORT = process.env.PORT || 3006; 

app.use(cors());
app.use(express.json());
app.use('/api/redis', redisRoutes);
app.use('/api/clickup', clickupHook);
app.use('/api', filesRouter);



app.get('/api/status', (req, res) => {
    res.json({ status: 'online', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📧 Dashboard disponível em: http://localhost:${PORT}`);
    console.log('hora inicio', new Date().toISOString())
});


export default app;