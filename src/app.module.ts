import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { mongooseConfig, rootConfig } from './config';
import { MongooseModule } from '@nestjs/mongoose';
import { VoucherModule } from './voucher/voucher.module';

@Module({
  imports: [
    ConfigModule.forRoot(rootConfig()),
    MongooseModule.forRootAsync(mongooseConfig()),
    VoucherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
