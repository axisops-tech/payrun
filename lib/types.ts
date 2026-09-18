export type RosterPerson = {
  id: string;
  handle: string;
  displayHandle: string;
  amountLuna: number;
  cadence: string;
  nimiqAddress: string | null;
  claimed: boolean;
};

export type PayItemView = {
  id: string;
  handle: string;
  displayHandle: string;
  amountLuna: number;
  previousAmountLuna: number | null;
  flags: string[];
  memo: string;
  txHash: string | null;
  status: string;
  nimiqAddress: string | null;
};

export type PayCycleView = {
  id: string;
  periodKey: string;
  status: string;
  preparedAt: string;
  completedAt: string | null;
  items: PayItemView[];
};
