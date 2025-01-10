import { PhoneNumber } from 'src/lib';
import { PoSId } from 'src/organization/pos/types/pos.types';

export class createStampsDto {
  resource: 'Voucher';
  apiVersion: 'v1';
  forCustomer: PhoneNumber;
  stampsToAdd: number;
  posId: PoSId;
}
