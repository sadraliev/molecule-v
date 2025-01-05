import {
  Body,
  Controller,
  Post,
  Headers,
  UnauthorizedException,
  Logger,
  HttpException,
} from '@nestjs/common';

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

      await this.voucherService.create(body, userId);

      return { ok: true };
    } catch (error) {
      this.logger.warn(error);

      throw new HttpException(error.status, error.message);
    }
  }
}
