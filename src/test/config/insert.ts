// src/test.ts
import { handler } from "../../lambda/lugar/insert";
import { APIGatewayProxyEvent } from "aws-lambda";

const mockEvent: APIGatewayProxyEvent = {
  httpMethod: "POST", // 👈 POST en vez de GET
  path: "/",

  headers: {
    "Content-Type": "application/json", origin: "http://localhost:5175"  // 👈 simula que viene desde tu frontend
  },
  multiValueHeaders: {},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  pathParameters: null,
  stageVariables: null,
  requestContext: {} as any,
  // 👇 Body como string (igual que lo enviaría un cliente HTTP)
  body: JSON.stringify({
    id_lugar: "lima#lima#peru",
    id_lugar_turistico: "museum#bellas-artes",
    horario: {
      apertura: "09:00",
      cierre: "18:00"
    },
    imagen: [
      { descripcion: "Descripcion 1", img: "https://softmar-mochilyta-landing.s3.amazonaws.com/images/lugares_turisticos/peru/provincia_de_lima/lima/villa_maria_del_triunfo/mirador_de_lomas_de_paraiso_7.jpg" },
      { descripcion: "Descripcion 2", img: "https://softmar-mochilyta-landing.s3.amazonaws.com/images/lugares_turisticos/peru/provincia_de_lima/lima/villa_maria_del_triunfo/mirador_de_lomas_de_paraiso_0.jpg" },
      { descripcion: "Descripcion 2", img: "https://softmar-mochilyta-landing.s3.amazonaws.com/images/lugares_turisticos/peru/provincia_de_lima/lima/villa_maria_del_triunfo/lomas_de_paraiso_4.jpg" },
    { descripcion: "Descripcion 2", img: "https://softmar-mochilyta-landing.s3.amazonaws.com/images/lugares_turisticos/peru/provincia_de_lima/lima/villa_maria_del_triunfo/lomas_de_paraiso_7.jpg" }

    ],



    lugar: "Bellas Artes",
    precio: { adultos: 20, discapacitados: 5, ninos: 10 },
    zona_geografica: { coords: [-12.04806, -77.02833] }
  }),
  isBase64Encoded: false,
  resource: "",
};

(async () => {
  const result = await handler(mockEvent);
  console.log("RESULTADO:");
  console.log(JSON.stringify(result, null, 2));
})();
