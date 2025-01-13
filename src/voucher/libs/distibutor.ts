import { clone } from 'ramda';

import { createArrayWithValue } from '../helpers/voucher.calculations';
import { IssueMode } from '../types/policy.types';

type Voucher = {
  policy: {
    issueMode: IssueMode;
    stampsRequiredForReward: number;
  };
};

type Card = {
  stamps: any[];
  template?: any;
};

type Return<
  V extends Voucher = Voucher,
  C extends Card = Card,
  T extends object = object,
> = V & {
  cards: (C & {
    preforms: T[];
  })[];
};

export const distributor = <V extends Voucher, C extends Card>(
  rule: V,
  card: C,
  stampsToAdd: number,
): Return<V, C> => {
  const voucherClone = clone(rule);
  const cardClone = clone(card);

  const mode = voucherClone.policy.issueMode;
  const slotLimitPerCard = voucherClone.policy.stampsRequiredForReward;
  const filledSlots = cardClone.stamps.length;

  const template = card.template ?? {};

  const _isLimitedMode = () => mode === 'limited';
  const isUnlimitedMode = () => mode === 'unlimited';

  if (cardClone) {
    const availableSlotsOnCard = slotLimitPerCard - filledSlots;
    // isCardSlotSufficient
    // canFitAllStamps
    const canFitAllStamps = stampsToAdd <= availableSlotsOnCard;

    if (canFitAllStamps) {
      const preforms = {
        ...voucherClone,
        cards: [
          {
            ...card,
            preforms: createArrayWithValue(template, stampsToAdd),
          },
        ],
      };

      return preforms;
    }

    if (isUnlimitedMode()) {
    }
  }
};
