import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const getEntitiesPath = (moduleName: string) =>
  path.join(__dirname, 'modules', moduleName, 'entities', '*.entity.{ts,js}');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    getEntitiesPath('users'),
    getEntitiesPath('organizations'),
    getEntitiesPath('admin'),
    getEntitiesPath('audit'),
    getEntitiesPath('auth'),
    getEntitiesPath('documents'),
    getEntitiesPath('health'),
    getEntitiesPath('notifications'),
    getEntitiesPath('settings'),
    getEntitiesPath('verifications'),
  ],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: ['query', 'error'],
  ssl: {
    rejectUnauthorized: false,
  },
});

export default AppDataSource;
