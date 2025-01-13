import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { VOUCHER_COLLECTION_NAME } from 'src/voucher/schemas/voucher.schema';

import { Card, cardStatus, CardStatus, CardStatuses } from './card.types';

export type CardDocument = HydratedDocument<CardDefinition>;
export type CardModel = Model<CardDefinition>;

@Schema({ timestamps: true })
export class CardDefinition implements Card {
  @Prop({ type: Types.ObjectId, ref: VOUCHER_COLLECTION_NAME, required: true })
  voucherId: string;

  @Prop({ type: String })
  customerId: string;

  @Prop({
    required: true,
    enum: cardStatus,
    default: CardStatuses.Activated,
  })
  status: CardStatus;

  @Prop({ type: String })
  redeemPosId?: string;

  @Prop({ type: Date })
  completedAt?: string;

  @Prop({ type: Date })
  redeemAt?: string;
}

export const CARD_COLLECTION_NAME = 'cards';
export const InjectCard = () => InjectModel(CARD_COLLECTION_NAME);
export const CardSchema = SchemaFactory.createForClass(CardDefinition);
