import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_CONFIG_TAG, AppConfig } from './config/app.configuration';
import {
  DATABASE_CONFIG_TAG,
  DatabaseConfig,
} from './config/database.configuration';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  getHello(): string {
    return {
      app: {
        environment: this.configService.get<AppConfig>(APP_CONFIG_TAG).env,
      },
      database: {
        name: this.configService.get<DatabaseConfig>(DATABASE_CONFIG_TAG).uri,
      },
    } as any;
  }
}
