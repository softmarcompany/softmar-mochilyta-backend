import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectFacesCommand
} from "@aws-sdk/client-rekognition";
import axios from "axios";
import ddb from "../../datos/db";

const s3 = new S3Client({ region: "us-east-1" });
const rek = new RekognitionClient({ region: "us-east-1" });
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

  // ✅ Respuesta para preflight CORS
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

        // 🔹 Paso 1: Detectar rostros reales
        const facesResult = await rek.send(
          new DetectFacesCommand({
            Image: { Bytes: buffer },
            Attributes: ["DEFAULT"],
          })
        );

        const hayRostro = facesResult.FaceDetails && facesResult.FaceDetails.length > 0;

        // 🔹 Paso 2: Verificar etiquetas para "Person"
        const labelsResult = await rek.send(
          new DetectLabelsCommand({
            Image: { Bytes: buffer },
            MaxLabels: 10,
            MinConfidence: 70,
          })
        );

        const personaLabel = labelsResult.Labels?.find(
          (label) => label.Name?.toLowerCase() === "person"
        );
        const confianzaPersona = personaLabel?.Confidence || 0;

        // 🔹 Paso 3: Guardar imagen solo si NO hay rostros
        // y la confianza de "Person" es baja (<85%)
        if (!hayRostro && confianzaPersona < 85) {
          const fileName = `images/lugares_turisticos/${normalizarTexto(
            data.zona_geografica.pais
          )}/${normalizarTexto(data.zona_geografica.region)}/${normalizarTexto(
            data.zona_geografica.provincia
          )}/${normalizarTexto(data.zona_geografica.distrito)}/${normalizarTexto(
            data.zona_geografica.Lugar["es"]
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
        } else {
          console.log(
            `⚠️ Imagen descartada: posible persona detectada (Rostro: ${hayRostro}, Confianza Person: ${confianzaPersona}%)`
          );
        }
      }

      data.imagen = nuevasImagenes; // ✅ Solo guardamos imágenes válidas
    }

    // 🔹 Guardar en DynamoDB
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
