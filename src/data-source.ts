import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const sslEnabled = process.env.DB_SSL === 'true';

const entitiesPaths = [
  path.join(__dirname, 'modules', 'users', 'entities', '*.entity.{ts,js}'),
  path.join(__dirname, 'modules', 'organizations', 'entities', '*.entity.{ts,js}'),
  path.join(__dirname, 'modules', 'admin', 'entities', '*.entity.{ts,js}'),
  path.join(__dirname, 'modules', 'audit', 'entities', '*.entity.{ts,js}'),
  path.join(__dirname, 'modules', 'documents', 'entities', '*.entity.{ts,js}'),
  path.join(__dirname, 'modules', 'notifications', 'entities', '*.entity.{ts,js}'),
  path.join(__dirname, 'modules', 'verifications', 'entities', '*.entity.{ts,js}'),
];

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: entitiesPaths,
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: ['query', 'error'],
  ...(sslEnabled && { ssl: { rejectUnauthorized: false } }),
});
