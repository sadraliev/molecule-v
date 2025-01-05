export const issueModes = ['auto', 'fixed'] as const;
export type IssueMode = (typeof issueModes)[number];
export type Policy = {
  name: string;
  /**s
   * Specifies the reissue policy for the voucher:
   * - `'auto'`: Automatic reissue is enabled.
   * - `custom`: Maximum number of reissues allowed for the voucher.
   * This field determines the total number of reissues across all consumers.
   *
   * default: "auto"
   */
  issueMode: IssueMode;
  maxReissue?: number;
  stampsRequiredForReward: number;
};

export type PolicyId = string;

export type PolicyWithAuto = Omit<Policy, 'maxReissue'> & {
  issueMode: 'auto';
};

export type PolicyWithCustomAndMaxReissue = Policy & {
  issueMode: 'custom';
  maxReissue: number;
};
