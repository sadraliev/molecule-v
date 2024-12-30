import { ConfigModule, ConfigService } from '@nestjs/config';
import { DATABASE_CONFIG, DatabaseConfig } from './database.configuration';

export const mongooseConfig = () => ({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    return {
      uri: configService.get<DatabaseConfig>(DATABASE_CONFIG).uri,
    };
  },
  inject: [ConfigService],
});
