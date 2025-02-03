import { EntityBase } from 'src/lib';

export const StampActions = {
  AddStamp: 'add a stamp',
  RemoveStamp: 'remove a stamp',
} as const;

export const stampActions = Object.values(StampActions);
export type StampAction = (typeof stampActions)[number];

export type Stamp = {
  cardId: string;
  posId: string;
  action: StampAction;
};
export type StampId = string;

export type CreateStamp = Omit<Stamp, 'action'>;

export type StampEntity = EntityBase<Stamp>;
