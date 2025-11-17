// This file defines the "shape" of our data.

export interface Person {
  name: string;
}

export interface Consumption {
  id: number;
  person_name: string;
  type: string;
  eaten_at: string;
}

export interface Streak {
  streak_id: number;
  streak_length: number;
  streak_start: string;
  streak_end: string;
  streak_counts: string;
}

export interface MonthlyMost {
  consumption_month: string;
  day_of_month: string;
  daily_count: number;
}

export interface RawCsvRow {
  person: string;
  'meat-bar-type': string;
  date: string;
}
