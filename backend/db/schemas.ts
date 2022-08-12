import Ajv from "ajv";
import {RoomRaw, User} from '../types';

const ajv = new Ajv();

const userSchema = {
  type: "object",
  properties: {
    nickName: { type: "string" },
  },
  required: ["nickName"],
  additionalProperties: false,
};
export const isValidUser: (data: unknown) => data is User = ajv.compile(userSchema);

const roomSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};
export const isValidRoom: (data: unknown) => data is RoomRaw = ajv.compile(roomSchema);
