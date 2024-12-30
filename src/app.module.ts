import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { mongooseConfig, rootConfig } from './config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(rootConfig()),
    MongooseModule.forRootAsync(mongooseConfig()),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
