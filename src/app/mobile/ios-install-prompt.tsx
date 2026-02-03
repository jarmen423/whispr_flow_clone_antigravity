"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share, PlusSquare, X, Download } from "lucide-react";

/**
 * iOS Install Prompt
 * 
 * Shows instructions for adding the PWA to the iOS home screen.
 * iOS doesn't have a native "beforeinstallprompt" event like Android,
 * so we need to manually guide users through the process.
 */

export function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed (standalone mode)
    const isInStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    setIsStandalone(isInStandalone);

    // Check if user has previously dismissed
    const dismissed = localStorage.getItem("ios-install-dismissed");
    setHasDismissed(dismissed === "true");

    // Show prompt if on iOS, not standalone, and not dismissed
    if (isIOSDevice && !isInStandalone && dismissed !== "true") {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("ios-install-dismissed", "true");
    setHasDismissed(true);
  };

  // Don't render if not iOS, already installed, or dismissed
  if (!isIOS || isStandalone || hasDismissed || !showPrompt) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Add to Home Screen
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400"
          onClick={handleDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Install LocalFlow Mobile for quick access:
        </p>
        <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-2 list-decimal list-inside">
          <li className="flex items-center gap-1">
            Tap the share button{" "}
            <Share className="w-4 h-4 inline mx-1" />
          </li>
          <li className="flex items-center gap-1">
            Select &quot;Add to Home Screen&quot;{" "}
            <PlusSquare className="w-4 h-4 inline mx-1" />
          </li>
          <li>Tap &quot;Add&quot; in the top right</li>
        </ol>
        <Button
          size="sm"
          variant="outline"
          className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
          onClick={handleDismiss}
        >
          Got it
        </Button>
      </CardContent>
    </Card>
  );
}
