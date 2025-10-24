import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "us-east-1" });

export const handler = async (event: any) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  // ✅ Responder preflight
  if (event.requestContext?.http?.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Preflight OK" })
    };
  }

  try {
    // ✅ Parsear el body
    const data = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    const { bucket_name, carpeta, imagenes } = data;

    if (!bucket_name || !Array.isArray(imagenes) || imagenes.length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Debes enviar bucket_name y un array 'imagenes' con nombre_imagen e imagen_base64"
        })
      };
    }

    // ✅ Procesar todas las imágenes en paralelo
    const uploadResults = await Promise.all(
      imagenes.map(async (img) => {
        try {
          if (!img.nombre_imagen || !img.imagen_base64)
            throw new Error("Campos requeridos faltantes en una imagen");

          const base64Data = img.imagen_base64.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");

          const mimeMatch = img.imagen_base64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
          const ContentType = mimeMatch ? mimeMatch[1] : "image/jpeg";

          const key = `${carpeta ? carpeta + "/" : ""}${Date.now()}_${img.nombre_imagen}`;

          await s3.send(
            new PutObjectCommand({
              Bucket: bucket_name,
              Key: key,
              Body: buffer,
              ContentType,
              ACL: "public-read"
            })
          );

          const url = `https://${bucket_name}.s3.amazonaws.com/${key}`;
          return { nombre_imagen: img.nombre_imagen, url };
        } catch (err: any) {
          return { nombre_imagen: img.nombre_imagen, error: err.message };
        }
      })
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Subida completada",
        resultados: uploadResults
      })
    };
  } catch (err) {
    console.error("❌ Error general:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: err instanceof Error ? err.message : "Error desconocido"
      })
    };
  }
};
