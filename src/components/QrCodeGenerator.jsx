// src/components/QrCodeGenerator.jsx
import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Copy, Check, QrCode as QrCodeIcon } from "lucide-react";
import { toast } from "sonner";

const QrCodeGenerator = ({ url, title = "QR Code" }) => {
  const [copied, setCopied] = useState(false);

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `qrcode-${url.split('/').pop() || 'link'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const copyQRCodeAsImage = async () => {
    try {
      const canvas = document.getElementById("qr-code-canvas");
      if (canvas) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve));
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        toast.success("QR Code copied to clipboard!");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy QR code:", err);
      toast.error("Failed to copy QR code");
    }
  };

  if (!url) {
    return (
      <div className="text-center p-8">
        <QrCodeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No URL provided for QR code</p>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCodeIcon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="mb-4 p-4 bg-white rounded-lg border">
          <QRCodeSVG
            id="qr-code-canvas"
            value={url}
            size={180}
            level="H"
            includeMargin={true}
            fgColor="#1e40af"
            bgColor="#ffffff"
          />
        </div>
        
        <div className="text-center mb-4">
          <p className="text-sm font-medium text-gray-700">Scan this QR code</p>
          <p className="text-xs text-gray-500 break-all max-w-xs mt-1">
            {url}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            onClick={downloadQRCode}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button
            onClick={copyQRCodeAsImage}
            className="flex-1 gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Image
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QrCodeGenerator;