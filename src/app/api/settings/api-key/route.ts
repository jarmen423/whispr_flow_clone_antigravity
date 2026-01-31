import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// Store API key in user's home directory (not in repo)
const CONFIG_DIR = join(homedir(), ".localflow");
const API_KEY_FILE = join(CONFIG_DIR, "api-key.txt");

interface ApiKeyRequest {
  apiKey: string;
}

interface ApiKeyResponse {
  success: boolean;
  hasKey: boolean;
  error?: string;
}

/**
 * GET /api/settings/api-key
 * Check if API key is configured
 */
export async function GET(): Promise<NextResponse<ApiKeyResponse>> {
  try {
    const hasKey = existsSync(API_KEY_FILE) && readFileSync(API_KEY_FILE, "utf-8").trim().length > 0;
    return NextResponse.json({
      success: true,
      hasKey,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        hasKey: false,
        error: "Failed to check API key status",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/api-key
 * Save API key to secure location
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiKeyResponse>> {
  try {
    const body = await request.json() as ApiKeyRequest;
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        {
          success: false,
          hasKey: false,
          error: "API key is required",
        },
        { status: 400 }
      );
    }

    // Validate key format (basic check)
    if (!apiKey.startsWith("gsk_")) {
      return NextResponse.json(
        {
          success: false,
          hasKey: false,
          error: "Invalid API key format. Should start with 'gsk_'",
        },
        { status: 400 }
      );
    }

    // Create config directory if needed
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }

    // Save key (in production, consider encrypting this)
    writeFileSync(API_KEY_FILE, apiKey, { mode: 0o600 }); // User read/write only

    // Also set in environment for current process
    process.env.GROQ_API_KEY = apiKey;

    return NextResponse.json({
      success: true,
      hasKey: true,
    });
  } catch (error) {
    console.error("[API Key] Error saving:", error);
    return NextResponse.json(
      {
        success: false,
        hasKey: false,
        error: "Failed to save API key",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings/api-key
 * Remove stored API key
 */
export async function DELETE(): Promise<NextResponse<ApiKeyResponse>> {
  try {
    if (existsSync(API_KEY_FILE)) {
      // In a real app, use secure deletion
      writeFileSync(API_KEY_FILE, "", { mode: 0o600 });
    }

    delete process.env.GROQ_API_KEY;

    return NextResponse.json({
      success: true,
      hasKey: false,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        hasKey: existsSync(API_KEY_FILE),
        error: "Failed to remove API key",
      },
      { status: 500 }
    );
  }
}

// Export helper to get API key
export function getStoredApiKey(): string | null {
  try {
    if (existsSync(API_KEY_FILE)) {
      return readFileSync(API_KEY_FILE, "utf-8").trim();
    }
  } catch {
    // Ignore errors
  }
  return null;
}
