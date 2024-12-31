import { StateGraph, START, END, Annotation } from "@langchain/langgraph";

import * as nodes from "./nodes.js";

// We define each field using the generic Annotation<T> syntax
// and supply a reducer & default (if you wish).
// Then we wrap them in Annotation.Root(...).

const CRAGState = Annotation.Root({
  question: Annotation({
    reducer: (current, incoming) => incoming ?? current ?? "",
    default: () => "",
  }),
  medicalRecordsText: Annotation({
    reducer: (current, incoming) => incoming ?? current ?? "",
    default: () => "",
  }),
  documents: Annotation({
    reducer: (current, incoming) => incoming ?? current ?? [],
    default: () => [],
  }),
  generation: Annotation({
    reducer: (current, incoming) => incoming ?? current ?? "",
    default: () => "",
  }),
});

const workflow = new StateGraph(CRAGState)
  .addNode("retrieve", nodes.retrieve)
  .addNode("gradeDocuments", nodes.gradeDocuments)
  .addNode("decideToGenerate", nodes.decideToGenerate)
  .addNode("transformQuery", nodes.transformQuery)
  .addNode("webSearch", nodes.webSearch)
  .addNode("generate", nodes.generate);

// Build edges
workflow.addEdge(START, "retrieve");
workflow.addEdge("retrieve", "gradeDocuments");
workflow.addConditionalEdges("gradeDocuments", nodes.decideToGenerate);
workflow.addEdge("transformQuery", "webSearch");
workflow.addEdge("webSearch", "generate");
workflow.addEdge("generate", END);

export const app = workflow.compile();
