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
import * as request from 'supertest';

import { createVoucher } from './stubs/voucher.stubs';

describe('Voucher controller (e2e)', () => {
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
    app.close();
    await connection.close();
  });

  it('Create a new voucher issued automatically.', async () => {
    const createVoucherDto = createVoucher();
    const userIdFromJwtToken = 'Jonh-Wick';

    const response = await request(app.getHttpServer())
      .post('/vouchers')
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(createVoucherDto)
      .expect(201);

    expect(response.body).toEqual({ ok: true });

    const voucher = await voucherModel.findOne().lean();
    const policy = await policyModel.findById(voucher.policyId).lean();
    const reward = await rewardModel.findById(voucher.rewardId).lean();

    expect({
      ...createVoucherDto,
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
});
