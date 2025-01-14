import { clone } from 'ramda';

import {
  createArrayWithValue,
  splitToParts,
} from '../helpers/voucher.calculations';
import { IssueMode } from '../types/policy.types';

type Voucher = {
  policy: {
    issueMode: IssueMode;
    stampsRequiredForReward: number;
  };
};

type Card = {
  stamps: any[];
};

type CardUnion<C extends Card = Card, T extends object = object> = Array<
  (C & { isNew: false; stamps: T[] }) | { isNew: true; stamps: T[] }
>;

type Return<V extends Voucher = Voucher> = V & {
  cards: CardUnion;
};

export const distributor = <V extends Voucher, C extends Card>(
  rule: V,
  card: C,
  stampsToAdd: number,
): Return<V> => {
  const voucherClone = clone(rule);
  const cardClone = clone(card);

  const mode = voucherClone.policy.issueMode;
  const slotLimitPerCard = voucherClone.policy.stampsRequiredForReward;
  const filledSlots = cardClone.stamps.length;

  const template = {};

  const _isLimitedMode = () => mode === 'limited';
  const isUnlimitedMode = () => mode === 'unlimited';

  if (cardClone) {
    const availableSlotsOnCard = slotLimitPerCard - filledSlots;
    // isCardSlotSufficient
    // canFitAllStamps
    const canFitAllStamps = stampsToAdd <= availableSlotsOnCard;

    if (canFitAllStamps) {
      const voucher = {
        ...voucherClone,
        cards: [
          {
            ...cardClone,
            isNew: false,
            stamps: createArrayWithValue(template, stampsToAdd),
          },
        ],
      };

      return voucher;
    }

    if (isUnlimitedMode()) {
      const availableSlotsOnCard = slotLimitPerCard - filledSlots;
      const remainingStampsToAdd = stampsToAdd - availableSlotsOnCard;

      const voucher = {
        ...voucherClone,
        cards: [
          {
            ...cardClone,
            isNew: false,
            stamps: createArrayWithValue(template, stampsToAdd),
          },
        ] as CardUnion,
      };

      const parts = splitToParts(slotLimitPerCard, remainingStampsToAdd);
      const cards = parts.map((count) => {
        return {
          isNew: true,
          stamps: createArrayWithValue(template, count),
        };
      });

      voucher.cards.push(...cards);

      return voucher;
    }
  }
};
