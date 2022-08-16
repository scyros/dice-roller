import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import {AWSEvent, OperationError, OperationResult, OperationSuccess} from '../types';

/**
 * Converts string body to json body
 * @param event Message body string
 * @returns Message body json
 */
export function parseBody(event: APIGatewayProxyWebsocketEventV2): unknown | null {
  try {
    const { body: rawBody = "" } = event;
    const body = JSON.parse(rawBody) as unknown;
    (event as AWSEvent).body = body;
    return body;
  } catch (e) {
    return null;
  }
}

/**
 * Retrieve a key from body json or null if it isn't there
 * @param body Message body json
 * @param key Object key to be extracted
 * @returns If key exists in body, the value found or null
 */
export function extractFromBody<T>(body: unknown | null, key: string): T | null {
  if (!body) return null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  return ((body as any)[key] as T) || null;
}

/**
 * Remove an item from a given collection
 * @param collection Collection you want to remove item from
 * @param item Item you want to remove
 * @returns A copy of the collection without the item
 */
export function removeItemFromCollection<T>(collection: T[], item: T): T[] {
  const idx = collection.findIndex((i) => i === item);
  const copy = collection.slice();
  if (idx !== -1) copy.splice(idx, 1);
  return copy;
}

export function isSuccess<T>(result: OperationResult<T>): result is OperationSuccess<T> {
  return result.success;
}

export function isError(result: OperationResult<unknown>): result is OperationError {
  return !result.success;
}
