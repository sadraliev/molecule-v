import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from 'src/app.module';
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
import { IssueModes } from 'src/voucher/types/policy.types';
import * as request from 'supertest';

import { createVoucherDto } from './stubs/voucher.stubs';

describe('Voucher', () => {
  let app: INestApplication;
  let voucherModel: VoucherModel;
  let policyModel: PolicyModel;
  let rewardModel: RewardModel;

  let connection: Connection;

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

    connection = voucherModel.db;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await app.close();
    await connection.close();
  });

  it('As a Owner, I want to issue a new voucher with auto mode', async () => {
    const withUnlimitedMode = createVoucherDto((voucher) => ({
      ...voucher,
      policy: {
        ...voucher.policy,
        issue_mode: IssueModes.Unlimited,
      },
    }));
    const userIdFromJwtToken = 'Jonh-Wick';

    const response = await request(app.getHttpServer())
      .post('/vouchers')
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(withUnlimitedMode)
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
      ...withUnlimitedMode,
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
  });

  it('As a Owner, I want to issue a new voucher with fixed mode', async () => {
    const withLimitedMode = createVoucherDto((voucher) => ({
      ...voucher,
      policy: {
        ...voucher.policy,
        issue_mode: IssueModes.Limited,
        max_reissue: 10,
      },
    }));
    const userIdFromJwtToken = 'Jonh-Wick';

    const response = await request(app.getHttpServer())
      .post('/vouchers')
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(withLimitedMode)
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
      ...withLimitedMode,
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
});
