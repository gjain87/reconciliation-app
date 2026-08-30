export interface User {
    id: string;
    email: string;
    name?: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  
  export type DiscrepancyType =
    | 'MISSING_PAYMENT'
    | 'ORPHAN_PAYMENT'
    | 'AMOUNT_MISMATCH'
    | 'DUPLICATE_PAYMENT'
    | 'STATUS_MISMATCH';
  
  export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';
  
  export interface Discrepancy {
    id: string;
    orderId?: string;
    transactionRef?: string;
    customerEmail?: string;
    discrepancyType: DiscrepancyType;
    severity: Severity;
    orderAmount?: number;
    paymentAmount?: number;
    difference: number;
    explanation?: string;
    recommendedAction?: string;
    createdAt?: string;
  }
  
  export interface ReconciliationSummary {
    totalOrders: number;
    totalPayments: number;
    reconciledCount: number;
    discrepancyCount: number;
    totalReconciledAmount: number;
    totalDisputeAmount: number;
    totalAmountAtRisk: number;
    typeBreakdown: {
      type: string;
      count: number;
      amountAtRisk: number;
    }[];
  }
  
  export interface ExplainResponse {
    explanation: string;
    recommendedAction: string;
    rootCauseCategory: string;
  }