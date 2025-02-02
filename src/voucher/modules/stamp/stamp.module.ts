import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StampRepository } from './stamp.repository';
import { STAMP_COLLECTION_NAME, StampSchema } from './stamp.schema';
import { StampService } from './stamp.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: STAMP_COLLECTION_NAME, schema: StampSchema },
    ]),
  ],
  providers: [StampService, StampRepository],
  exports: [StampService],
})
export class StampModule {}
