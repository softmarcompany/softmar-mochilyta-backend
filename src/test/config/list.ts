// src/test.ts
import { handler } from "../../lambda/generico/list";
import { APIGatewayProxyEvent } from "aws-lambda";

const mockEvent: APIGatewayProxyEvent = {
  httpMethod: "GET",
  path: "/",
  headers: { "Content-Type": "application/json"  } , // 👈 simula que viene desde tu frontend
  multiValueHeaders: {},
  queryStringParameters: {
    id: "peru#provincia_de_lima", // 👈 aquí pones el valor que deseas probar
  },
  multiValueQueryStringParameters: null,
  pathParameters: null,
  stageVariables: null,
  requestContext: {} as any,
  body: null,
  isBase64Encoded: false,
  resource: "",
};

(async () => {
  const result = await handler(mockEvent);
  console.log("RESULTADO:",result);
  console.log(JSON.stringify(result, null, 2));
})();
