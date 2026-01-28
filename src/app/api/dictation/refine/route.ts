import { NextRequest, NextResponse } from "next/server";

// Environment configuration
const PROCESSING_MODE = process.env.PROCESSING_MODE || "cloud";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:1b";
const OLLAMA_TEMPERATURE = parseFloat(process.env.OLLAMA_TEMPERATURE || "0.1");

type RefinementMode = "developer" | "concise" | "professional" | "raw";

interface RefineRequest {
  text: string;
  mode?: RefinementMode;
  processingMode?: "cloud" | "local";
}

interface RefineResponse {
  success: boolean;
  refinedText?: string;
  originalWordCount?: number;
  refinedWordCount?: number;
  processingMode?: "cloud" | "local";
  error?: string;
  details?: string;
}

// System prompts for each refinement mode
const SYSTEM_PROMPTS: Record<Exclude<RefinementMode, "raw">, string> = {
  developer: `You are a helpful assistant that acts as a dictation correction tool for developers. I will provide a raw transcript. You must:
1. Correct grammar and punctuation
2. Remove filler words (um, uh, like, you know)
3. Format technical terms correctly (e.g., 'git commit' instead of 'get commit', 'npm install' instead of 'n p m install')
4. Keep the same tone and voice as the original
5. Preserve code references and technical concepts accurately
6. Do not add any conversational filler like 'Here is the text'
7. Output ONLY the cleaned text, nothing else.`,

  concise: `You are a helpful assistant that acts as a dictation simplification tool. I will provide a raw transcript. You must:
1. Remove all filler words (um, uh, like, you know, ah, hmm)
2. Shorten and simplify the text while keeping the meaning
3. Remove redundancies and repetition
4. Use clear, direct language
5. Do not add any conversational filler like 'Here is the text'
6. Output ONLY the cleaned text, nothing else.`,

  professional: `You are a helpful assistant that acts as a dictation refinement tool. I will provide a raw transcript. You must:
1. Correct all grammar and punctuation
2. Remove filler words (um, uh, like, you know)
3. Transform casual language into professional, business-appropriate language
4. Maintain a formal yet natural tone
5. Ensure clear, concise communication
6. Do not add any conversational filler like 'Here is the text'
7. Output ONLY the cleaned text, nothing else.`,
};

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Validate incoming refine request
 */
function validateRequest(data: unknown): data is RefineRequest {
  if (!data || typeof data !== "object") return false;
  const req = data as Record<string, unknown>;

  if (!req.text || typeof req.text !== "string") {
    return false;
  }

  if (req.text.length > 10000) {
    throw new Error("Text too long (max 10,000 characters)");
  }

  if (req.mode && !["developer", "concise", "professional", "raw"].includes(req.mode as string)) {
    throw new Error("Invalid refinement mode");
  }

  if (req.processingMode && !["cloud", "local"].includes(req.processingMode as string)) {
    throw new Error("Invalid processing mode");
  }

  return true;
}

/**
 * Cloud refinement using LLM
 * In production, this would use z-ai-web-dev-sdk
 */
async function refineCloud(text: string, mode: Exclude<RefinementMode, "raw">): Promise<string> {
  // In production, this would use the system prompt with the actual LLM
  const _systemPrompt = SYSTEM_PROMPTS[mode];

  // In a real implementation, you would use:
  // import { ZAI } from "z-ai-web-dev-sdk";
  // const zai = new ZAI();
  // const result = await zai.chat.completions.create({
  //   messages: [
  //     { role: "assistant", content: systemPrompt },
  //     { role: "user", content: text }
  //   ],
  //   thinking: { type: "disabled" }
  // });

  // For demo purposes, simulate LLM processing
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Simple refinement simulation
  let refined = text
    .replace(/\b(um|uh|like|you know|ah|hmm)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // Capitalize first letter
  if (refined) {
    refined = refined.charAt(0).toUpperCase() + refined.slice(1);
  }

  // Ensure ending punctuation
  if (refined && !/[.!?]$/.test(refined)) {
    refined += ".";
  }

  return refined || text;
}

/**
 * Local refinement using Ollama
 */
async function refineLocal(text: string, mode: Exclude<RefinementMode, "raw">): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[mode];

  try {
    // Test Ollama connection first
    const testResponse = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    if (!testResponse.ok) {
      throw new Error(`Ollama not responding at ${OLLAMA_URL}`);
    }

    // Call Ollama API
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `${systemPrompt}\n\nRaw transcript:\n${text}\n\nCleaned text:`,
        stream: false,
        options: {
          temperature: OLLAMA_TEMPERATURE,
          top_p: 0.9,
        },
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes("model") && errorText.includes("not found")) {
        throw new Error(
          `Model ${OLLAMA_MODEL} not found. Install with: ollama pull ${OLLAMA_MODEL}`
        );
      }
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.response) {
      throw new Error("Empty response from Ollama");
    }

    return result.response.trim();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError" || error.message.includes("timeout")) {
        throw new Error("Ollama request timed out (30s limit)");
      }
      if (error.message.includes("ECONNREFUSED") || error.message.includes("fetch failed")) {
        throw new Error(
          `Ollama not running at ${OLLAMA_URL}. Start with: ollama serve`
        );
      }
      throw error;
    }
    throw new Error("Unknown error during local refinement");
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<RefineResponse>> {
  try {
    const body = await request.json();

    // Validate request
    if (!validateRequest(body)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          details: "Text is required",
          processingMode: body.processingMode || (PROCESSING_MODE as "cloud" | "local"),
        },
        { status: 400 }
      );
    }

    const mode = body.mode || "developer";
    const processingMode = body.processingMode || (PROCESSING_MODE as "cloud" | "local");

    // For raw mode, return text unchanged
    if (mode === "raw") {
      return NextResponse.json({
        success: true,
        refinedText: body.text,
        originalWordCount: countWords(body.text),
        refinedWordCount: countWords(body.text),
        processingMode,
      });
    }

    let refinedText: string;

    if (processingMode === "cloud") {
      refinedText = await refineCloud(body.text, mode);
    } else {
      refinedText = await refineLocal(body.text, mode);
    }

    return NextResponse.json({
      success: true,
      refinedText,
      originalWordCount: countWords(body.text),
      refinedWordCount: countWords(refinedText),
      processingMode,
    });
  } catch (error) {
    console.error("[Refine] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: "Refinement failed",
        details: errorMessage,
        processingMode: PROCESSING_MODE as "cloud" | "local",
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
