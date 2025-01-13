import { Injectable, Logger } from '@nestjs/common';
import { UserId } from 'src/lib';
import { CustomerService } from 'src/organization/customer/customer.service';

import { createStampsDto } from './dtos/create-stamp.dto';
import { CreateVoucherDto } from './dtos/create-voucher.dto';
import {
  createArrayWithValue,
  fillPartsWithValue,
  getPolicy,
  getReward,
  getVoucher,
  hasEnoughSlotsForStamps,
  makeVoucher,
  splitToParts,
} from './helpers/voucher.calculations';
import { CardService } from './modules/card/card.service';
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
    const voucher = await this.voucherModel
      .findById(voucherId)
      .populate<{ policy: PolicyDocument }>('policyId')
      .populate<{ reward: RewardDocument }>('rewardId');

    const customer = await this.customerService.findOrCreate(forCustomer);
    const card = await this.cardService.findActive(voucher.id, customer.id);

    if (card) {
      const existingSlots = await this.stampService.getStampsByCardId(
        card._id.toString(),
      );

      if (
        hasEnoughSlotsForStamps(
          stampsToAdd,
          voucher.policy.stampsRequiredForReward,
          existingSlots.length,
        )
      ) {
        // * add stamps
        await this.stampService.save(
          createArrayWithValue(
            { cardId: card._id.toString(), posId },
            stampsToAdd,
          ),
        );

        //* updating status
        const cardWithSlots = await this.cardService.findSlotsByCardId([
          card._id.toString(),
        ]);

        const cardIds = cardWithSlots
          .filter(
            (filledCard) =>
              filledCard.stamps.length ===
              voucher.policy.stampsRequiredForReward,
          )
          .map((fullcard) => fullcard.id.toString());

        if (cardIds.length) {
          await this.cardService.updateStatus(cardIds, 'completed');
        }

        return await this.cardService.findSlotsByCardId([card._id.toString()]);
      }

      //* add stamps into multiply cards
      const availableSlotsForStamps =
        voucher.policy.stampsRequiredForReward - existingSlots.length;

      await this.stampService.save(
        createArrayWithValue(
          { cardId: card._id.toString(), posId },
          availableSlotsForStamps,
        ),
      );

      this.cardService.updateStatus([card._id.toString()], 'completed');

      stampsToAdd = stampsToAdd - availableSlotsForStamps;

      const parts = fillPartsWithValue(
        splitToParts(voucher.policy.stampsRequiredForReward, stampsToAdd),
        (count) => createArrayWithValue({ posId }, count),
      );

      const cards = await Promise.all(
        parts.map(async (partialStamps) => {
          const card = await this.cardService.save(voucher.id, customer.id);

          await this.stampService.save(
            partialStamps.map((partial) => ({
              ...partial,
              cardId: card._id.toString(),
            })),
          );

          return card;
        }),
      );

      //* update status
      const cardIds = [...cards, card].map((card) => card._id.toString());

      const cardWithSlots = await this.cardService.findSlotsByCardId(cardIds);

      const completedCards = cardWithSlots
        .filter(
          (filledCard) =>
            filledCard.stamps.length === voucher.policy.stampsRequiredForReward,
        )
        .map((fullcard) => fullcard.id);

      if (completedCards.length) {
        await this.cardService.updateStatus(completedCards, 'completed');
      }

      return await this.cardService.findSlotsByCardId(cardIds);
    }

    /**
     * TODO: Add new stamps
     * * Does the customer already have a stamp card?
     * *  If yes, check if there are available slots for new stamps.
     * *    If yes, add the new stamps.
     * *    If no, check if it is possible to issue new cards -
     * *      the check is performed with the following logic: if policy.issueMode === 'auto', return true;
     * *      if policy.issueMode === 'fixed', check if there are free cards for stamps; if yes, return true, otherwise return false.
     * *  If no, check if it is possible to issue new cards -
     * *      the check is performed with the following logic: if policy.issueMode === 'auto', return true;
     * *      if policy.issueMode === 'fixed', check if there are free cards for stamps; if yes, return true, otherwise return false.
     *
     */

    return false;
  }
}
