// db.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

dotenv.config(); // Cargar variables del .env

const client = new DynamoDBClient({
  region: "us-east-1", // Cambia según tu región
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

const ddb = DynamoDBDocumentClient.from(client);

export default ddb;
