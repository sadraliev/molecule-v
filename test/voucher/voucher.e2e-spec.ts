import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from 'src/app.module';
import {
  VoucherModel,
  VOUCHER_COLLECTION_NAME,
} from 'src/voucher/schemas/voucher.schema';
import * as request from 'supertest';

import { createVoucher } from './stubs/voucher.stubs';

describe('Voucher controller (e2e)', () => {
  let app: INestApplication;
  let voucherModel: VoucherModel;
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

    connection = voucherModel.db;
  });

  afterAll(async () => {
    app.close();
    await connection.close();
  });

  it('Create a new voucher with default setting', () => {
    const voucherWithAutoIssue = createVoucher();

    return request(app.getHttpServer())
      .post('/vouchers')
      .send(voucherWithAutoIssue)
      .expect(201);
  });
});
