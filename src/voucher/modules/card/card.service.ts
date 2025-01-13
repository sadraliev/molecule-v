import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  Customer,
  CustomerId,
} from 'src/organization/customer/types/customer.types';
import { VoucherId } from 'src/voucher/types/voucher.types';

import { Stamp } from '../stamp/stamp.types';

import {
  CardModel,
  CardDocument,
  InjectCard,
  CardDefinition,
} from './card.schema';
import { Card, CardId, CardStatus, CardStatuses } from './card.types';

@Injectable()
export class CardService {
  readonly logger = new Logger('Card Service');

  constructor(
    @InjectCard()
    private readonly cardModel: CardModel,
  ) {}

  async findActive(
    voucherId: VoucherId,
    customerId: CustomerId,
  ): Promise<CardDefinition & { _id: Types.ObjectId }> {
    return this.cardModel
      .findOne({
        voucherId,
        customerId,
        status: CardStatuses.Activated,
      })
      .lean();
  }

  async countByVoucherId(voucherId: VoucherId): Promise<number> {
    return this.cardModel.countDocuments({ voucherId });
  }

  async save(
    voucherId: VoucherId,
    customerId: CustomerId,
  ): Promise<CardDocument> {
    const newCard = new this.cardModel({ voucherId, customerId });

    newCard.save();

    return newCard;
  }
  async updateStatus(cardIds: CardId[], status: CardStatus): Promise<void> {
    const objectIds = cardIds.map((id) => new Types.ObjectId(id));

    await this.cardModel.updateMany(
      { _id: { $in: objectIds } },
      { $set: { status } },
    );
  }
  async findSlotsByCardId(cardIds: CardId[]) {
    const objectIds = cardIds.map((id) => new Types.ObjectId(id));

    return await this.cardModel.aggregate<
      Card & {
        id: string;
        stamps: Stamp[] & { id: string };
        customer: Omit<Customer, 'status'>;
      }
    >([
      {
        $match: {
          _id: {
            $in: objectIds,
          },
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
        $addFields: {
          customer: { $arrayElemAt: ['$customer', 0] }, // Extract the first customer
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          status: 1,
          redeemPosId: 1,
          completedAt: 1,
          redeemAt: 1,
          customer: {
            phone: '$customer.phone',
            name: '$customer.name',
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
