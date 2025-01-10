import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { CustomerId } from 'src/organization/customer/types/customer.types';
import { VoucherId } from 'src/voucher/types/voucher.types';

import { CardModel, CardDocument, InjectCard } from './card.schema';
import { CardId } from './card.types';

@Injectable()
export class CardService {
  readonly logger = new Logger('Card Service');

  constructor(
    @InjectCard()
    private readonly cardModel: CardModel,
  ) {}

  async findOne(
    voucherId: VoucherId,
    customerId: CustomerId,
  ): Promise<CardDocument> {
    return this.cardModel.findOne({ voucherId, customerId });
  }

  async countByVoucherId(voucherId: VoucherId): Promise<number> {
    return this.cardModel.countDocuments({ voucherId });
  }

  async createCard(
    voucherId: VoucherId,
    customerId: CustomerId,
  ): Promise<CardDocument> {
    const newCard = new this.cardModel({ voucherId, customerId });

    newCard.save();

    return newCard;
  }
  async findSlotsByCardId(cardId: CardId) {
    return this.cardModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(cardId),
        },
      },
      {
        $addFields: {
          stampId: {
            $toString: '$_id',
          },
          customerObjectId: { $toObjectId: '$customerId' },
        },
      },
      {
        $lookup: {
          from: 'stamps',
          localField: 'stampId',
          foreignField: 'cardId',
          as: 'stamps',
        },
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customerObjectId',
          foreignField: '_id',
          as: 'customer',
        },
      },

      {
        $project: {
          id: '$_id',
          status: 1,
          redeemPosId: 1,
          completedAt: 1,
          redeemAt: 1,
          customer: {
            phone: 1,
            name: 1,
          },
          stamps: {
            id: '$_id',
            posId: 1,
            action: 1,
          },
        },
      },
    ]);
  }
}
