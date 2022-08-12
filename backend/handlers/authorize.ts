import { APIGatewayAuthorizerEvent } from "aws-lambda";

const getIsAuthorized = (_: APIGatewayAuthorizerEvent) => true;

export const handler = (event: APIGatewayAuthorizerEvent) => {
  const isAuthorized = getIsAuthorized(event);

  return { isAuthorized, context: {} };
};

export default handler;
