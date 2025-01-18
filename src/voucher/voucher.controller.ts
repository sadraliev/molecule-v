import {
  Body,
  Controller,
  Post,
  Headers,
  UnauthorizedException,
  Logger,
  HttpException,
  Param,
} from '@nestjs/common';

import { createStampsDto } from './dtos/create-stamp.dto';
import {
  CreateVoucherDto,
  CreateVoucherResponseDto,
} from './dtos/create-voucher.dto';
import { VoucherService } from './voucher.service';

@Controller('vouchers')
export class VoucherController {
  readonly logger = new Logger('Voucher controller');

  constructor(readonly voucherService: VoucherService) {}

  @Post()
  async create(
    @Body() body: CreateVoucherDto,
    @Headers('authorization') authorization: string,
  ): Promise<CreateVoucherResponseDto> {
    try {
      if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new UnauthorizedException('Invalid or missing token');
      }

      const userId = authorization.split(' ')[1];

      const { id } = await this.voucherService.create(body, userId);

      return {
        ok: true,
        payload: {
          id,
        },
      };
    } catch (error) {
      this.logger.warn(error);

      throw new HttpException(error.status, error.message);
    }
  }

  @Post('/:voucherId/cards/stamps')
  async createStampsToCard(
    @Body() body: createStampsDto,
    @Param('voucherId') voucherId: string,
  ) {
    try {
      const payload = await this.voucherService.addStampsToCard({
        ...body,
        voucherId,
      });

      return {
        resource: 'Card',
        apiVersion: 'v1',
        ok: true,
        payload,
      };
    } catch (error) {
      this.logger.warn(
        `An error occured during add stamps`,
        error,
        error.stack,
      );

      throw new HttpException(error.status, error.message);
    }
  }
}
