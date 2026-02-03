"use client";

import { useState, useEffect } from "react";
import { Key, Check, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface ApiKeyInputProps {
  onKeySaved?: () => void;
}

export function ApiKeyInput({ onKeySaved }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if key exists on mount
  useEffect(() => {
    checkExistingKey();
  }, []);

  const checkExistingKey = async () => {
    try {
      const response = await fetch("/api/settings/api-key");
      const data = await response.json();
      setHasKey(data.hasKey);
    } catch (error) {
      console.error("Failed to check API key status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/settings/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setHasKey(true);
        setApiKey("");
        toast.success("API key saved successfully!");
        onKeySaved?.();
      } else {
        toast.error(data.error || "Failed to save API key");
      }
    } catch (error) {
      toast.error("Failed to save API key");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeApiKey = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/settings/api-key", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setHasKey(false);
        toast.success("API key removed");
        onKeySaved?.();
      } else {
        toast.error("Failed to remove API key");
      }
    } catch (error) {
      toast.error("Failed to remove API key");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Checking API key status...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasKey ? (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            API key is configured and ready to use.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            No API key configured. Get one from{" "}
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline inline-flex items-center gap-1"
            >
              Groq Console
              <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="api-key" className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          Groq API Key
        </Label>
        
        <div className="flex gap-2">
          <Input
            id="api-key"
            type="password"
            placeholder={hasKey ? "••••••••••••••••••••••" : "gsk_..."}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1"
          />
          {hasKey ? (
            <Button
              variant="outline"
              onClick={removeApiKey}
              disabled={isLoading}
            >
              Remove
            </Button>
          ) : (
            <Button
              onClick={saveApiKey}
              disabled={isLoading || !apiKey.trim()}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground">
          Your API key is stored securely on your computer and is never sent to our servers.
          It&apos;s only used to make requests to Groq&apos;s API.
        </p>
      </div>
    </div>
  );
}
