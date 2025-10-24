import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import ddb from "../../datos/db";
import dotenv from "dotenv";
dotenv.config(); // Cargar variables del .env
const s3 = new S3Client({ region: "us-east-1" });
const BUCKET_NAME = "softmar-mochilyta-landing";

export const handler = async (event: any) => {
  const normalizarTexto = (texto: string) =>
    texto
      .normalize("NFD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .trim();

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  };

  if (event.requestContext?.http?.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Preflight OK" }),
    };
  }

  try {
    const data = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    if (Array.isArray(data.imagen) && data.imagen.length > 0) {
      const nuevasImagenes: { img: string }[] = [];

      for (let i = 0; i < data.imagen.length; i++) {
        const imageUrl = data.imagen[i].img;
        const response = await axios.get(imageUrl, {
          responseType: "arraybuffer",
          maxRedirects: 10,
        });
        const buffer = Buffer.from(response.data);

        const fileName = `images/lugares_turisticos/${normalizarTexto(
          data.zona_geografica.pais
        )}/${normalizarTexto(data.zona_geografica.region)}/${normalizarTexto(
          data.zona_geografica.provincia
        )}/${normalizarTexto(data.zona_geografica.distrito)}/${normalizarTexto(
          data.zona_geografica.lugar["es"]
        )}_${i}.jpg`;

        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: "image/jpeg",
          })
        );

        nuevasImagenes.push({
          img: `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`,
        });
      }

      data.imagen = nuevasImagenes;
    }

    // Guardar en DynamoDB
    const params = { TableName: "softmar_mochilyta_lugares", Item: data };
    await ddb.send(new PutCommand(params));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "✅ Lugar insertado correctamente",
        data,
      }),
    };
  } catch (err) {
    console.error("❌ Error en la Lambda:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: err instanceof Error ? err.message : "Error desconocido",
      }),
    };
  }
};
