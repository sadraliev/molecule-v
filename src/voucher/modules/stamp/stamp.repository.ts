import { Injectable } from '@nestjs/common';

import { InjectStamp, StampModel } from './stamp.schema';
import { CreateStamp, StampEntity } from './stamp.types';

@Injectable()
export class StampRepository {
  constructor(@InjectStamp() private readonly stampModel: StampModel) {}

  async saveMany(stamps: CreateStamp[]): Promise<StampEntity[]> {
    const document = await this.stampModel.insertMany(stamps);

    return document.map((doc) => doc.toObject<StampEntity>());
  }

  async find<T extends StampEntity>(
    filters: Partial<T>,
  ): Promise<StampEntity[]> {
    const document = await this.stampModel.find(filters);

    if (!document.length) {
      return [];
    }

    return document.map((doc) => doc.toObject<StampEntity>());
  }
}
