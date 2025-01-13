import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { STAMP_COLLECTION_NAME, StampSchema } from './stamp.schema';
import { StampService } from './stamp.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: STAMP_COLLECTION_NAME, schema: StampSchema },
    ]),
  ],
  providers: [StampService],
  exports: [StampService],
})
export class StampModule {}
