
export enum Payer {
  USER = 'USER',
  PARTNER = 'PARTNER'
}

export interface ExpenseItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  payer: Payer;
  items?: ExpenseItem[];
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalSpent: number;
  userSpent: number;
  partnerSpent: number;
  isClosed: boolean;
  expenses: Expense[];
}

export interface Settings {
  userName: string;
  partnerName: string;
}

export interface AppState {
  summaries: MonthlySummary[];
  currentMonth: string; // YYYY-MM
  settings: Settings;
}
