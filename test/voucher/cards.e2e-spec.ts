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

  it('As a customer, I want to receive a stamps on my loyalty card after purchasing an item [unlimited mode]', async () => {
    const withUnlimitedMode = createVoucherDto((voucher) => ({
      ...voucher,
      policy: {
        ...voucher.policy,
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

    const card = await new cardModel({
      customerId: customer.id,
      voucherId: id,
    }).save();

    await new stampModel({
      posId: pos.id,
      cardId: card.id,
    }).save();

    const voucher = await voucherModel.findById(id).lean();

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
