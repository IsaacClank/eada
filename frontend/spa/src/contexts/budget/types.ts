export type BudgetList = {
  id: string;
  name: string;
  normalizedName: string;
  income: number;
}[];

export interface BudgetOverview {
  id: string;
  name: string;
  normalizedName: string;
  income: number;
  totalRemainingInMonth: number;
  totalExpenseInMonth: number;
  categories: BudgetCategoryOverview[];
}

export interface BudgetCategoryOverview {
  id: string;
  name: string;
  normalizedName: string;
  percentageOfIncome: number;
  totalRemainingInMonth: number;
  totalExpenseInMonth: number;
}
