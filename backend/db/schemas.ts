import Ajv from "ajv";
import { Roll, Room, User, Validator } from "../types";

const ajv = new Ajv();

export function isValidArrayOf<T>(isValidValue: Validator<T>): Validator<T[]> {
  return (data: unknown): data is T[] => {
    if (!Array.isArray(data)) {
      return false;
    }

    return data.every((value) => isValidValue(value));
  };
}

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
    users: { type: "array", items: { type: "string" } },
  },
  required: ["id"],
  additionalProperties: false,
};

/**
 * Check if input is a valid room
 */
export const isValidRoom: (data: unknown) => data is Room = ajv.compile(roomSchema);

const rollSchema = {
  type: "object",
  properties: {
    count: { type: "number" },
    faces: { type: "number" },
    operation: { type: "string", nullable: true },
    modifier: { type: "number", nullable: true },
  },
  required: ["id"],
  additionalProperties: false,
};

export const isValidRoll: (data: unknown) => data is Roll = ajv.compile(rollSchema);
