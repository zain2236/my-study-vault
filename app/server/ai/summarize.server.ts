import OpenAI from "openai";
import { getObjectBufferFromR2 } from "~/server/r2/r2.server";

const AI_API_KEY = process.env.AI_API_KEY;

if (!AI_API_KEY) {
  console.warn(
    "[AI] Missing AI_API_KEY. Please set AI_API_KEY in your environment.",
  );
}

function createAIClient() {
  if (!AI_API_KEY) {
    throw new Error("AI_API_KEY is not configured.");
  }

  return new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: AI_API_KEY,
  });
}

/**
 * Get file extension from a file path (lowercase, includes dot)
 */
export function getFileExtension(filePath: string): string {
  const lastDot = filePath.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filePath.substring(lastDot).toLowerCase();
}

/**
 * Check if a file can be summarized (only PDF and DOCX)
 */
export function isSummarizable(filePath: string): boolean {
  const ext = getFileExtension(filePath);
  return ext === ".pdf" || ext === ".docx";
}

/**
 * Extract text content from a buffer based on file type
 */
async function extractTextFromBuffer(
  buffer: Buffer,
  filePath: string,
): Promise<string> {
  const ext = getFileExtension(filePath);

  if (ext === ".pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const data = await parser.getText();
      return data.text;
    } catch (error: any) {
      return "";
    } finally {
      await parser.destroy();
    }
  }

  // If file is DOCX
  if (ext === ".docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

/**
 * Send text to DeepSeek AI for summarization
 */
async function summarizeText(text: string): Promise<string> {
  const client = createAIClient();

  // Truncate very long text to avoid token limits (roughly ~60k chars ≈ 15k tokens)
  const maxChars = 60000;
  const truncatedText =
    text.length > maxChars
      ? text.substring(0, maxChars) + "\n\n[Truncated]"
      : text;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful academic assistant. Summarize the following document concisely. " +
          "Focus on key points, main arguments, and important details. " +
          "Use bullet points and clear headings where appropriate. " +
          "Keep the summary informative yet concise.",
      },
      {
        role: "user",
        content: `Please summarize the following document:\n\n${truncatedText}`,
      },
    ],
    max_tokens: 1500,
    temperature: 0.3,
  });

  const summary = response.choices[0]?.message?.content;
  if (!summary) {
    throw new Error("AI returned an empty response.");
  }

  return summary;
}

/**
 * Full pipeline: fetch file from R2, extract text, summarize with AI
 */
export async function summarizeResource(filePath: string): Promise<string> {
  if (!isSummarizable(filePath)) {
    throw new Error("Only PDF and DOCX files can be summarized.");
  }

  // 1. Fetch file buffer from R2
  const buffer = await getObjectBufferFromR2(filePath);
  if (!buffer) {
    throw new Error("Failed to fetch file from storage.");
  }

  // 2. Extract text
  const text = await extractTextFromBuffer(buffer, filePath);
  if (!text || text.trim().length === 0) {
    throw new Error(
      "Could not extract any text from the file. The file may be scanned or image-based.",
    );
  }

  // 3. Summarize with AI
  const summary = await summarizeText(text);
  return summary;
}
