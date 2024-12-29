import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  getHello(): string {
    return {
      app: {
        environment: this.configService.get('app.env'),
      },
      database: {
        name: this.configService.get('database.name'),
      },
    } as any;
  }
}
