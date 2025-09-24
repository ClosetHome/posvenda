import { Response, Request, NextFunction } from 'express';
import validator from 'validator';
import auth from '../auth';

function validateSchema(req: Request, res: Response, next: NextFunction) : void | any {
  const { name, email, password } = req.body;

  // Validar name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(422).json({ error: 'name inválido' });
  }

  // Validar email
  if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
    return res.status(422).json({ error: 'Email inválido' });
  }

  // Validar password
  if (!password || typeof password !== 'string' || password.trim().length < 6) {
    return res.status(422).json({ error: 'Senha inválida (deve ter pelo menos 6 caracteres)' });
  }

  next();
}

function validateLogin(req: Request, res: Response, next: NextFunction) : void | any {
  const { email, password } = req.body;

  // Validar email
  if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
    return res.status(422).json({ error: 'Email inválido' });
  }

  // Validar password
  if (!password || typeof password !== 'string' || password.trim().length < 6) {
    return res.status(422).json({ error: 'Senha inválida (deve ter pelo menos 6 caracteres)' });
  }

  next();
}

function validateUpdateUser(req: Request, res: Response, next: NextFunction): void | any {
  const { name, email, password } = req.body;

  // Validar name (se fornecido)
  if (name && (typeof name !== 'string' || name.trim().length === 0)) {
    return res.status(422).json({ error: 'name inválido' });
  }

  // Validar email (se fornecido)
  if (email && (typeof email !== 'string' || !validator.isEmail(email))) {
    return res.status(422).json({ error: 'Email inválido' });
  }

  // Validar password (se fornecida)
  if (password && (typeof password !== 'string' || password.trim().length < 6)) {
    return res.status(422).json({ error: 'Senha inválida (deve ter pelo menos 6 caracteres)' });
  }

  next();
}

async function validateAuth(req: Request, res: Response, next: NextFunction): Promise<void | any> {
  try {
    const token = req.headers["x-access-token"] as string;
    if (!token) return res.status(401).end();

    const payload = await auth.verify(token);
    if (!payload) return res.status(401).end();

    res.locals.payload = payload;

    next();
  } catch (error) {
    console.log(`validateAuth: ${error}`);
    res.status(400).end();
  }
}

export { validateSchema, validateLogin, validateUpdateUser, validateAuth };