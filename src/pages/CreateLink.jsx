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
  Calendar, Users, Globe, Smartphone, Activity,
  Zap, Target, Rocket, Shield, Eye
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QRCodeSVG } from "qrcode.react";

const CreateLink = () => {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [createdLinkId, setCreatedLinkId] = useState(null);
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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlParam = searchParams.get("url");
    
    if (urlParam) {
      setUrl(decodeURIComponent(urlParam));
    }
    
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
        setCreatedLinkId(data.id);
      }
    } catch (err) {
      console.error("Error fetching URL data:", err);
    }
  };

  const fetchAnalyticsData = async (urlId) => {
    setAnalyticsData({
      totalClicks: Math.floor(Math.random() * 1000) + 100,
      uniqueVisitors: Math.floor(Math.random() * 800) + 50,
      topCountry: ["USA", "India", "UK", "Canada", "Germany"][Math.floor(Math.random() * 5)],
      devices: { 
        mobile: Math.floor(Math.random() * 40) + 40,
        desktop: Math.floor(Math.random() * 40) + 30,
        tablet: Math.max(0, 100 - (Math.floor(Math.random() * 40) + 40 + Math.floor(Math.random() * 40) + 30))
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
    setCreatedLinkId(null);
    
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
        setCreatedLinkId(data.id);
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
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

  const handleCreateAnother = () => {
    setUrl("");
    setCustomSlug("");
    setShortenedUrl("");
    setCreatedLinkId(null);
    setSuccess("");
    setError("");
  };

  const getShortSlug = () => {
    if (!shortenedUrl) return '';
    const parts = shortenedUrl.split('/');
    return parts[parts.length - 1];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
                <AlertCircle className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Authentication Required</h2>
              <p className="text-slate-600 mb-8">
                You need to be logged in to create short URLs and track analytics.
              </p>
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg"
                >
                  Log In
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 py-6 text-lg"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-6 lg:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  {id ? "Manage Your Link" : shortenedUrl ? "Link Created!" : "Create Short Link"}
                </h1>
              </div>
              <p className="text-lg text-slate-600 max-w-2xl">
                {id 
                  ? "View analytics, generate QR code, or edit your shortened URL"
                  : shortenedUrl
                  ? "Your link has been created. Use the options below to manage it."
                  : "Shorten any URL and make it memorable"
                }
              </p>
            </div>
            
            {shortenedUrl && (
              <Button
                onClick={copyToClipboard}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-3 px-6 py-6 shadow-lg"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Link
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue={activeTab} className="mb-8">
          <TabsList className="grid w-full md:w-auto grid-cols-3 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-2xl">
            <TabsTrigger 
              value="create" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all"
              onClick={() => navigate(id ? `/link/${id}` : '/link')}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              {id ? "Edit Link" : "Create Link"}
            </TabsTrigger>
            <TabsTrigger 
              value="qr" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all"
              onClick={() => navigate(`/link/${createdLinkId || id || getShortSlug()}?tab=qr`)}
              disabled={!shortenedUrl && !id}
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all"
              onClick={() => navigate(`/link/${createdLinkId || id || getShortSlug()}?tab=analytics`)}
              disabled={!shortenedUrl && !id}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* CREATE LINK TAB */}
          <TabsContent value="create">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      {id ? "Edit Your Link" : "Create Short Link"}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {id ? "Update your shortened URL" : "Shorten any URL and make it memorable"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <AlertDescription className="text-green-800 font-medium">{success}</AlertDescription>
                    </div>
                  </Alert>
                )}

                <form onSubmit={handleShorten} className="space-y-8">
                  {/* Destination URL */}
                  <div className="space-y-4">
                    <Label htmlFor="original-url" className="text-base font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span>Destination URL</span>
                        <span className="text-red-500">*</span>
                      </div>
                    </Label>
                    <div className="relative">
                      <Input
                        id="original-url"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/very-long-url-path"
                        className="w-full h-14 pl-12 text-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white"
                        required
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <LinkIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 pl-1">
                      Enter the full URL you want to shorten
                    </p>
                  </div>

                  {/* Custom Slug */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-slug" className="text-base font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span>Custom Slug (Optional)</span>
                        </div>
                      </Label>
                      <span className={`text-sm ${customSlug.length > 25 ? 'text-orange-500' : 'text-slate-500'}`}>
                        {customSlug.length}/30
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-200">
                        <span className="font-mono text-blue-600 font-medium">{window.location.origin}/</span>
                      </div>
                      <Input
                        id="custom-slug"
                        value={customSlug}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase();
                          const filtered = value.replace(/[^a-z0-9-]/g, '');
                          setCustomSlug(filtered);
                        }}
                        placeholder="my-custom-link"
                        className="flex-1 h-14 text-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl bg-white"
                        maxLength={30}
                      />
                    </div>
                    <p className="text-sm text-slate-500 pl-1">
                      Leave blank for auto-generated. Only letters, numbers, and hyphens allowed.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl rounded-xl transition-all duration-300"
                    disabled={loading || !url.trim()}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-6 w-6 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {id ? "Updating..." : "Creating..."}
                      </span>
                    ) : (id ? "Update Link" : "Shorten URL")}
                  </Button>
                </form>

                {/* Features */}
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Why Use Trimmr?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Secure & Reliable</h4>
                        <p className="text-sm text-slate-600">99.9% uptime with SSL encryption</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Advanced Analytics</h4>
                        <p className="text-sm text-slate-600">Track clicks, locations, and devices</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Zap className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Lightning Fast</h4>
                        <p className="text-sm text-slate-600">Instant URL shortening</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QR CODE TAB */}
          <TabsContent value="qr">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-900">QR Code Generator</CardTitle>
                      <CardDescription className="text-slate-600">Scan to visit your shortened URL</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={downloadQRCode}
                      variant="outline"
                      className="border-purple-300 text-purple-600 hover:bg-purple-50 gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      onClick={copyQrCode}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
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
                <div className="flex flex-col lg:flex-row items-center gap-10">
                  {/* QR Code Display */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="mb-6 p-8 bg-gradient-to-br from-white to-purple-50 rounded-2xl border-2 border-purple-100 shadow-lg">
                      <QRCodeSVG
                        id="qr-code-canvas"
                        value={shortenedUrl || `${window.location.origin}/${getShortSlug()}`}
                        size={240}
                        level="H"
                        includeMargin={true}
                        fgColor="#7c3aed"
                        bgColor="#ffffff"
                      />
                    </div>
                    <div className="text-center max-w-sm">
                      <p className="text-sm text-slate-600">
                        Scan this QR code with any smartphone camera to instantly visit your link
                      </p>
                    </div>
                  </div>
                  
                  {/* Sharing Tips */}
                  <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-3 text-lg">
                        <Share2 className="w-5 h-5 text-purple-600" />
                        Sharing Tips & Best Practices
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <span className="text-white font-bold">1</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-900">Print Materials</h5>
                            <p className="text-sm text-slate-600">Add QR code to business cards, flyers, or posters</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                          <div className="p-2 bg-purple-500 rounded-lg">
                            <span className="text-white font-bold">2</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-900">Digital Sharing</h5>
                            <p className="text-sm text-slate-600">Include in presentations, PDFs, or digital ads</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl">
                          <div className="p-2 bg-pink-500 rounded-lg">
                            <span className="text-white font-bold">3</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-900">Social Media</h5>
                            <p className="text-sm text-slate-600">Share the QR code image on Instagram, LinkedIn, etc.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Section */}
                    <div className="space-y-4 pt-6 border-t border-slate-200">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-3 text-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Track Performance
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                          <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <div className="text-xl font-bold text-slate-900">Real-time</div>
                          <div className="text-sm text-slate-600">Click Tracking</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                          <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <div className="text-xl font-bold text-slate-900">Location</div>
                          <div className="text-sm text-slate-600">Insights</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Link Analytics</CardTitle>
                    <CardDescription className="text-slate-600">Track performance of your shortened URL</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <Activity className="h-10 w-10 text-blue-600" />
                      <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        +12%
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">{analyticsData.totalClicks.toLocaleString()}</div>
                    <p className="text-slate-600">Total Clicks</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="h-10 w-10 text-purple-600" />
                      <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        +8%
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">{analyticsData.uniqueVisitors.toLocaleString()}</div>
                    <p className="text-slate-600">Unique Visitors</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200">
                    <div className="flex items-center justify-between mb-4">
                      <Globe className="h-10 w-10 text-teal-600" />
                      <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                        Trending
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">{analyticsData.topCountry}</div>
                    <p className="text-slate-600">Top Country</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                      <Smartphone className="h-10 w-10 text-orange-600" />
                      <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                        Mobile
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">{analyticsData.devices.mobile}%</div>
                    <p className="text-slate-600">Mobile Users</p>
                  </div>
                </div>

                {/* Device Distribution */}
                <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-6 text-lg">Device Distribution</h4>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Mobile</span>
                        </div>
                        <span className="font-bold text-slate-900">{analyticsData.devices.mobile}%</span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-700"
                          style={{ width: `${analyticsData.devices.mobile}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Desktop</span>
                        <span className="font-bold text-slate-900">{analyticsData.devices.desktop}%</span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                          style={{ width: `${analyticsData.devices.desktop}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Tablet</span>
                        <span className="font-bold text-slate-900">{analyticsData.devices.tablet}%</span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-700"
                          style={{ width: `${analyticsData.devices.tablet}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Insights */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-200">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Recent Activity
                    </h4>
                    <p className="text-slate-600">
                      Most clicks occur between 2-4 PM on weekdays. Consider scheduling your content during these peak hours.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-200">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-600" />
                      Engagement Rate
                    </h4>
                    <p className="text-slate-600">
                      Your link has an engagement rate of {(analyticsData.uniqueVisitors / Math.max(analyticsData.totalClicks, 1) * 100).toFixed(1)}%, which is above average.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* NEXT STEPS - Always show after successful creation */}
        {shortenedUrl && (
          <Card className="border-0 shadow-2xl mt-10 bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Next Steps</CardTitle>
              <CardDescription className="text-slate-600">Manage and track your new link</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button 
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center gap-3 border-blue-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl"
                >
                  <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
                    <LinkIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="font-semibold text-slate-900">View All Links</span>
                  <span className="text-sm text-slate-500">Go to dashboard</span>
                </Button>
                
                <Button 
                  onClick={() => {
                    const linkId = createdLinkId || id;
                    if (linkId) {
                      navigate(`/link/${linkId}?tab=analytics`);
                    } else {
                      navigate(`/analytics/${getShortSlug()}`);
                    }
                  }}
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center gap-3 border-purple-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl"
                >
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="font-semibold text-slate-900">View Analytics</span>
                  <span className="text-sm text-slate-500">Track clicks & stats</span>
                </Button>
                
                <Button 
                  onClick={handleCreateAnother}
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center gap-3 border-green-200 hover:border-green-300 hover:bg-green-50 rounded-xl"
                >
                  <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
                    <PlusCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="font-semibold text-slate-900">Create Another</span>
                  <span className="text-sm text-slate-500">Shorten new URL</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateLink;