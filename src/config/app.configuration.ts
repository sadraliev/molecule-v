import { registerAs } from '@nestjs/config';
import { Environment } from './configuration.validation';

export const APP_CONFIG = 'app';
export type AppConfig = {
  port: number;
  env: Environment;
};

export default registerAs(
  APP_CONFIG,
  (): AppConfig => ({
    port: process.env.PORT,
    env: process.env.NODE_ENV,
  }),
);
