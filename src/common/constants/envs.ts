import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.APP_ENV || 'development',
  name: process.env.APP_NAME,
  port: process.env.APP_PORT || 3000,
  dbUri: process.env.DB_URI,
  encryptionMasterKey: process.env.ENCRYPTION_MASTER_KEY,
}));
