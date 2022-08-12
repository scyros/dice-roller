export interface OperationResult<T> {
  action?: string;
  success: boolean;
  result?: T;
  error?: string;
  errors?: string[];
}

export interface User {
  nickName: string;
}

export interface Room {
  id: string;
  users: (User & { connectionId: string })[];
}

export interface Roll {
  count: number;
  faces: number;
  operation?: "+" | "-";
  modifier?: number;
}

export interface RollResult {
  diceResults: number[];
  modifier: number;
  total: number;
}
