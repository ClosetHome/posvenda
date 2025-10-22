import {sqlToll} from '../controllers/sqlTool';
import { Router } from 'express';


const sqlRouter = Router();

sqlRouter.post('/search', sqlToll);

export default sqlRouter;
