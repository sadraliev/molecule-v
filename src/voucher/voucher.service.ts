import { Injectable, Logger } from '@nestjs/common';
import { partition } from 'ramda';
import { UserId } from 'src/lib';
import { CustomerService } from 'src/organization/customer/customer.service';

import { createStampsDto } from './dtos/create-stamp.dto';
import { CreateVoucherDto } from './dtos/create-voucher.dto';
import {
  getPolicy,
  getReward,
  getVoucher,
  makeVoucher,
} from './helpers/voucher.calculations';
import { stampsDistributor } from './libs/distibutor';
import { CardService } from './modules/card/card.service';
import { CardStatuses } from './modules/card/card.types';
import { StampService } from './modules/stamp/stamp.service';
import {
  InjectPolicy,
  PolicyDocument,
  PolicyModel,
} from './schemas/policy.schema';
import {
  InjectReward,
  RewardDocument,
  RewardModel,
} from './schemas/reward.schema';
import {
  InjectVoicher,
  VoucherDocument,
  VoucherModel,
} from './schemas/voucher.schema';
import { VoucherId } from './types/voucher.types';

@Injectable()
export class VoucherService {
  readonly logger = new Logger('Voucher service');
  constructor(
    @InjectReward()
    private readonly rewardModel: RewardModel,
    @InjectPolicy()
    private readonly policyModel: PolicyModel,
    @InjectVoicher()
    private readonly voucherModel: VoucherModel,

    private readonly customerService: CustomerService,

    private readonly cardService: CardService,

    private readonly stampService: StampService,
  ) {}

  async create(
    createVoucher: CreateVoucherDto,
    userId: UserId,
  ): Promise<VoucherDocument> {
    const withUser = makeVoucher(userId, getVoucher(createVoucher));

    const policy = await new this.policyModel(getPolicy(createVoucher)).save();

    const withPolicy = withUser(policy.id);

    const reward = await new this.rewardModel(getReward(createVoucher)).save();

    const fulledVoucher = withPolicy(reward.id);
    const voucher = await new this.voucherModel(fulledVoucher).save();

    return voucher;
  }

