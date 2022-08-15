import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { AWSEvent } from "../types";
import { parseBody } from "../utils";
export { default as authorize } from "./authorize";
import { default as createRoomWithEvent } from "./createRoom";
import { default as joinRoomWithEvent } from "./joinRoom";
import { default as rollWithEvent } from "./roll";

export function transformBody(fn: (event: AWSEvent) => Promise<void>) {
  return function (event: APIGatewayProxyWebsocketEventV2) {
    const body = parseBody(event);
    return fn({ ...event, body });
  };
}

export const createRoom = transformBody(createRoomWithEvent);
export const joinRoom = transformBody(joinRoomWithEvent);
export const roll = transformBody(rollWithEvent);
