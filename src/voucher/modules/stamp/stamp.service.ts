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

  async saveStamps(stamps: CreateStamp[]) {
    return this.stampModel.insertMany(stamps);
  }

  async getStampsByCardId(cardId: CardId): Promise<StampDocument[]> {
    return this.stampModel.find({ cardId });
  }
}

/**
 * Checks if there is enough space to add new stamps to a card.
 *
 * @param totalSlots The total number of possible slots on the card.
 * @param stampsToAdd The number of stamps to add.
 * @param existingSlots The number of slots already occupied on the card.
 * @returns True if there is enough space, false otherwise.
 */
export const hasEnoughSlotsForStamps = (
  stampsToAdd: number,
  totalSlots: number,
  existingSlots: number,
): boolean => stampsToAdd <= totalSlots - existingSlots;

/**
 * Creates an array filled with a specified value.
 *
 * @param value The value to fill the array with.
 * @param length The number of elements in the array. Default = 1
 * @returns An array filled with the specified value.
 */
export const createArrayWithValue = <T>(value: T, length: number = 1): T[] =>
  Array.from({ length }, () => value);
