import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from 'src/app.module';
import {
  CUSTOMER_COLLECTION_NAME,
  CustomerModel,
} from 'src/organization/customer/schemas/customer.schema';
import {
  POS_COLLECTION_NAME,
  PoSModel,
} from 'src/organization/pos/schemas/pos.schema';
import {
  CARD_COLLECTION_NAME,
  CardModel,
} from 'src/voucher/modules/card/card.schema';
import {
  STAMP_COLLECTION_NAME,
  StampModel,
} from 'src/voucher/modules/stamp/stamp.schema';
import {
  POLICY_COLLECTION_NAME,
  PolicyModel,
} from 'src/voucher/schemas/policy.schema';
import {
  REWARD_COLLECTION_NAME,
  RewardModel,
} from 'src/voucher/schemas/reward.schema';
import {
  VoucherModel,
  VOUCHER_COLLECTION_NAME,
} from 'src/voucher/schemas/voucher.schema';
import * as request from 'supertest';

import {
  addVoucherV1,
  createStampsDto,
  createVoucherDto,
  makeMockPhone,
  makeMockPoS,
} from './stubs/voucher.stubs';

describe('Voucher controller (e2e)', () => {
  let app: INestApplication;
  let voucherModel: VoucherModel;
  let policyModel: PolicyModel;
  let rewardModel: RewardModel;
  let posModel: PoSModel;
  let customerModel: CustomerModel;
  let cardModel: CardModel;
  let stampModel: StampModel;

  let connection: Connection;

  let autoVoucherResponse: { ok: true; payload: { id: string } };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    voucherModel = moduleFixture.get<VoucherModel>(
      getModelToken(VOUCHER_COLLECTION_NAME),
    );

    policyModel = moduleFixture.get<PolicyModel>(
      getModelToken(POLICY_COLLECTION_NAME),
    );

    rewardModel = moduleFixture.get(getModelToken(REWARD_COLLECTION_NAME));

    posModel = moduleFixture.get(getModelToken(POS_COLLECTION_NAME));

    customerModel = moduleFixture.get(getModelToken(CUSTOMER_COLLECTION_NAME));

    cardModel = moduleFixture.get(getModelToken(CARD_COLLECTION_NAME));

    stampModel = moduleFixture.get(getModelToken(STAMP_COLLECTION_NAME));

    connection = voucherModel.db;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await app.close();
    await connection.close();
  });

  it('As a Owner, I want to issue a new voucher with auto mode', async () => {
    const withAuthMode = createVoucherDto((voucher) => ({
      ...voucher,
      policy: {
        ...voucher.policy,
        issue_mode: 'auto',
      },
    }));
    const userIdFromJwtToken = 'Jonh-Wick';

    const response = await request(app.getHttpServer())
      .post('/vouchers')
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(withAuthMode)
      .expect(201);

    expect(response.body).toEqual({
      ok: true,
      payload: {
        id: expect.any(String),
      },
    });

    const voucher = await voucherModel
      .findById(response.body.payload.id)
      .lean();
    const policy = await policyModel.findById(voucher.policyId).lean();
    const reward = await rewardModel.findById(voucher.rewardId).lean();

    expect({
      ...withAuthMode,
      issued_by: userIdFromJwtToken,
    }).toEqual(
      expect.objectContaining({
        name: voucher.name,
        promotion_name: voucher.promotionName,
        issued_by: voucher.issuedBy,
        issue_at: new Date(voucher.issueAt).toISOString(),
        expiration_at: new Date(voucher.expirationAt).toISOString(),
        reward: expect.objectContaining({
          name: reward.name,
          description: reward.description,
          terms_url: reward.termsUrl,
        }),
        policy: expect.objectContaining({
          name: policy.name,
          issue_mode: policy.issueMode,
          stamps_required_for_reward: policy.stampsRequiredForReward,
        }),
      }),
    );

    autoVoucherResponse = response.body;
  });

  it('As a Owner, I want to issue a new voucher with fixed mode', async () => {
    const withFixedMode = createVoucherDto((voucher) => ({
      ...voucher,
      policy: {
        ...voucher.policy,
        issue_mode: 'fixed',
        max_reissue: 10,
      },
    }));
    const userIdFromJwtToken = 'Jonh-Wick';

    const response = await request(app.getHttpServer())
      .post('/vouchers')
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(withFixedMode)
      .expect(201);

    expect(response.body).toEqual({
      ok: true,
      payload: {
        id: expect.any(String),
      },
    });

    const voucher = await voucherModel
      .findById(response.body.payload.id)
      .lean();
    const policy = await policyModel.findById(voucher.policyId).lean();
    const reward = await rewardModel.findById(voucher.rewardId).lean();

    expect({
      ...withFixedMode,
      issued_by: userIdFromJwtToken,
    }).toEqual(
      expect.objectContaining({
        name: voucher.name,
        promotion_name: voucher.promotionName,
        issued_by: voucher.issuedBy,
        issue_at: new Date(voucher.issueAt).toISOString(),
        expiration_at: new Date(voucher.expirationAt).toISOString(),
        reward: expect.objectContaining({
          name: reward.name,
          description: reward.description,
          terms_url: reward.termsUrl,
        }),
        policy: expect.objectContaining({
          name: policy.name,
          issue_mode: policy.issueMode,
          max_reissue: policy.maxReissue,
          stamps_required_for_reward: policy.stampsRequiredForReward,
        }),
      }),
    );
  });

  it('As a customer, I want to receive a stamps on my loyalty card after purchasing an item', async () => {
    const userIdFromJwtToken = 'Jonh-Wick';
    const pos = await new posModel(makeMockPoS((pos) => pos)).save();

    const customerPhone = makeMockPhone((phone) => phone);
    const customer = await new customerModel({
      name: 'Jonh Wick',
      phone: customerPhone,
    }).save();

    const card = await new cardModel({
      customerId: customer.id,
      voucherId: autoVoucherResponse.payload.id,
    }).save();

    await new stampModel({
      posId: pos.id,
      cardId: card.id,
    }).save();

    const voucher = await voucherModel
      .findById(autoVoucherResponse.payload.id)
      .lean();

    const addOneStamp = createStampsDto((mockDto) => ({
      ...mockDto,
      forCustomer: customerPhone,
      stampsToAdd: 1,
      posId: pos.id,
    }));

    const PATH_TO_ADD_STAMPS = '/vouchers/' + voucher._id + '/cards/stamps';

    const response = await request(app.getHttpServer())
      .post(PATH_TO_ADD_STAMPS)
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(addVoucherV1(addOneStamp));

    expect(response.body).toEqual({
      resource: 'Voucher',
      apiVersion: 'v1',
      payload: {
        cards: [],
      },
    });
  });
});
