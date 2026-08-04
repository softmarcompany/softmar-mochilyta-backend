// src/handler.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import ddb from "../../datos/db";

export const handler = async (event: any) => {
  // ✅ Headers CORS abiertos para cualquier origen
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  };

  // ✅ Manejo correcto del preflight en Lambda Function URL
  if (event.requestContext?.http?.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Preflight OK" }),
    };
  }

  try {
    const {
      nombre_tabla,

      // 🔹 Query normal
      id,
      id_nombre,
      sub_id,
      sub_id_nombre,

      // 🔹 Query por índice
      index_name,
      index_pk,
      index_pk_value,
      index_sk,
      index_sk_value,
    } = event.queryStringParameters || {};

    // Validar que al menos haya un ID
    if (!id && !id_nombre && !nombre_tabla) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        body: JSON.stringify({
          message:
            "Faltan parámetros obligatorios: 'id', 'id_nombre' o 'table'",
        }),
      };
    }

    let params: any = {
      TableName: nombre_tabla,
      ExpressionAttributeValues: {},
    };

    // ===============================
    // ✅ QUERY POR ÍNDICE (GSI)
    // ===============================
    if (index_name && index_pk && index_pk_value) {
      params.IndexName = index_name;
      params.KeyConditionExpression = `${index_pk} = :pk`;
      params.ExpressionAttributeValues[":pk"] = index_pk_value;

      if (index_sk && index_sk_value) {
        params.KeyConditionExpression += ` AND ${index_sk} = :sk`;
        params.ExpressionAttributeValues[":sk"] = index_sk_value;
      }
    } // ===============================
    // ✅ QUERY NORMAL (PK / SK)
    // ===============================
    else if (id && id_nombre) {
      params.KeyConditionExpression = `${id_nombre} = :id`;
      params.ExpressionAttributeValues[":id"] = id;

      if (sub_id && sub_id_nombre) {
        params.KeyConditionExpression += ` AND ${sub_id_nombre} = :sub_id`;
        params.ExpressionAttributeValues[":sub_id"] = sub_id;
      }
    } else {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Faltan parámetros de búsqueda" }),
      };
    }

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
