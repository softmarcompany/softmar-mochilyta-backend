// src/handler.ts

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";

import {
  ScanCommand,
  ScanCommandOutput
} from "@aws-sdk/lib-dynamodb";

import ddb from "../../datos/db";

const TABLA_ORIGEN =
  "softmar_mochilyta_lugares";

const LIMITE_POR_PAGINA = 100;


export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

  try {

    // ==========================================
    // OBTENER TOKEN DE PAGINACIÓN
    // ==========================================

    const nextToken =
      event.queryStringParameters?.nextToken;


    let ExclusiveStartKey:
      Record<string, any> | undefined =
        undefined;


    // ==========================================
    // DECODIFICAR TOKEN
    // ==========================================

    if (nextToken) {

      try {

        ExclusiveStartKey =
          JSON.parse(
            Buffer.from(
              nextToken,
              "base64"
            ).toString("utf-8")
          );

      } catch (error) {

        return {

          statusCode: 400,

          headers: {

            "Access-Control-Allow-Origin":
              "*",

            "Access-Control-Allow-Headers":
              "Content-Type",

            "Access-Control-Allow-Methods":
              "OPTIONS,POST,GET"

          },

          body: JSON.stringify({

            error:
              "El nextToken no es válido"

          })

        };

      }

    }


    // ==========================================
    // EJECUTAR SCAN
    // ==========================================

    console.log(
      "Escaneando tabla:",
      TABLA_ORIGEN
    );


    const response: ScanCommandOutput =
      await ddb.send(

        new ScanCommand({

          TableName:
            TABLA_ORIGEN,

          Limit:
            LIMITE_POR_PAGINA,

          ExclusiveStartKey

        })

      );


    // ==========================================
    // OBTENER LUGARES
    // ==========================================

    const lugares =
      response.Items ?? [];


    // ==========================================
    // GENERAR SIGUIENTE TOKEN
    // ==========================================

    let nuevoNextToken:
      string | null = null;


    if (response.LastEvaluatedKey) {

      nuevoNextToken =
        Buffer.from(

          JSON.stringify(
            response.LastEvaluatedKey
          )

        ).toString("base64");

    }


    // ==========================================
    // RESPUESTA
    // ==========================================

    return {

      statusCode: 200,

      headers: {

        "Access-Control-Allow-Origin":
          "*",

        "Access-Control-Allow-Headers":
          "Content-Type",

        "Access-Control-Allow-Methods":
          "OPTIONS,POST,GET"

      },

      body: JSON.stringify({

        success: true,

        cantidad:
          lugares.length,

        lugares,

        nextToken:
          nuevoNextToken

      })

    };


  } catch (err) {

    console.error(

      "Error obteniendo lugares:",

      err

    );


    return {

      statusCode: 500,

      headers: {

        "Access-Control-Allow-Origin":
          "*",

        "Access-Control-Allow-Headers":
          "Content-Type",

        "Access-Control-Allow-Methods":
          "OPTIONS,POST,GET"

      },

      body: JSON.stringify({

        success: false,

        error:

          err instanceof Error

            ? err.message

            : "Error desconocido"

      })

    };

  }

};
