import { Body, Controller, Post } from '@nestjs/common';

import { CreateVoucherDto } from './dtos/create-voucher.dto';
import { VoucherService } from './voucher.service';

@Controller('vouchers')
export class VoucherController {
  constructor(readonly voucherService: VoucherService) {}

  @Post()
  async create(@Body() body: CreateVoucherDto) {
    return this.voucherService.create(body);
  }
}
