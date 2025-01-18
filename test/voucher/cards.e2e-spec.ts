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
import { CardStatuses } from 'src/voucher/modules/card/card.types';
import {
  STAMP_COLLECTION_NAME,
  StampModel,
} from 'src/voucher/modules/stamp/stamp.schema';
import { StampActions } from 'src/voucher/modules/stamp/stamp.types';
import {
  VoucherModel,
  VOUCHER_COLLECTION_NAME,
} from 'src/voucher/schemas/voucher.schema';
import { IssueModes } from 'src/voucher/types/policy.types';
import * as request from 'supertest';

import {
  addVoucherV1,
  createStampsDto,
  createVoucherDto,
  makeMockPhone,
  makeMockPoS,
} from './stubs/voucher.stubs';

describe('Card tests', () => {
  let app: INestApplication;
  let voucherModel: VoucherModel;
  let posModel: PoSModel;
  let customerModel: CustomerModel;
  let cardModel: CardModel;
  let stampModel: StampModel;

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

  it('Verify single stamp addition updates a single card correctly in unlimited mode', async () => {
    const withUnlimitedMode = createVoucherDto((voucher) => ({
      ...voucher,
      policy: {
        ...voucher.policy,
        stamps_required_for_reward: 6,
        issue_mode: IssueModes.Unlimited,
      },
    }));
    const userIdFromJwtToken = 'Jonh-Wick';

    const {
      body: {
        payload: { id },
      },
    } = await request(app.getHttpServer())
      .post('/vouchers')
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(withUnlimitedMode)
      .expect(201);

    const pos = await new posModel(makeMockPoS((pos) => pos)).save();

    const customerPhone = makeMockPhone((phone) => phone);
    const customer = await new customerModel({
      name: 'Jonh Wick',
      phone: customerPhone,
    }).save();

    const voucher = await voucherModel.findById(id).lean();

    const addOneStamp = createStampsDto((mockDto) => ({
      ...mockDto,
      forCustomer: customerPhone,
      stampsToAdd: 1,
      posId: pos.id,
    }));

    await new cardModel({
      customerId: customer.id,
      voucherId: id,
    }).save();

    const PATH_TO_ADD_STAMPS = '/vouchers/' + voucher._id + '/cards/stamps';

    const response = await request(app.getHttpServer())
      .post(PATH_TO_ADD_STAMPS)
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(addVoucherV1(addOneStamp));

    expect(response.body).toEqual({
      ok: true,
      resource: 'Card',
      apiVersion: 'v1',
      payload: {
        cards: [
          {
            id: expect.any(String),
            status: CardStatuses.Activated,
            customer: {
              name: customer.name,
              phone: customer.phone,
            },
            stamps: [
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
            ],
          },
        ],
      },
    });
  });

  it('Verify single stamp addition updates a single card correctly in unlimited mode (with pre-existing stamps)', async () => {
    const withUnlimitedMode = createVoucherDto((voucher) => ({
      ...voucher,
      policy: {
        ...voucher.policy,
        stamps_required_for_reward: 6,
        issue_mode: IssueModes.Unlimited,
      },
    }));
    const userIdFromJwtToken = 'Jonh-Wick';

    const {
      body: {
        payload: { id },
      },
    } = await request(app.getHttpServer())
      .post('/vouchers')
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(withUnlimitedMode)
      .expect(201);

    const pos = await new posModel(makeMockPoS((pos) => pos)).save();

    const customerPhone = makeMockPhone((phone) => phone);
    const customer = await new customerModel({
      name: 'Jonh Wick',
      phone: customerPhone,
    }).save();

    const voucher = await voucherModel.findById(id).lean();

    const addOneStamp = createStampsDto((mockDto) => ({
      ...mockDto,
      forCustomer: customerPhone,
      stampsToAdd: 1,
      posId: pos.id,
    }));

    const card = await new cardModel({
      customerId: customer.id,
      voucherId: id,
    }).save();

    await new stampModel({ cardId: card.id, posId: pos.id }).save();

    const PATH_TO_ADD_STAMPS = '/vouchers/' + voucher._id + '/cards/stamps';

    const response = await request(app.getHttpServer())
      .post(PATH_TO_ADD_STAMPS)
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(addVoucherV1(addOneStamp));

    expect(response.body).toEqual({
      ok: true,
      resource: 'Card',
      apiVersion: 'v1',
      payload: {
        cards: [
          {
            id: expect.any(String),
            status: CardStatuses.Activated,
            customer: {
              name: customer.name,
              phone: customer.phone,
            },
            stamps: [
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
            ],
          },
        ],
      },
    });
  });

  it('Ensure a customer can add stamps to an existing card in unlimited mode, completing the reward threshold', async () => {
    const STAMPS_REQUIRED_FOR_REWARD = 6;
    const STAMPS_TO_ADD = 6;
    const USER_ID = 'John-Wick';

    const withUnlimitedMode = createVoucherDto((voucher) => ({
      ...voucher,
      policy: {
        ...voucher.policy,
        stamps_required_for_reward: STAMPS_REQUIRED_FOR_REWARD,
        issue_mode: IssueModes.Unlimited,
      },
    }));

    const {
      body: {
        payload: { id },
      },
    } = await request(app.getHttpServer())
      .post('/vouchers')
      .set('Authorization', `Bearer ${USER_ID}`)
      .send(withUnlimitedMode)
      .expect(201);

    const pos = await new posModel(makeMockPoS((pos) => pos)).save();

    const customerPhone = makeMockPhone((phone) => phone);
    const customer = await new customerModel({
      name: 'Jonh Wick',
      phone: customerPhone,
    }).save();

    const voucher = await voucherModel.findById(id).lean();

    const addOneStamp = createStampsDto((mockDto) => ({
      ...mockDto,
      forCustomer: customerPhone,
      stampsToAdd: STAMPS_TO_ADD,
      posId: pos.id,
    }));

    await new cardModel({
      customerId: customer.id,
      voucherId: id,
    }).save();

    const PATH_TO_ADD_STAMPS = '/vouchers/' + voucher._id + '/cards/stamps';

    const response = await request(app.getHttpServer())
      .post(PATH_TO_ADD_STAMPS)
      .set('Authorization', `Bearer ${USER_ID}`)
      .send(addVoucherV1(addOneStamp));

    expect(response.body).toEqual({
      ok: true,
      resource: 'Card',
      apiVersion: 'v1',
      payload: {
        cards: [
          {
            id: expect.any(String),
            status: CardStatuses.Completed,
            customer: {
              name: customer.name,
              phone: customer.phone,
            },
            stamps: [
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
            ],
          },
        ],
      },
    });
  });

  it('Ensure stamps are correctly distributed across cards in unlimited mode when adding more stamps than available slots', async () => {
    const stamps_required_for_reward = 6;
    const stampsToAdd = 14;

    const withUnlimitedMode = createVoucherDto((voucher) => ({
      ...voucher,
      policy: {
        ...voucher.policy,
        stamps_required_for_reward,
        issue_mode: IssueModes.Unlimited,
      },
    }));
    const userIdFromJwtToken = 'Jonh-Wick';

    const {
      body: {
        payload: { id },
      },
    } = await request(app.getHttpServer())
      .post('/vouchers')
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(withUnlimitedMode)
      .expect(201);

    const pos = await new posModel(makeMockPoS((pos) => pos)).save();

    const customerPhone = makeMockPhone((phone) => phone);
    const customer = await new customerModel({
      name: 'Jonh Wick',
      phone: customerPhone,
    }).save();

    const voucher = await voucherModel.findById(id).lean();

    const addOneStamp = createStampsDto((mockDto) => ({
      ...mockDto,
      forCustomer: customerPhone,
      stampsToAdd,
      posId: pos.id,
    }));

    await new cardModel({
      customerId: customer.id,
      voucherId: id,
    }).save();

    const PATH_TO_ADD_STAMPS = '/vouchers/' + voucher._id + '/cards/stamps';

    const response = await request(app.getHttpServer())
      .post(PATH_TO_ADD_STAMPS)
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(addVoucherV1(addOneStamp));

    expect(response.body).toEqual({
      ok: true,
      resource: 'Card',
      apiVersion: 'v1',
      payload: {
        cards: [
          {
            id: expect.any(String),
            status: CardStatuses.Completed,
            customer: {
              name: customer.name,
              phone: customer.phone,
            },
            stamps: [
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
            ],
          },
          {
            id: expect.any(String),
            status: CardStatuses.Completed,
            customer: {
              name: customer.name,
              phone: customer.phone,
            },
            stamps: [
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
            ],
          },
          {
            id: expect.any(String),
            status: CardStatuses.Activated,
            customer: {
              name: customer.name,
              phone: customer.phone,
            },
            stamps: [
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
            ],
          },
        ],
      },
    });
  });
  it('Ensure stamps are correctly distributed across cards in unlimited mode when adding more stamps than available slots (with pre-existing stamps)', async () => {
    const stamps_required_for_reward = 6;
    const stampsToAdd = 14;

    const withUnlimitedMode = createVoucherDto((voucher) => ({
      ...voucher,
      policy: {
        ...voucher.policy,
        stamps_required_for_reward,
        issue_mode: IssueModes.Unlimited,
      },
    }));
    const userIdFromJwtToken = 'Jonh-Wick';

    const {
      body: {
        payload: { id },
      },
    } = await request(app.getHttpServer())
      .post('/vouchers')
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(withUnlimitedMode)
      .expect(201);

    const pos = await new posModel(makeMockPoS((pos) => pos)).save();

    const customerPhone = makeMockPhone((phone) => phone);
    const customer = await new customerModel({
      name: 'Jonh Wick',
      phone: customerPhone,
    }).save();

    const voucher = await voucherModel.findById(id).lean();

    const addOneStamp = createStampsDto((mockDto) => ({
      ...mockDto,
      forCustomer: customerPhone,
      stampsToAdd,
      posId: pos.id,
    }));

    const card = await new cardModel({
      customerId: customer.id,
      voucherId: id,
    }).save();

    await new stampModel({ cardId: card.id, posId: pos.id }).save();

    const PATH_TO_ADD_STAMPS = '/vouchers/' + voucher._id + '/cards/stamps';

    const response = await request(app.getHttpServer())
      .post(PATH_TO_ADD_STAMPS)
      .set('Authorization', `Bearer ${userIdFromJwtToken}`)
      .send(addVoucherV1(addOneStamp));

    expect(response.body).toEqual({
      ok: true,
      resource: 'Card',
      apiVersion: 'v1',
      payload: {
        cards: [
          {
            id: expect.any(String),
            status: CardStatuses.Completed,
            customer: {
              name: customer.name,
              phone: customer.phone,
            },
            stamps: [
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
            ],
          },
          {
            id: expect.any(String),
            status: CardStatuses.Completed,
            customer: {
              name: customer.name,
              phone: customer.phone,
            },
            stamps: [
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
            ],
          },
          {
            id: expect.any(String),
            status: CardStatuses.Activated,
            customer: {
              name: customer.name,
              phone: customer.phone,
            },
            stamps: [
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
              {
                id: expect.any(String),
                posId: pos.id,
                action: StampActions.AddStamp,
              },
            ],
          },
        ],
      },
    });
  });
});
