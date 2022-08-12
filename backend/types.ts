export interface OperationResult<T> {
  action?: OperationAction;
  success: boolean;
  result?: T;
  error?: string;
}

export enum OperationAction {
  CREATE_ROOM = 'CREATE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  ROLL = 'ROLL',
  LEAVE_ROOM = 'LEAVE_ROOM'
}

export interface User {
  nickName: string;
}

export interface RoomRaw {
  id: string;
}

export interface Room extends RoomRaw {
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
