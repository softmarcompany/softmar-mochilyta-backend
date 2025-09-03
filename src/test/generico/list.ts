// src/test.ts
import { handler } from "../../lambda/generico/list";
import { APIGatewayProxyEvent } from "aws-lambda";

const mockEvent: APIGatewayProxyEvent = {
  httpMethod: "GET",
  path: "/",
  headers: { "Content-Type": "application/json"  } , // 👈 simula que viene desde tu frontend
  multiValueHeaders: {},
  queryStringParameters: {
    id: "web", // 👈 aquí pones el valor que deseas probar
    id_nombre: "id_configuracion", // 👈 aquí pones el valor que deseas probar
    sub_id: "", // 👈 aquí pones el valor que deseas probar
    sub_id_nombre: "", // 👈 aquí pones el valor que deseas probar
    nombre_tabla: "softmar_mochilyta_configuracion", // 👈 aquí pones el valor que deseas probar
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
  console.log("RESULTADO:");
  console.log(JSON.stringify(result, null, 2));
})();
