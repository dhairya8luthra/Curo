// pinecone.mjs
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

const pinecone = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY,
});

export default pinecone;
