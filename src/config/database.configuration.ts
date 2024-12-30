import { registerAs } from '@nestjs/config';

export const DATABASE_CONFIG = 'database';
export type DatabaseConfig = {
  uri: string;
};

export default registerAs(DATABASE_CONFIG, (): DatabaseConfig => {
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT;

  return {
    uri: `mongodb://${user}:${password}@${host}:${port}`,
  };
});
