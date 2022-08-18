import { APIGatewayRequestAuthorizerEventV2, APIGatewayRequestSimpleAuthorizerHandlerV2 } from "aws-lambda";

const getIsAuthorized = async (_: APIGatewayRequestAuthorizerEventV2) => Promise.resolve(true);

const handler: APIGatewayRequestSimpleAuthorizerHandlerV2 = async (event: APIGatewayRequestAuthorizerEventV2) => {
  const isAuthorized = await getIsAuthorized(event);

  return { isAuthorized };
};

export default handler;
