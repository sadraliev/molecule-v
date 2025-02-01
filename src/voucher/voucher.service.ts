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
import { PolicyRepository } from './policy.repository';
import { RewardRepository } from './reward.repository';
import { VoucherDocument } from './schemas/voucher.schema';
import { Policy } from './types/policy.types';
import { Reward } from './types/reward.types';
import { VoucherId } from './types/voucher.types';
import { VoucherRepository } from './voucher.repository';

@Injectable()
export class VoucherService {
  readonly logger = new Logger('Voucher service');
  constructor(
    private readonly rewardRepository: RewardRepository,
    private readonly policyRepository: PolicyRepository,
    private readonly voucherRepository: VoucherRepository,
    private readonly customerService: CustomerService,

    private readonly cardService: CardService,

    private readonly stampService: StampService,
  ) {}

  async create(
    createVoucher: CreateVoucherDto,
    userId: UserId,
  ): Promise<VoucherDocument> {
    const withUser = makeVoucher(userId, getVoucher(createVoucher));

    const policyDto = getPolicy(createVoucher) as Policy;
    const policy = await this.policyRepository.save(policyDto);

    const withPolicy = withUser(policy.id);

    const rewardDto = getReward(createVoucher) as Reward;
    const reward = await this.rewardRepository.save(rewardDto);

    const fullVoucher = withPolicy(reward.id) as any;
    const voucher = await this.voucherRepository.save(fullVoucher);

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

    const voucher = await this.voucherRepository.findById(voucherId);

    const customer = await this.customerService.findOrCreate(forCustomer);

    const card = await this.cardService.findActive(voucher.id, customer.id);

    const cardIdsToUpdateStatus = [];
    const newStampsForInserting = [];
    const isLimitedMode = () => voucher.policy.issueMode === 'limited';
    const isUnliminedMode = () => voucher.policy.issueMode === 'unlimited';

    if (!card) {
      const card = await this.cardService.save(voucher.id, customer.id);

      cardIdsToUpdateStatus.push(card.id);
      const existingSlots = await this.stampService.getStampsByCardId(card.id);

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
            newStampsForInserting.push({ cardId: card.id, posId }),
          ),
        );
      }

      if (isUnliminedMode()) {
        for (const card of stampsForNewCards) {
          const newCard = await this.cardService.save(voucher.id, customer.id);

          card.stamps.forEach(() =>
            newStampsForInserting.push({ cardId: newCard.id, posId }),
          );
          cardIdsToUpdateStatus.push(newCard.id);
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
            cardIdsToUpdateStatus.push(newCard.id);
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
          cardIdsToUpdateStatus.push(newCard.id);
        }

        payload.leftoverStamps = remainingStamps.reduce(
          (acc, cur) => acc + cur.stamps.length,
          0,
        );
      }

      await this.stampService.save(newStampsForInserting);

      const cardWithSlots = await this.cardService.getCirculatingCards(
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
      const freshedCards = await this.cardService.getCirculatingCards(
        cardIdsToUpdateStatus,
      );

      payload.cards.push(...freshedCards);

      return payload;
    }

    cardIdsToUpdateStatus.push(card.id);
    const existingSlots = await this.stampService.getStampsByCardId(card.id);

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
          newStampsForInserting.push({ cardId: card.id, posId }),
        ),
      );
    }

    if (isUnliminedMode()) {
      for (const card of stampsForNewCards) {
        const newCard = await this.cardService.save(voucher.id, customer.id);

        card.stamps.forEach(() =>
          newStampsForInserting.push({ cardId: newCard.id, posId }),
        );
        cardIdsToUpdateStatus.push(newCard.id);
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
          cardIdsToUpdateStatus.push(newCard.id);
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
        cardIdsToUpdateStatus.push(newCard.id);
      }

      payload.leftoverStamps = remainingStamps.reduce(
        (acc, cur) => acc + cur.stamps.length,
        0,
      );
    }

    await this.stampService.save(newStampsForInserting);

    const cardWithSlots = await this.cardService.getCirculatingCards(
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
    const freshedCards = await this.cardService.getCirculatingCards(
      cardIdsToUpdateStatus,
    );

    payload.cards.push(...freshedCards);

    return payload;
  }
}
