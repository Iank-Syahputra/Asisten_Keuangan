export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
  created_at: string;
}

export interface Savings {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  incomeExpenseTrend: {
    month: string;
    income: number;
    expense: number;
  }[];
  categoryBreakdown: {
    name: string;
    value: number;
    color: string;
  }[];
  savingsTrend: {
    month: string;
    savings: number;
  }[];
  recentTransactions: Transaction[];
}
