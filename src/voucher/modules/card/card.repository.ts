import { Injectable } from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { toObjectId } from 'src/lib';

import { InjectCard, CardModel } from './card.schema';
import { Card, CardEntity, CardId, CirculatingCard } from './card.types';

@Injectable()
export class CardRepository {
  constructor(@InjectCard() private readonly cardModel: CardModel) {}

  async save(card: Card): Promise<CardEntity> {
    const document = new this.cardModel(card);

    await document.save();

    return document.toObject<CardEntity>();
  }

  async findOne<T extends CardEntity>(
    card: Partial<T>,
  ): Promise<CardEntity | void> {
    const document = await this.cardModel.findOne(card);

    if (!document) {
      return;
    }

    return document.toObject<CardEntity>();
  }

  async countDocuments<T extends CardEntity>(
    filters: Partial<T>,
  ): Promise<number> {
    return this.cardModel.countDocuments(filters);
  }

  async updateMany(ids: CardId[], update?: UpdateQuery<CardEntity>) {
    return await this.cardModel.updateMany(
      { _id: { $in: toObjectId(ids) } },
      { $set: update },
    );
  }
  async findMany(cardIds: CardId[]): Promise<CirculatingCard[]> {
    return await this.cardModel.aggregate<CirculatingCard>([
      {
        $match: {
          _id: {
            $in: toObjectId(cardIds),
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
