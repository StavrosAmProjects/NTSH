import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export const reportKinds = ['sidewalk', 'accessible', 'crosswalk', 'cycleLane', 'ramp', 'doublePark', 'busStop'] as const;
export type ReportKind = (typeof reportKinds)[number];

export function isReportKind(value: string | undefined): value is ReportKind {
  return reportKinds.some((kind) => kind === value);
}

export type LocalReceipt = {
  id: string;
  kind: ReportKind;
  hash: string;
  createdAt: string;
};

const ReceiptContext = createContext<{
  receipts: LocalReceipt[];
  addReceipt: (receipt: LocalReceipt) => void;
} | null>(null);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<LocalReceipt[]>([]);
  const value = useMemo(
    () => ({ receipts, addReceipt: (receipt: LocalReceipt) => setReceipts((all) => [receipt, ...all]) }),
    [receipts],
  );

  return <ReceiptContext.Provider value={value}>{children}</ReceiptContext.Provider>;
}

export function useReports() {
  const value = useContext(ReceiptContext);
  if (!value) throw new Error('ReportProvider is missing');
  return value;
}

export const reportLabels: Record<ReportKind, string> = {
  sidewalk: 'Στάθμευση πάνω σε πεζοδρόμιο',
  accessible: 'Στάθμευση σε θέση ΑμεΑ',
  crosswalk: 'Στάθμευση πάνω σε διάβαση πεζών',
  cycleLane: 'Στάθμευση σε ποδηλατόδρομο',
  ramp: 'Μπλοκαρισμένη ράμπα ή όδευση τυφλών',
  doublePark: 'Διπλοστάθμευση που κλείνει λωρίδα',
  busStop: 'Στάθμευση σε στάση λεωφορείου',
};
