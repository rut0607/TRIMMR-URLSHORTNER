// src/pages/QrCodePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  QrCode, Download, Copy, Check, Share2, 
  BarChart3, ChevronLeft, Link as LinkIcon
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const QrCodePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [urlData, setUrlData] = useState(null);
  const [qrCopied, setQrCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchUrlData();
    }
  }, [id]);

  const fetchUrlData = async () => {
    try {
      const { data, error } = await supabase
        .from('urls')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setUrlData(data);
    } catch (error) {
      console.error("Error fetching URL data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getShortUrl = () => {
    return `${window.location.origin}/${urlData?.short_url}`;
  };

  const copyQrCode = async () => {
    try {
      const canvas = document.getElementById("qr-code-canvas");
      if (canvas) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve));
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setQrCopied(true);
        setTimeout(() => setQrCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy QR code:", err);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `qrcode-${urlData?.short_url || 'link'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!urlData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-4">URL not found</h2>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            QR Code Generator
          </h1>
          <p className="text-gray-600">
            Generate and download QR code for your shortened URL
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code
              </CardTitle>
              <CardDescription>
                Scan to visit: {getShortUrl()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="mb-6 p-6 bg-white rounded-xl border shadow-sm">
                  <QRCodeSVG
                    id="qr-code-canvas"
                    value={getShortUrl()}
                    size={220}
                    level="H"
                    includeMargin={true}
                    fgColor="#1e40af"
                    bgColor="#ffffff"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <Button
                    onClick={downloadQRCode}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button
                    onClick={copyQrCode}
                    className="flex-1 gap-2"
                  >
                    {qrCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy QR Code
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Link Details & Actions Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Link Details</CardTitle>
              <CardDescription>Information about your shortened URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Shortened URL</h4>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                  <a 
                    href={getShortUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 hover:underline break-all"
                  >
                    {getShortUrl()}
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Original URL</h4>
                <p className="text-sm text-gray-700 break-all">{urlData.original_url}</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    onClick={() => navigate(`/link/${id}/edit`)}
                    variant="outline"
                    className="justify-start"
                  >
                    Edit Link
                  </Button>
                  <Button
                    onClick={() => navigate(`/analytics/${id}`)}
                    variant="outline"
                    className="justify-start"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Sharing Tips</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Share2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Print the QR code for physical materials like business cards or flyers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Share2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Include in digital presentations, PDFs, or email signatures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Share2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Share on social media platforms for easy mobile scanning</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QrCodePage;