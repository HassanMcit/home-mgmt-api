// ─── شيل معايا — Shared TypeScript Types ─────────────────────────────────────
// Import this file in both the frontend API client and the backend route.
// Keep it as a single source of truth for all split-bill shapes.

// ─── Request Bodies (Frontend → Backend) ─────────────────────────────────────

/** One participant row sent from the BillSplitting component */
export interface SplitParticipantInput {
  /** Display name (free-text — always required) */
  participantName: string;
  /** Optional: cuid of a registered User in the system */
  participantId?: string | null;
  /** Exact share amount in EGP */
  owedAmount: number;
}

/** Full POST body for creating a new split session */
export interface CreateSplitBillInput {
  /** Human-friendly title, e.g. "خروجة القهوة" */
  title: string;
  /** Full bill amount in EGP */
  totalAmount: number;
  /** At least 1 participant required */
  participants: SplitParticipantInput[];
}

// ─── Response Shapes (Backend → Frontend) ────────────────────────────────────

export interface SplitParticipantResponse {
  id: string;
  splitBillId: string;
  participantName: string;
  participantId: string | null;
  owedAmount: number;
  isPaid: boolean;
  paidAt: string | null; // ISO-8601 datetime string
  createdAt: string;
  updatedAt: string;
}

export interface SplitBillResponse {
  id: string;
  paidById: string;
  title: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  participants: SplitParticipantResponse[];
}

// ─── PATCH body for marking a participant as paid ────────────────────────────

export interface MarkParticipantPaidInput {
  isPaid: boolean;
}
