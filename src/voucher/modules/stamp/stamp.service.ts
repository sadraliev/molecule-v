import { Injectable, Logger } from '@nestjs/common';

import { CardId } from '../card/card.types';

import { StampRepository } from './stamp.repository';
import { CreateStamp } from './stamp.types';

@Injectable()
export class StampService {
  private readonly logger = new Logger('Stamp Service');

  constructor(private readonly stampRepository: StampRepository) {}

  async save(stamps: CreateStamp[]) {
    return this.stampRepository.saveMany(stamps);
  }

  async getStampsByCardId(cardId: CardId) {
    return this.stampRepository.find({ cardId });
  }
}
