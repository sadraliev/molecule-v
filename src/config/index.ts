import appConfiguration from './app.configuration';
import { validate } from './configuration.validation';
import databaseConfiguration from './database.configuration';
import { mongooseConfig } from './mongoose.config';

const rootConfig = () => ({
  isGlobal: true,
  envFilePath: [
    '.env.development.local',
    '.env.development',
    '.env.test.local',
    '.env.test',
    '.env',
  ],
  load: [appConfiguration, databaseConfiguration],
  validate,
});

export { rootConfig, mongooseConfig };
