import { Logger } from '@nestjs/common';
import { TypeOf, z } from 'zod';

const environment = z.enum(['local', 'development', 'test', 'production']);

export type Environment = z.infer<typeof environment>;

const envSchema = z.object({
  NODE_ENV: environment,
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('3000'),

  DATABASE_HOST: z
    .string()
    .min(1, 'DATABASE_HOST is required')
    .default('localhost'),
  DATABASE_PORT: z
    .string()
    .transform((port) => parseInt(port, 10))
    .refine((port) => !isNaN(port) && port > 0, {
      message: 'DATABASE_PORT must be a valid number',
    }),
  DATABASE_USER: z.string().min(1, 'DATABASE_USER is required'),
  DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD is required'),
});

export type EnvSchema = z.infer<typeof envSchema>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends TypeOf<typeof envSchema> {}
  }
}

export const validate = (config: Record<string, unknown>) => {
  const logger = new Logger('environment validator');
  const validation = envSchema.safeParse(config);

  if (!validation.success) {
    logger.error(
      'Environment variable validation error:',
      validation.error.format(),
    );
    throw new Error('Invalid environment configuration');
  }

  return validation.data;
};
