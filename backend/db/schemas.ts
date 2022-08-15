import Ajv from "ajv";
import { Room, User } from "../types";

const ajv = new Ajv();

const userSchema = {
  type: "object",
  properties: {
    nickName: { type: "string" },
  },
  required: ["nickName"],
  additionalProperties: false,
};

/**
 * Check if input is a valid user
 */
export const isValidUser: (data: unknown) => data is User = ajv.compile(userSchema);

const roomSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

/**
 * Check if input is a valid room
 */
export const isValidRoom: (data: unknown) => data is Room = ajv.compile(roomSchema);