  async addStampsToCard({
    voucherId,
    forCustomer,
    stampsToAdd,
    posId,
  }: createStampsDto & { voucherId: VoucherId }) {
    const payload = {
      cards: [],
      leftoverStamps: 0,
    };
    const voucher = await this.voucherModel
      .findById(voucherId)
      .populate<{ policy: PolicyDocument }>('policyId')
      .populate<{ reward: RewardDocument }>('rewardId');

    const customer = await this.customerService.findOrCreate(forCustomer);
    const card = await this.cardService.findActive(voucher.id, customer.id);

    const cardIdsToUpdateStatus = [];
    const newStampsForInserting = [];
    const isLimitedMode = () => voucher.policy.issueMode === 'limited';
    const isUnliminedMode = () => voucher.policy.issueMode === 'unlimited';

    if (!card) {
      const card = await this.cardService.save(voucher.id, customer.id);

      cardIdsToUpdateStatus.push(card._id.toString());
      const existingSlots = await this.stampService.getStampsByCardId(
        card._id.toString(),
      );

      const stamps = stampsDistributor({
        maxSlotsPerCard: voucher.policy.stampsRequiredForReward,
        occupiedSlots: existingSlots.length,
        stampsToAdd,
      });

      const [stampsForExistingCard, stampsForNewCards] = partition(
        (card) => card.isNew === false,
        stamps.cards,
      );

      if (stampsForExistingCard.length) {
        stampsForExistingCard.forEach(({ stamps }) =>
          stamps.forEach(() =>
            newStampsForInserting.push({ cardId: card._id.toString(), posId }),
          ),
        );
      }

      if (isUnliminedMode()) {
        for (const card of stampsForNewCards) {
          const newCard = await this.cardService.save(voucher.id, customer.id);

          card.stamps.forEach(() =>
            newStampsForInserting.push({ cardId: newCard.id, posId }),
          );
          cardIdsToUpdateStatus.push(newCard._id.toString());
        }
      }

      if (isLimitedMode()) {
        const currentCardQuantity =
          await this.cardService.getExistingCardsCount(voucher.id, customer.id);

        const availableCardsForNewStamps = Math.max(
          0,
          voucher.policy.maxReissue - currentCardQuantity,
        );

        const canFitAllStamps =
          stampsForNewCards.length <= availableCardsForNewStamps;

        if (canFitAllStamps) {
          for (const card of stampsForNewCards) {
            const newCard = await this.cardService.save(
              voucher.id,
              customer.id,
            );

            card.stamps.forEach(() =>
              newStampsForInserting.push({ cardId: newCard.id, posId }),
            );
            cardIdsToUpdateStatus.push(newCard._id.toString());
          }
        }
        const availableStampsForNewCards = stampsForNewCards.slice(
          0,
          availableCardsForNewStamps,
        );

        const remainingStamps = stampsForNewCards.slice(
          availableCardsForNewStamps,
        );

        for (const card of availableStampsForNewCards) {
          const newCard = await this.cardService.save(voucher.id, customer.id);

          card.stamps.forEach(() =>
            newStampsForInserting.push({ cardId: newCard.id, posId }),
          );
          cardIdsToUpdateStatus.push(newCard._id.toString());
        }

        payload.leftoverStamps = remainingStamps.reduce(
          (acc, cur) => acc + cur.stamps.length,
          0,
        );
      }

      await this.stampService.save(newStampsForInserting);

      const cardWithSlots = await this.cardService.findSlotsByCardId(
        cardIdsToUpdateStatus,
      );

      const completedCards = cardWithSlots
        .filter(
          (filledCard) =>
            filledCard.stamps.length === voucher.policy.stampsRequiredForReward,
        )
        .map((fullcard) => fullcard.id);

      if (completedCards.length) {
        await this.cardService.updateStatus(
          completedCards,
          CardStatuses.Completed,
        );
      }
      const freshedCards = await this.cardService.findSlotsByCardId(
        cardIdsToUpdateStatus,
      );

      payload.cards.push(...freshedCards);

      return payload;
    }

    cardIdsToUpdateStatus.push(card._id.toString());
    const existingSlots = await this.stampService.getStampsByCardId(
      card._id.toString(),
    );

    if (!existingSlots.length) {
      this.logger.warn('Detected the card without slots');
    }
    const stamps = stampsDistributor({
      maxSlotsPerCard: voucher.policy.stampsRequiredForReward,
      occupiedSlots: existingSlots.length,
      stampsToAdd,
    });

    const [stampsForExistingCard, stampsForNewCards] = partition(
      (card) => card.isNew === false,
      stamps.cards,
    );

    if (stampsForExistingCard.length) {
      stampsForExistingCard.forEach(({ stamps }) =>
        stamps.forEach(() =>
          newStampsForInserting.push({ cardId: card._id.toString(), posId }),
        ),
      );
    }

    if (isUnliminedMode()) {
      for (const card of stampsForNewCards) {
        const newCard = await this.cardService.save(voucher.id, customer.id);

        card.stamps.forEach(() =>
          newStampsForInserting.push({ cardId: newCard.id, posId }),
        );
        cardIdsToUpdateStatus.push(newCard._id.toString());
      }
    }

    if (isLimitedMode()) {
      const currentCardQuantity = await this.cardService.getExistingCardsCount(
        voucher.id,
        customer.id,
      );

      const availableCardsForNewStamps = Math.max(
        0,
        voucher.policy.maxReissue - currentCardQuantity,
      );

      const canFitAllStamps =
        stampsForNewCards.length <= availableCardsForNewStamps;

      if (canFitAllStamps) {
        for (const card of stampsForNewCards) {
          const newCard = await this.cardService.save(voucher.id, customer.id);

          card.stamps.forEach(() =>
            newStampsForInserting.push({ cardId: newCard.id, posId }),
          );
          cardIdsToUpdateStatus.push(newCard._id.toString());
        }
      }
      const availableStampsForNewCards = stampsForNewCards.slice(
        0,
        availableCardsForNewStamps,
      );

      const remainingStamps = stampsForNewCards.slice(
        availableCardsForNewStamps,
      );

      for (const card of availableStampsForNewCards) {
        const newCard = await this.cardService.save(voucher.id, customer.id);

        card.stamps.forEach(() =>
          newStampsForInserting.push({ cardId: newCard.id, posId }),
        );
        cardIdsToUpdateStatus.push(newCard._id.toString());
      }

      payload.leftoverStamps = remainingStamps.reduce(
        (acc, cur) => acc + cur.stamps.length,
        0,
      );
    }

    await this.stampService.save(newStampsForInserting);

    const cardWithSlots = await this.cardService.findSlotsByCardId(
      cardIdsToUpdateStatus,
    );

    const completedCards = cardWithSlots
      .filter(
        (filledCard) =>
          filledCard.stamps.length === voucher.policy.stampsRequiredForReward,
      )
      .map((fullcard) => fullcard.id);

    if (completedCards.length) {
      await this.cardService.updateStatus(
        completedCards,
        CardStatuses.Completed,
      );
    }
    const freshedCards = await this.cardService.findSlotsByCardId(
      cardIdsToUpdateStatus,
    );

    payload.cards.push(...freshedCards);

    return payload;
  }
}
