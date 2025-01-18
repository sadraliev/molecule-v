import {
  createArrayWithValue,
  splitToParts,
} from '../helpers/voucher.calculations';

type TDistributorArgs = {
  maxSlotsPerCard: number;
  stampsToAdd: number;
  occupiedSlots: number;
};
type TDistributedResult = {
  cards: Array<{
    isNew: boolean;
    stamps: Array<void>;
  }>;
};

/**
 * Distributes stamps across cards, filling an existing card if slots are available,
 * and creating new cards as needed for the remaining stamps.
 *
 * @template T - The input type extending TDistributorArgs.
 * @param {T} params - Parameters for stamp distribution.
 * @param {number} params.maxSlotsPerCard - The maximum number of slots available on one card.
 * @param {number} params.stampsToAdd - Total number of stamps to distribute.
 * @param {number} [params.occupiedSlots=0] - The number of already occupied slots on the current card.
 * @returns {{
 *   cards: Array<{
 *     isNew: boolean;
 *     stamps: Array<void>;
 *   }>
 * }} - An object containing an array of cards with stamp distribution details.
 */
export const stampsDistributor = <
  T extends TDistributorArgs = TDistributorArgs,
>({
  maxSlotsPerCard,
  stampsToAdd,
  occupiedSlots = 0,
}: T): TDistributedResult => {
  const blank = {
    cards: [],
  };

  const availableSlotsOnCard = Math.max(0, maxSlotsPerCard - occupiedSlots);

  const canFitNewStampsOnCurrentCard = stampsToAdd <= availableSlotsOnCard;

  if (canFitNewStampsOnCurrentCard) {
    blank.cards.push({
      isNew: false,
      stamps: createArrayWithValue(null, stampsToAdd),
    });

    return blank;
  }

  blank.cards.push({
    isNew: false,
    stamps: createArrayWithValue(null, availableSlotsOnCard),
  });

  const remainingStampsToAdd = Math.max(0, stampsToAdd - availableSlotsOnCard);

  const parts = splitToParts(maxSlotsPerCard, remainingStampsToAdd);
  const cards = parts.map((count) => {
    return {
      isNew: true,
      stamps: createArrayWithValue({}, count),
    };
  });

  blank.cards.push(...cards);

  return blank;
};
