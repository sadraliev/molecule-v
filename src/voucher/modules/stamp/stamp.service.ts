import { Injectable, Logger } from '@nestjs/common';

import { CardId } from '../card/card.types';

import { InjectStamp, StampDocument, StampModel } from './stamp.schema';
import { CreateStamp } from './stamp.types';

@Injectable()
export class StampService {
  private readonly logger = new Logger('Stamp Service');

  constructor(
    @InjectStamp()
    private readonly stampModel: StampModel,
  ) {}

  async save(stamps: CreateStamp[]) {
    return this.stampModel.insertMany(stamps);
  }

  async getStampsByCardId(cardId: CardId): Promise<StampDocument[]> {
    return this.stampModel.find({ cardId });
  }
}
