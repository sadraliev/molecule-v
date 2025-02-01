import { EntityBase } from 'src/lib';

export const IssueModes = {
  Limited: 'limited',
  Unlimited: 'unlimited',
} as const;
export const issueModes = Object.values(IssueModes);
export type IssueMode = (typeof issueModes)[number];
export type Policy = {
  name: string;
  /**s
   * Specifies the reissue policy for the voucher:
   * - `'unlimited'`: Automatic reissue is enabled.
   * - `limited`: Maximum number of reissues allowed for the voucher.
   * This field determines the total number of reissues across all consumers.
   *
   * default: "unlimited"
   */
  issueMode: IssueMode;
  maxReissue?: number;
  stampsRequiredForReward: number;
};

export type PolicyId = string;

export type PolicyEntity = EntityBase<Policy>;
