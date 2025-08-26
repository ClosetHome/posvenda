import express from 'express';
import redisRoutes from './routes/redisRoutes.js';
import clickupHook from './routes/clickupHook.js';
import { filesRouter } from './routes/filesRoute.js';
import  opaenAiHook  from './routes/opeanAi.js';

const app = express();
import cors from 'cors'


//app.use(express.text({ type: "application/json" }));

const PORT = process.env.PORT || 3000; 

app.use(cors());
app.use(express.json());
app.use('/api/redis', redisRoutes);
app.use('/api/clickup', clickupHook);
app.use('/api', filesRouter);
//app.use('/api/stream', opaenAiHook);


app.get('/api/status', (req, res) => {
    res.json({ status: 'online', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📧 Dashboard disponível em: http://localhost:${PORT}`);
});


export default app;