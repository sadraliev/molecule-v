import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { PhoneNumber } from 'src/lib';

export type CustomerDocument = HydratedDocument<CustomerDefinition>;
export type CustomerModel = Model<CustomerDefinition>;

@Schema({ timestamps: true })
export class CustomerDefinition {
  @Prop({ required: true, unique: true, type: String })
  phone: PhoneNumber;

  @Prop({ type: String })
  name: string;
}

export const CUSTOMER_COLLECTION_NAME = 'customers';
export const InjectCustomer = () => InjectModel(CUSTOMER_COLLECTION_NAME);
export const CustomerSchema = SchemaFactory.createForClass(CustomerDefinition);
CustomerSchema.set('toObject', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;

    return ret;
  },
});
