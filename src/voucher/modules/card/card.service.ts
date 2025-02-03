import { Injectable, Logger } from '@nestjs/common';
import { CustomerId } from 'src/organization/customer/types/customer.types';
import { VoucherId } from 'src/voucher/types/voucher.types';

import { CardRepository } from './card.repository';
import { CardEntity, CardId, CardStatus, CardStatuses } from './card.types';

@Injectable()
export class CardService {
  readonly logger = new Logger('Card Service');

  constructor(private readonly cardRepository: CardRepository) {}

  async findActive(
    voucherId: VoucherId,
    customerId: CustomerId,
  ): Promise<CardEntity | void> {
    return await this.cardRepository.findOne({
      voucherId,
      customerId,
      status: CardStatuses.Activated,
    });
  }

  async getExistingCardsCount(
    voucherId: VoucherId,
    customerId: CustomerId,
  ): Promise<number> {
    return this.cardRepository.countDocuments({ voucherId, customerId });
  }

  async countByVoucherId(voucherId: VoucherId): Promise<number> {
    return this.cardRepository.countDocuments({ voucherId });
  }

  async save(
    voucherId: VoucherId,
    customerId: CustomerId,
  ): Promise<CardEntity> {
    return await this.cardRepository.save({ voucherId, customerId });
  }
  async updateStatus(cardIds: CardId[], status: CardStatus): Promise<void> {
    await this.cardRepository.updateMany(cardIds, { status });
  }
  async getCirculatingCards(cardIds: CardId[]) {
    return await this.cardRepository.findMany(cardIds);
  }
}
