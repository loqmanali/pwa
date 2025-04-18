"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import { validateUrl } from "@/ai/flows/validate-url";
import { useToast } from "@/hooks/use-toast";
import { QRCodeCanvas } from 'qrcode.react';
import { generatePwaUrl } from "@/ai/flows/generate-pwa-url";

export default function Home() {
  const [url, setUrl] = useState("");
  const [pwaLink, setPwaLink] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
	const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const generatePwa = async () => {
    setError(null);
    setQrCode(null);
    setPwaLink(null);

    if (!url) {
      setError("Please enter a URL.");
      return;
    }

		setIsValidating(true);
    try {
      const validationResult = await validateUrl({ url });

      if (!validationResult.isValid) {
        setError(validationResult.reason || "Invalid URL.");
				setQrCode(null);
				setPwaLink(null);
        return;
      }

      // Use the new generatePwaUrl flow to generate the PWA link
      const pwaResult = await generatePwaUrl({ url });
      setPwaLink(pwaResult.pwaUrl);
      setQrCode(pwaResult.pwaUrl);

      toast({
        title: "PWA Link Generated!",
        description: "The PWA link has been successfully generated.",
      });
    } catch (e: any) {
      console.error("Failed to generate PWA link:", e);
      setError("Failed to generate PWA link.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PWA link.",
      });
    } finally {
			setIsValidating(false);
		}
  };

  const copyPwaLink = () => {
    if (pwaLink) {
      navigator.clipboard.writeText(pwaLink);
      toast({
        title: "PWA Link Copied!",
        description: "The PWA link has been copied to your clipboard.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-secondary">
      <Card className="w-full max-w-md space-y-4 p-4">
        <CardHeader>
          <CardTitle>PWA Generator</CardTitle>
          <CardDescription>Enter a website URL to generate a PWA-compatible link and QR code.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Input
              type="url"
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button onClick={generatePwa} disabled={isValidating}>
            {isValidating ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              "Generate PWA"
            )}
          </Button>
          {error && (
            <Alert variant="destructive">
              <Icons.close className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {pwaLink && (
            <div className="grid gap-2">
              <p>PWA Link:</p>
              <div className="flex items-center space-x-2">
                <Input type="text" value={pwaLink} readOnly />
                <Button variant="secondary" size="sm" onClick={copyPwaLink}>
                  <Icons.copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          )}
          {qrCode && (
            <div className="grid gap-2">
              <p>QR Code:</p>
              <QRCodeCanvas value={qrCode} size={200} level="H" className="rounded-md shadow-md" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
