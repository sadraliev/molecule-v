import { Injectable, Logger } from '@nestjs/common';
import { UserId } from 'src/lib';
import { IssueModes } from 'src/voucher/types/policy.types';
import { VoucherService } from 'src/voucher/voucher.service';
import { createVoucherDto } from 'test/voucher/stubs/voucher.stubs';

@Injectable()
export class SeederService {
  readonly logger = new Logger('Seeder service');
  constructor(private readonly voucherService: VoucherService) {}
  async run() {
    this.logger.log('--- Starting database seeding ---');

    try {
      this.logger.log('Step 1: Populating users...');
      const userId = 'Gugglish';

      this.logger.log('Step 2: Populating vouchers...');
      await this.seedVouchers(userId);

      this.logger.log('--- Database seeding completed successfully ---');
    } catch (error) {
      this.logger.error(
        'Error during seeding process:',
        error.message,
        error.stack,
      );
    }
  }

  async seedVouchers(userId: UserId | UserId[]) {
    const withUnlimitedMode = createVoucherDto((voucher) => ({
      ...voucher,
      policy: {
        ...voucher.policy,
        issue_mode: IssueModes.Unlimited,
      },
    }));

    if (Array.isArray(userId)) {
      this.logger.debug('Batch voucher creation not yet implemented.');

      // TODO: Implement batch voucher creation for multiple users
      return;
    }

    await this.voucherService.create(withUnlimitedMode, userId);
  }
}
