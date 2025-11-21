// src/test.ts
import { handler } from "../../lambda/geolocalizacion/geo";
import { APIGatewayProxyEvent } from "aws-lambda";

// src/test.ts
// npx ts-node src/test/geolocalizacion/list.ts

const mockEvent: APIGatewayProxyEvent = {
  httpMethod: "GET",
  path: "/",
  headers: { "Content-Type": "application/json" },
  multiValueHeaders: {},

  queryStringParameters: {
    lat: "-6.473865",    
    lon: "-78.8857627"
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

