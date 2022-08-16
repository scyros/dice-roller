import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";

export interface AWSEvent extends Omit<APIGatewayProxyWebsocketEventV2, "body"> {
  body: unknown;
}

export interface OperationResult<T> {
  action?: Action;
  errors?: string[];
  result?: T;
  success: boolean;
}

export interface OperationSuccess<T> extends Omit<OperationResult<T>, "errors | result | success"> {
  result: T;
  siccess: true;
}

export interface UnreachableUsers {
  event: AWSEvent;
  roomId: string;
  connectionIds: string[];
}

export enum Action {
  CreateRoom = "CREATE_ROOM",
  JoinRoom = "JOIN_ROOM",
  Roll = "ROLL",
  LeaveRoom = "LEAVE_ROOM",
}

export interface User {
  nickName: string;
}

export interface Room {
  id: string;
  users?: (User & { connectionId: string })[];
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
