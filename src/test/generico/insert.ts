// src/test.ts
import { handler } from "../../lambda/generico/insert";
import { APIGatewayProxyEvent } from "aws-lambda";

const mockEvent: APIGatewayProxyEvent = {
  httpMethod: "POST", // 👈 POST en vez de GET
  path: "/",

  headers: {
    "Content-Type": "application/json", origin: "http://localhost:5175"  // 👈 simula que viene desde tu frontend
  },
  multiValueHeaders: {},
  multiValueQueryStringParameters: null,
  pathParameters: null,
  stageVariables: null,
  requestContext: {} as any,

  queryStringParameters: {
    nombre_tabla: "softmar_mochilyta_configuracion", // 👈 aquí pones el valor que deseas probar
  },

  body: JSON.stringify([{
    id_configuracion: "web",
    id_sub_configuracion: "config",
    provincia: {
      apertura: "09:00",
      cierre: "18:00"
    }
  },
  {
    id_configuracion: "web",
    id_sub_configuracion: "config4"
  },
  {
    id_configuracion: "web",
    id_sub_configuracion: "config5"
  }
  ]),
  isBase64Encoded: false,
  resource: "",
};

(async () => {
  const result = await handler(mockEvent);
  console.log("RESULTADO:");
  console.log(JSON.stringify(result, null, 2));
})();
