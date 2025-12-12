// src/pages/EditLink.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LinkIcon, Sparkles, AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EditLink = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (id) {
      fetchUrlData(id);
    }
  }, [id]);

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
      }
    } catch (err) {
      console.error("Error fetching URL data:", err);
      setError("Failed to load URL data");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const validatedUrl = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : 'https://' + url;
      
      new URL(validatedUrl);
      
      const { error: updateError } = await supabase
        .from('urls')
        .update({ 
          original_url: validatedUrl,
          short_url: customSlug || undefined
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      setSuccess('URL updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error("Error updating URL:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
              <Button onClick={() => navigate('/login')} className="w-full">
                Log In
              </Button>
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
                  Edit Link
                </CardTitle>
                <CardDescription>
                  Update your shortened URL
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

            <form onSubmit={handleUpdate} className="space-y-6">
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
                  Enter the full URL you want to redirect to
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom-slug">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Custom Slug</span>
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
                  Only letters, numbers, and hyphens allowed.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base font-medium shadow-lg"
                  disabled={loading || !url.trim()}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : "Update Link"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditLink;