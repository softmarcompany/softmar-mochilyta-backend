// src/test.ts
import { handler } from "../../lambda/geolocalizacion/list";
import { APIGatewayProxyEvent } from "aws-lambda";

// src/test.ts
// npx ts-node src/test/geolocalizacion/list.ts

const mockEvent: APIGatewayProxyEvent = {
  httpMethod: "GET",
  path: "/",
  headers: { "Content-Type": "application/json" },
  multiValueHeaders: {},

  queryStringParameters: {
    lat: "-14.06403",
    lon: "-75.72907",
    radio: "3",
    resolution: "7",
    nombre_tabla: "softmar_mochilyta_lugares"
  },
  multiValueQueryStringParameters: null,
  pathParameters: null,
  stageVariables: null,
  requestContext: { http: { method: "GET" } } as any,
  body: null,
  isBase64Encoded: false,
  resource: "",
};

(async () => {
  const result = await handler(mockEvent);
  console.log("RESULTADO:");
  console.log(JSON.stringify(result, null, 2));
})();

