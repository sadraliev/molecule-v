import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

const logger = new Logger('Seeder');

async function bootstrap() {
  logger.log('Starting the seeding process...');

  const app = await NestFactory.createApplicationContext(SeederModule);

  logger.log('Application context successfully created.');

  const seeder = app.get(SeederService);

  logger.log('Seeder service initialized.');

  try {
    logger.log('Running seeder...');
    await seeder.run();
    logger.log('Seeding completed successfully.');
  } catch (error) {
    logger.error('An unexpected error occurred during bootstrap::', error);
    process.exit(1);
  } finally {
    logger.log('Closing application context...');
    await app.close();
    logger.log('Application context closed.');
  }
}

bootstrap();
