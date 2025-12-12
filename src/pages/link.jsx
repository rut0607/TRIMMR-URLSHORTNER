// src/pages/link.jsx - UPDATED
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase"; // Add this import
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Check, Link as LinkIcon, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Link = () => {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get URL from query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlParam = searchParams.get("url");
    
    if (urlParam) {
      setUrl(decodeURIComponent(urlParam));
    }
  }, [location.search]);

  const validateUrl = (url) => {
    try {
      // Add https:// if not present
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
    
    // Only allow alphanumeric and hyphens
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
      // Validate inputs
      const validatedUrl = validateUrl(url);
      validateCustomSlug(customSlug);
      
      if (!user) {
        throw new Error('You must be logged in to create URLs');
      }
      
      // Call Supabase RPC function create_url
      const { data, error: rpcError } = await supabase.rpc('create_url', {
        p_user_id: user.id,
        p_original_url: validatedUrl,
        p_custom_url: customSlug || null,  // Pass null if empty
        p_title: null  // You can add title field later
      });
      
      if (rpcError) {
        // Handle specific errors
        if (rpcError.message.includes('already exists')) {
          throw new Error('This custom slug is already taken. Please choose another one.');
        }
        throw new Error(rpcError.message || 'Failed to create short URL');
      }
      
      if (data) {
        const fullShortUrl = `${window.location.origin}/${data.short_url}`;
        setShortenedUrl(fullShortUrl);
        setSuccess('URL shortened successfully!');
        
        // Clear form
        setUrl("");
        setCustomSlug("");
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

  // Check if user is logged in
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
      <div className="max-w-2xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Create Short Link
                </CardTitle>
                <CardDescription>
                  Shorten any URL and make it memorable
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Success Message */}
            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleShorten} className="space-y-6">
              {/* Original URL Field */}
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

              {/* Custom Slug (Optional) */}
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
                      // Allow only alphanumeric and hyphens
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
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base font-medium"
                disabled={loading || !url.trim()}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : "Shorten URL"}
              </Button>
            </form>

            {/* Display Shortened URL */}
            {shortenedUrl && (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Your shortened URL is ready!
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <code className="flex-1 bg-white p-3 rounded-lg border border-blue-100 text-sm font-mono break-all">
                    {shortenedUrl}
                  </code>
                  <Button
                    onClick={copyToClipboard}
                    className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-white/50 rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Redirects to:</span>{" "}
                    <span className="font-mono text-gray-800 break-all">{url}</span>
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span>✓ Auto-tracked clicks</span>
                  <span>✓ QR code ready</span>
                  <span>✓ Analytics available</span>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {!shortenedUrl && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Use custom slugs for branded, memorable links</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>All links include automatic click tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>View detailed analytics in your dashboard</span>
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Link;