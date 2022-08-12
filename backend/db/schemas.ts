import Ajv from "ajv";

const ajv = new Ajv();

const userSchema = {
  type: "object",
  properties: {
    nickName: { type: "string" },
  },
  required: ["nickName"],
  additionalProperties: false,
};
export const isValidUser = ajv.compile(userSchema);

const roomSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};
export const isValidRoom = ajv.compile(roomSchema);
