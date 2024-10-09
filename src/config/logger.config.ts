import { registerAs } from '@nestjs/config';
import { LogLevel } from 'src/common/services/logger.service';

export default registerAs('logger', () => ({
  level: (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel,
  logToFile: process.env.LOG_TO_FILE === 'true',
  logDir: process.env.LOG_DIR || 'logs',
  maxLogSize: parseInt(process.env.MAX_LOG_SIZE || '10485760', 10), // 10 MB default
  maxFiles: parseInt(process.env.MAX_LOG_FILES || '5', 10),
  consoleLevel: (
    process.env.CONSOLE_LOG_LEVEL || 'info'
  ).toLowerCase() as LogLevel,
}));
