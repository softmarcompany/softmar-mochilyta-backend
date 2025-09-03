import { PutCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import ddb from "../../datos/db";

const s3 = new S3Client({ region: "us-east-1" });
const BUCKET_NAME = "softmar-mochilyta-landing";

export const handler = async (event: any) => {
  const nombre_tabla = event.queryStringParameters?.nombre_tabla;


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
    // ✅ Parsear el body de la request
    // ✅ Parsear el body de la request (esperamos un array de 2 objetos)
    const data = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    if (!Array.isArray(data)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Debes enviar registros en el body"
        })
      };
    }

    // ✅ Insertar múltiples registros con BatchWrite
    const params = {
      RequestItems: {
        [nombre_tabla]: data.map((item) => ({
          PutRequest: {
            Item: item
          }
        }))
      }
    };

    await ddb.send(new BatchWriteCommand(params));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Lugar insertado correctamente", data })
    };
  } catch (err) {
    console.error("❌ Error en la Lambda:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: err instanceof Error ? err.message : "Error desconocido"
      })
    };
  }
};
