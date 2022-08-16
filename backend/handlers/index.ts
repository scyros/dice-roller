import { APIGatewayProxyWebsocketEventV2, APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import { Handler, OperationError } from "../types";
import { parseBody } from "../utils";
import authorizeWithEvent from "./authorize";
import createRoomWithEvent from "./createRoom";
import joinRoomWithEvent from "./joinRoom";
import rollWithEvent from "./roll";
import { Error } from "../errors";

function transformBody<T>(fn: Handler<T>): APIGatewayProxyWebsocketHandlerV2<T | OperationError> {
  return (event: APIGatewayProxyWebsocketEventV2): Promise<T | OperationError> => {
    let body: object | null;

    try {
      body = parseBody(event);
    } catch (e) {
      return Promise.resolve({
        success: false,
        errors: [Error.InvalidBody],
      });
    }

    return fn({ ...event, body });
  };
}

export const authorize = authorizeWithEvent;

export const createRoom = transformBody(createRoomWithEvent);
export const joinRoom = transformBody(joinRoomWithEvent);
export const roll = transformBody(rollWithEvent);
