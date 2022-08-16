import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import {OperationError, OperationResult, OperationSuccess, Validator} from '../types';

/**
 * Converts string body to json body
 * @param event Message body string
 * @returns Message body json
 */
export function parseBody(event: APIGatewayProxyWebsocketEventV2): object | null {
  if (!event.body) {
    return null;
  }

  const parsedBody: unknown = JSON.parse(event.body);

  if (parsedBody === null) {
    return null;
  }

  if (!isPlainObject(parsedBody)) {
    throw new Error('Invalid request body');
  }

  return parsedBody;
}

/**
 * Retrieve a key from body json or null if it isn't there
 * @param body Message body json
 * @param key Object key to be extracted
 * @param validator
 * @returns If key exists in body, the value found or null
 */
export function extractFromBody<T>(body: object | null, key: string, validator: Validator<T>): T | null {
  if (!body) return null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  const data: unknown = (body as any)[key];

  if (validator(data)) {
    return data;
  }

  return null;
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

// https://stackoverflow.com/a/69745650/1581433
function isPlainObject (value: unknown): value is object {
  return typeof(value) === 'object' && value?.constructor === Object;
}

export function isSuccess<T>(result: OperationResult<T>): result is OperationSuccess<T> {
  return result.success;
}

export function isError(result: OperationResult<unknown>): result is OperationError {
  return !result.success;
}
