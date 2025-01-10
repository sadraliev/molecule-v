import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PosService } from './pos.service';
import { POS_COLLECTION_NAME, PoSSchema } from './schemas/pos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: POS_COLLECTION_NAME, schema: PoSSchema },
    ]),
  ],
  providers: [PosService],
  exports: [PosService],
})
export class PosModule {}
