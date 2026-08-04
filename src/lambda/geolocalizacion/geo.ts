// src/handler.ts
import { readFileSync } from "fs";
import path from "path";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import * as turf from "@turf/turf";

const departamentos = JSON.parse(
  readFileSync(
    path.join(__dirname, "geo/peru_departamental_simple.geojson"),
    "utf8"
  )
);

const provincias = JSON.parse(
  readFileSync(
    path.join(__dirname, "geo/peru_provincial_simple.geojson"),
    "utf8"
  )
);

const distritos = JSON.parse(
  readFileSync(
    path.join(__dirname, "geo/peru_distrital_simple.geojson"),
    "utf8"
  )
);

export const handler = async (event: any) => {
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
    const lat = parseFloat(event.queryStringParameters?.lat);
    const lon = parseFloat(event.queryStringParameters?.lon);

    if (!lat || !lon) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Faltan lat y lon" }),
      };
    }

    const point = turf.point([lon, lat]);

    let departamento = null;
    let provincia = null;
    let distrito = null;

    for (const feature of departamentos.features) {
      if (booleanPointInPolygon(point, feature)) {
        departamento = feature.properties.NOMBDEP;
        break;
      }
    }

    for (const feature of provincias.features) {
      if (booleanPointInPolygon(point, feature)) {
        provincia = feature.properties.NOMBPROV;
        break;
      }
    }

    for (const feature of distritos.features) {
      if (!feature || !feature.geometry) {
        console.log("❌ Feature inválido:", feature);
        continue; // saltar este feature
      }

      if (booleanPointInPolygon(point, feature)) {
        distrito = feature.properties.NOMBDIST;
        break;
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        pais: "Perú",
        departamento: departamento || "Desconocido",
        provincia: provincia || "Desconocida",
        distrito: distrito || "Desconocida",
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: err.message,
      }),
    };
  }
};
