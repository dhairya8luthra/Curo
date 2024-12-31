import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse"; // or a LangChain PDF loader
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { PineconeStore } from "@langchain/pinecone";
import pinecone from "../pinecone.mjs"; // your pinecone client
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadPdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

async function runIngestion() {
  // 1) Load your PDF
  const pdfPath =
    "D:\\CodingPlayground\\webdev\\Curo-try-1\\backend\\ingest\\Medical_book_1.pdf";
  const text = await loadPdf(pdfPath);

  // 2) Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const docs = await splitter.createDocuments([text]);

  // 3) Create an embeddings instance
  const model = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
  });

  // 4) Get your Pinecone index
  const pineconeIndex = pinecone.Index("curo-2");

  // 5) Store docs into Pinecone
  await PineconeStore.fromDocuments(docs, model, {
    pineconeIndex,
    namespace: "pdf-chunks", // optional grouping
    textKey: "text", // which field in docs to store
  });

  console.log("PDF ingestion done!");
}

// Run the script
runIngestion().catch(console.error);
