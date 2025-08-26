import { Sequelize, Dialect } from 'sequelize';
import dotenv from 'dotenv';
import Redis from 'ioredis'
dotenv.config();

export const redis2 = new Redis(process.env.REDIS_URL_CREDS2 || '')
export const redis = new Redis(process.env.REDIS_URL_CREDS || '')
export const redisBot = new Redis(process.env.REDIS_URL_BOT || '')

const dbName = process.env.DB_NAME!;
const dbUser = process.env.DB_USER!;
const dbPassword = process.env.DB_PASSWORD!;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;
const dialect = 'postgres'! as Dialect;


const getDialect = (dialect: string): Dialect => {
  const validDialects: Dialect[] = ['mysql', 'postgres', 'sqlite', 'mariadb', 'mssql'];
  if (validDialects.includes(dialect as Dialect)) {
    return dialect as Dialect;
  }
  throw new Error(`Invalid dialect: ${dialect}`);
};
// Criar instância do Sequelize
export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  dialect: getDialect(dialect),
  host: dbHost,
  port: dbPort,
  logging: false
});