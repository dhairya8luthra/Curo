import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { Document } from "@langchain/core/documents";
import { PineconeStore } from "@langchain/pinecone";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import pinecone from "./pinecone.js";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
dotenv.config();
const llm = new ChatGroq({
  model: "Llama3-8b-8192",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
});
// state.medicalRecordsText might have user-provided text
// state.question has the user query // let’s first retrieve from Pinecone

export async function retrieve(state) {
  console.log("---RETRIEVE---");

  // state.question has the user query
  // state.medicalRecordsText might have user-provided text
  // let’s first retrieve from Pinecone
  console.log("Input state:", state);

  const pineconeIndex = pinecone.Index("curo-2");
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
  });

  const pineconeStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    textKey: "text",
    namespace: "pdf-chunks",
  });
  // up to top-5 similar chunks
  const retrievedPdfDocs = await pineconeStore.similaritySearch(
    state.question,
    5
  );

  // If you also want to embed the user’s text:
  let userTextDocs = [];
  if (state.medicalRecordsText) {
    // embed on-the-fly
    userTextDocs = [
      new Document({
        pageContent: state.medicalRecordsText,
        metadata: { type: "userInput" },
      }),
    ];
  }

  const documents = [...retrievedPdfDocs, ...userTextDocs];
  console.log("Retrieved documents:", documents);
  return { documents };
}
/**
 * 2) gradeDocuments()
 * - Let the LLM decide if doc is relevant.
 */
export async function gradeDocuments(state) {
  console.log("---CHECK RELEVANCE---");
  console.log("Documents before grading:", state.documents);

  // Expect a yes/no answer
  const docGraderSchema = z.object({
    binaryScore: z.enum(["yes", "no"]),
  });
  const gradingLLM = llm.withStructuredOutput(docGraderSchema, {
    name: "grade",
  });

  const prompt = ChatPromptTemplate.fromTemplate(`
  You are a grader checking if the text below is relevant to the user’s question.
  Text:
  {docText}
  Question:
  {question}
  Answer in 'binaryScore': "yes" or "no".
  `);

  const filteredDocs = [];
  for (const doc of state.documents || []) {
    console.log("Grading doc:", doc);
    const grade = await prompt
      .pipe(gradingLLM)
      .invoke({ docText: doc.pageContent, question: state.question });
    console.log("Grade result:", grade);
    if (grade.binaryScore === "yes") {
      filteredDocs.push(doc);
    }
  }
  console.log("Documents after grading:", filteredDocs);
  return { documents: filteredDocs };
}
/**
 * 3) decideToGenerate()
 * - If we have relevant docs, generate. Otherwise, do corrective path
 */
export function decideToGenerate(state) {
  console.log("---DECIDE TO GENERATE---");
  console.log("Documents at decideToGenerate:", state.documents);
  if (!state.documents || state.documents.length === 0) {
    console.log("No documents found, transforming query.");
    return "transformQuery"; // no docs => corrective path
  }
  console.log("Proceeding to generate.");
  return "generate"; // else proceed
}

/**
 * 4) transformQuery()
 * - rewrite the question for better external search
 */
export async function transformQuery(state) {
  console.log("---TRANSFORM QUERY---");
  console.log("Original question:", state.question);
  const prompt = ChatPromptTemplate.fromTemplate(`
  Rewrite the user question to be more explicit and suitable for a web search only give the new question as response no other text:
  Original:
  {question}
  Improved:
  `);
  const chain = prompt.pipe(llm).pipe(new StringOutputParser());
  let newQ = await chain.invoke({ question: state.question });
  newQ = newQ.replace(/.*"(.*?)".*/s, "$1");
  console.log("Transformed question:", newQ);
  return { question: newQ };
}

/**
 * 5) webSearch()
 * - Search external sources (TavilySearch, PubMed, WebMD, etc.)
 */
export async function webSearch(state) {
  console.log("---WEB SEARCH---");
  console.log("State before web search:", state);
  const tool = new TavilySearchResults();
  const resultsText = await tool.invoke({ input: state.question });

  // create a Document from results
  const webDoc = new Document({
    pageContent: resultsText,
    metadata: { type: "webSearch" },
  });
  const combinedDocs = (state.documents || []).concat(webDoc);
  console.log("Documents after web search:", combinedDocs);
  return { documents: combinedDocs };
}

/**
 * 6) generate()
 * - Combine final docs & produce an answer
 */
export async function generate(state) {
  console.log("---GENERATE---");
  console.log("Documents at generate:", state.documents);

  const prompt = ChatPromptTemplate.fromTemplate(`
  You are a medical professional and act like one. Use ONLY the following text to answer the user’s question:
  {context}
  
  User’s question: {question}
  
  If the text does not contain enough information, say: "I do not have enough info."
  `);

  const chain = prompt.pipe(llm).pipe(new StringOutputParser());

  const docsAsString = state.documents
    .map(
      (doc, i) =>
        `DOC #${i + 1} (type: ${doc.metadata?.type || "pdfChunk"}):\n${
          doc.pageContent
        }`
    )
    .join("\n\n");

  try {
    const generation = await chain.invoke({
      context: docsAsString,
      question: state.question,
    });
    console.log("Generated answer:", generation);
    return { generation };
  } catch (err) {
    console.error("Error in generate node:", err);
    return { generation: "" };
  }
}
