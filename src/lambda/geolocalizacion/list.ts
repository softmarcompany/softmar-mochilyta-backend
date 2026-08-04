// src/handler.ts
import { APIGatewayProxyEvent } from "aws-lambda";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import ddb from "../../datos/db";
import { gridDisk, latLngToCell } from "h3-js";
import { log } from "console";

export const handler = async (event: any) => {
  // CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  };

  // Preflight
  if (event.requestContext?.http?.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Preflight OK" }),
    };
  }

  try {
    console.error("❌ Error general:");

    // Parámetros recibidos
    const lat = parseFloat(event.queryStringParameters?.lat);
    const lon = parseFloat(event.queryStringParameters?.lon);
    // 1️⃣ Obtener radio (radio 1)
    const radio = parseFloat(event.queryStringParameters?.radio);
    // 1️⃣ Obtener bucket H3 principal (resolución 7)
    const resolution = parseFloat(event.queryStringParameters?.resolution);

    const nombre_tabla = event.queryStringParameters?.nombre_tabla;

    if (!lat || !lon || !nombre_tabla) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Faltan parámetros obligatorios: lat, lon, nombre_tabla",
        }),
      };
    }

    const userBucket = latLngToCell(lat, lon, resolution);
    console.error("❌ Error general:", userBucket);

    // 2️⃣ Obtener hexágonos vecinos (más cercanos)
    const nearBuckets = gridDisk(userBucket, radio); // 1 = vecinos inmediatos

    // 3️⃣ Hacer queries por cada bucket vecino
    const results: any[] = [];

    for (const bucket of nearBuckets) {
      const params = {
        TableName: nombre_tabla,
        IndexName: "h3_bucket-index", // ⚠️ Necesitas un GSI con PK = h3_bucket
        KeyConditionExpression: "h3_bucket = :bucket",
        ExpressionAttributeValues: {
          ":bucket": bucket,
        },
      };

      const response = await ddb.send(new QueryCommand(params));
      if (response.Items) results.push(...response.Items);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        userBucket,
        total: results.length,
        data: results,
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: err?.message || "Error desconocido",
      }),
    };
  }
};
