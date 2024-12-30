import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_CONFIG, AppConfig } from './config/app.configuration';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  getHello(): string {
    return {
      app: {
        environment: this.configService.get<AppConfig>(APP_CONFIG).env,
      },
      database: {
        name: this.configService.get('database.uri'),
      },
    } as any;
  }
}
