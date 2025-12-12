import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, Check, Link as LinkIcon, Sparkles, AlertCircle, 
  QrCode, Download, BarChart3, Share2, PlusCircle, 
  Calendar, Users, Globe, Smartphone, Activity
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QRCodeSVG } from "qrcode.react";

const Link = () => {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [analyticsData, setAnalyticsData] = useState({
    totalClicks: 0,
    uniqueVisitors: 0,
    topCountry: "USA",
    devices: { mobile: 60, desktop: 35, tablet: 5 }
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const activeTab = searchParams.get('tab') || 'create';
  
  // Get URL from query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlParam = searchParams.get("url");
    
    if (urlParam) {
      setUrl(decodeURIComponent(urlParam));
    }
    
    // If editing existing URL, fetch its data
    if (id) {
      fetchUrlData(id);
      fetchAnalyticsData(id);
    }
  }, [id, location.search]);

  const fetchUrlData = async (urlId) => {
    try {
      const { data, error } = await supabase
        .from('urls')
        .select('*')
        .eq('id', urlId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setUrl(data.original_url);
        setCustomSlug(data.short_url);
        setShortenedUrl(`${window.location.origin}/${data.short_url}`);
      }
    } catch (err) {
      console.error("Error fetching URL data:", err);
    }
  };

  const fetchAnalyticsData = async (urlId) => {
    // Mock analytics data - replace with actual API call
    setAnalyticsData({
      totalClicks: Math.floor(Math.random() * 1000) + 100,
      uniqueVisitors: Math.floor(Math.random() * 800) + 50,
      topCountry: ["USA", "India", "UK", "Canada", "Germany"][Math.floor(Math.random() * 5)],
      devices: { 
        mobile: Math.floor(Math.random() * 40) + 40,
        desktop: Math.floor(Math.random() * 40) + 30,
        tablet: 100 - (Math.floor(Math.random() * 40) + 40 + Math.floor(Math.random() * 40) + 30)
      }
    });
  };

  const validateUrl = (url) => {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      new URL(url);
      return url;
    } catch (err) {
      throw new Error('Please enter a valid URL (e.g., https://example.com)');
    }
  };

  const validateCustomSlug = (slug) => {
    if (!slug) return true;
    
    const isValid = /^[a-zA-Z0-9-]+$/.test(slug);
    if (!isValid) {
      throw new Error('Custom slug can only contain letters, numbers, and hyphens');
    }
    
    if (slug.length < 3) {
      throw new Error('Custom slug must be at least 3 characters long');
    }
    
    if (slug.length > 30) {
      throw new Error('Custom slug cannot exceed 30 characters');
    }
    
    return true;
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const validatedUrl = validateUrl(url);
      validateCustomSlug(customSlug);
      
      if (!user) {
        throw new Error('You must be logged in to create URLs');
      }
      
      const { data, error: rpcError } = await supabase.rpc('create_url', {
        p_user_id: user.id,
        p_original_url: validatedUrl,
        p_custom_url: customSlug || null,
        p_title: null
      });
      
      if (rpcError) {
        if (rpcError.message.includes('already exists')) {
          throw new Error('This custom slug is already taken. Please choose another one.');
        }
        throw new Error(rpcError.message || 'Failed to create short URL');
      }
      
      if (data) {
        const fullShortUrl = `${window.location.origin}/${data.short_url}`;
        setShortenedUrl(fullShortUrl);
        setSuccess('URL shortened successfully!');
      }
      
    } catch (err) {
      console.error("Error shortening URL:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      link.download = `qrcode-${shortenedUrl.split('/').pop() || 'link'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-6">
                You need to be logged in to create short URLs.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Log In
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                  variant="outline"
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {id ? "Manage Link" : "Create Short Link"}
          </h1>
          <p className="text-gray-600">
            {id 
              ? "View analytics, generate QR code, or edit your shortened URL"
              : "Shorten any URL and make it memorable"
            }
          </p>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue={activeTab} className="mb-8">
          <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
            <TabsTrigger value="create" onClick={() => navigate(id ? `/link/${id}` : '/link')}>
              <LinkIcon className="w-4 h-4 mr-2" />
              {id ? "Edit Link" : "Create Link"}
            </TabsTrigger>
            <TabsTrigger 
              value="qr" 
              onClick={() => navigate(`/link/${id || shortenedUrl.split('/').pop()}?tab=qr`)}
              disabled={!id && !shortenedUrl}
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              onClick={() => navigate(`/link/${id || shortenedUrl.split('/').pop()}?tab=analytics`)}
              disabled={!id && !shortenedUrl}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* CREATE LINK TAB */}
          <TabsContent value="create">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <LinkIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                      {id ? "Edit Your Link" : "Create Short Link"}
                    </CardTitle>
                    <CardDescription>
                      {id ? "Update your shortened URL" : "Shorten any URL and make it memorable"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleShorten} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="original-url">
                      <div className="flex items-center gap-2">
                        <span>Destination URL</span>
                        <span className="text-xs text-red-500">*</span>
                      </div>
                    </Label>
                    <Input
                      id="original-url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/very-long-url-path"
                      className="w-full h-12"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Enter the full URL you want to shorten
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-slug">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          <span>Custom Slug (Optional)</span>
                        </div>
                      </Label>
                      <span className="text-xs text-gray-500">
                        {customSlug.length}/30
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">{window.location.origin}/</span>
                      <Input
                        id="custom-slug"
                        value={customSlug}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase();
                          const filtered = value.replace(/[^a-z0-9-]/g, '');
                          setCustomSlug(filtered);
                        }}
                        placeholder="my-custom-link"
                        className="flex-1 h-12"
                        maxLength={30}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Leave blank for auto-generated. Only letters, numbers, and hyphens allowed.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base font-medium shadow-lg"
                    disabled={loading || !url.trim()}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {id ? "Updating..." : "Creating..."}
                      </span>
                    ) : (id ? "Update Link" : "Shorten URL")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QR CODE TAB */}
          <TabsContent value="qr">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      QR Code Generator
                    </CardTitle>
                    <CardDescription>
                      Scan to visit your shortened URL
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={downloadQRCode}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      onClick={copyQrCode}
                      size="sm"
                      className="gap-1"
                    >
                      {qrCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy QR
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="mb-4 p-6 bg-white rounded-xl border shadow-sm">
                      <QRCodeSVG
                        id="qr-code-canvas"
                        value={shortenedUrl || `${window.location.origin}/${id}`}
                        size={200}
                        level="H"
                        includeMargin={true}
                        fgColor="#1e40af"
                        bgColor="#ffffff"
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center max-w-xs">
                      Scan this QR code with any smartphone camera
                    </p>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Sharing Tips
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span><strong>Print Materials:</strong> Add QR code to business cards, flyers, or posters</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span><strong>Digital Sharing:</strong> Include in presentations, PDFs, or digital ads</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span><strong>Social Media:</strong> Share the QR code image on Instagram, LinkedIn, etc.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span><strong>Email Signatures:</strong> Add both the short link and QR code</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Track Performance
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Automatic click tracking enabled</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Real-time analytics dashboard</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Device and location insights</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Link Analytics
                </CardTitle>
                <CardDescription>
                  Track performance of your shortened URL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Total Clicks</p>
                          <h3 className="text-2xl font-bold">{analyticsData.totalClicks.toLocaleString()}</h3>
                        </div>
                        <Activity className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Unique Visitors</p>
                          <h3 className="text-2xl font-bold">{analyticsData.uniqueVisitors.toLocaleString()}</h3>
                        </div>
                        <Users className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Top Country</p>
                          <h3 className="text-2xl font-bold">{analyticsData.topCountry}</h3>
                        </div>
                        <Globe className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Mobile Users</p>
                          <h3 className="text-2xl font-bold">{analyticsData.devices.mobile}%</h3>
                        </div>
                        <Smartphone className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Device Distribution</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Mobile</span>
                        <span>{analyticsData.devices.mobile}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${analyticsData.devices.mobile}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Desktop</span>
                        <span>{analyticsData.devices.desktop}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${analyticsData.devices.desktop}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tablet</span>
                        <span>{analyticsData.devices.tablet}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500" 
                          style={{ width: `${analyticsData.devices.tablet}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions (only when URL is created and not in edit mode) */}
        {shortenedUrl && !id && (
          <Card className="border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>Manage and track your new link</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <LinkIcon className="w-6 h-6" />
                  <span className="font-medium">View All Links</span>
                  <span className="text-xs text-gray-500">Go to dashboard</span>
                </Button>
                
                <Button 
                  onClick={() => navigate(`/link/${shortenedUrl.split('/').pop()}?tab=analytics`)}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <BarChart3 className="w-6 h-6" />
                  <span className="font-medium">View Analytics</span>
                  <span className="text-xs text-gray-500">Track clicks & stats</span>
                </Button>
                
                <Button 
                  onClick={() => {
                    setUrl("");
                    setCustomSlug("");
                    setShortenedUrl("");
                    setSuccess("");
                    navigate("/link");
                  }}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <PlusCircle className="w-6 h-6" />
                  <span className="font-medium">Create Another</span>
                  <span className="text-xs text-gray-500">Shorten new URL</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Link;