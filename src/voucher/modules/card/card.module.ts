import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CARD_COLLECTION_NAME, CardSchema } from './card.schema';
import { CardService } from './card.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CARD_COLLECTION_NAME,
        schema: CardSchema,
      },
    ]),
  ],
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}
