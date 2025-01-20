import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { rootConfig, mongooseConfig } from 'src/config';
import { VoucherModule } from 'src/voucher/voucher.module';

import { SeederService } from './seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot(rootConfig()),
    MongooseModule.forRootAsync(mongooseConfig()),
    VoucherModule,
  ],
  providers: [SeederService],
})
export class SeederModule {}
