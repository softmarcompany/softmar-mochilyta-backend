// src/handler.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import ddb from "../../datos/db";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const descripcion = event.queryStringParameters?.descripcion;
    if (!descripcion) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*", // acceso total
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        body: JSON.stringify({ message: "Falta el parámetro 'id'" }),
      };
    }

    const paramsScan = {
      TableName: "softmar_mochilyta_catalogo_lugares",
      FilterExpression: "contains(descripcion, :desc)",
      ExpressionAttributeValues: {
        ":desc": descripcion
          .normalize("NFD")
          .replace(/(?!\u0303)[\u0300-\u036f]/g, "")
          .toLowerCase(),
      },
    };
    const scanResult = await ddb.send(new ScanCommand(paramsScan));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // acceso total
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify(scanResult.Items),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // acceso total
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({
        error: err instanceof Error ? err.message : "Error desconocido",
      }),
    };
  }
};
