// src/handler.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import ddb from "../../datos/db";

export const handler = async (event: any) => {

  // ✅ Headers CORS abiertos para cualquier origen
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  // ✅ Manejo correcto del preflight en Lambda Function URL
  if (event.requestContext?.http?.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Preflight OK" })
    };
  }

  try {
    // Parámetros recibidos desde la URL
    const id = event.queryStringParameters?.id;
    const id_nombre = event.queryStringParameters?.id_nombre;  // Nombre dinámico de la PK
    const sub_id = event.queryStringParameters?.sub_id;
    const sub_id_nombre = event.queryStringParameters?.sub_id_nombre;  // Nombre dinámico de la SK
    const nombre_tabla = event.queryStringParameters?.nombre_tabla;

    // Validar que al menos haya un ID
    if (!id && !id_nombre && !nombre_tabla) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        body: JSON.stringify({ message: "Faltan parámetros obligatorios: 'id', 'id_nombre' o 'table'" }),
      };
    }

    // Construir parámetros base
    let keyCondition = `${id_nombre} = :id`;
    const expressionValues: Record<string, any> = {
      ":id": id,
    };

    // Si viene sub_id, agregamos la SK a la consulta
    if (sub_id && sub_id_nombre) {
      keyCondition += ` AND ${sub_id_nombre} = :sub_id`;
      expressionValues[":sub_id"] = sub_id;
    }

    const params = {
      TableName: nombre_tabla,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: expressionValues,
    };

    // Ejecutar consulta
    const result = await ddb.send(new QueryCommand(params));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify(result.Items),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({
        error: err instanceof Error ? err.message : "Error desconocido",
      }),
    };
  }
};
