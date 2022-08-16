import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import {Error} from './errors';

export interface AWSEvent extends Omit<APIGatewayProxyWebsocketEventV2, "body"> {
  body: object | null;
}

export type OperationResult<T> = OperationSuccess<T> | OperationError;

export interface OperationSuccess<T> {
  action?: Action;
  result: T;
  success: true;
}

export interface OperationError {
  action?: Action;
  errors: (Error | string)[];
  success: false;
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

export type Handler<T> = (event: AWSEvent) => Promise<T>;

export type Validator<T> = (data: unknown) => data is T;
