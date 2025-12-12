import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  Loader2, 
  MapPin, 
  Smartphone,
  Globe,
  BarChart3,
  Copy,
  ChevronRight
} from "lucide-react";

const RedirectLink = () => {
  const { id: shortCode } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [urlData, setUrlData] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalClicks: 0,
    lastClicked: null,
    topCountry: null,
    deviceStats: null
  });

  useEffect(() => {
    if (shortCode) {
      handleRedirect(shortCode);
    }
  }, [shortCode]);

  const getClientInfo = () => {
    const userAgent = navigator.userAgent;
    let device = "Desktop";
    let browser = "Unknown";
    let os = "Unknown";

    // Detect device
    if (/Android/.test(userAgent)) {
      device = "Mobile (Android)";
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
      device = "Mobile (iOS)";
    } else if (/Windows/.test(userAgent)) {
      device = "Desktop (Windows)";
    } else if (/Mac/.test(userAgent)) {
      device = "Desktop (Mac)";
    } else if (/Linux/.test(userAgent)) {
      device = "Desktop (Linux)";
    }

    // Detect browser
    if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
      browser = "Chrome";
    } else if (/Firefox/.test(userAgent)) {
      browser = "Firefox";
    } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
      browser = "Safari";
    } else if (/Edge/.test(userAgent)) {
      browser = "Edge";
    }

    // Detect OS
    if (/Windows/.test(userAgent)) {
      os = "Windows";
    } else if (/Mac/.test(userAgent)) {
      os = "macOS";
    } else if (/Linux/.test(userAgent)) {
      os = "Linux";
    } else if (/Android/.test(userAgent)) {
      os = "Android";
    } else if (/iOS|iPhone|iPad|iPod/.test(userAgent)) {
      os = "iOS";
    }

    return {
      device,
      browser,
      os,
      userAgent,
      referrer: document.referrer || "Direct"
    };
  };

  const trackClick = async (urlId, shortCode) => {
    try {
      const clientInfo = getClientInfo();
      
      // Insert click record
      const { error: clickError } = await supabase
        .from("clicks")
        .insert({
          url_id: urlId,
          device: clientInfo.device,
          browser: clientInfo.browser,
          os: clientInfo.os,
          user_agent: clientInfo.userAgent,
          referrer: clientInfo.referrer
        });

      if (clickError) {
        console.error("Error tracking click:", clickError);
      }

      // Update URL click count using the function
      const { error: updateError } = await supabase.rpc("increment_clicks", {
        url_id: urlId
      });

      if (updateError) {
        console.error("Error updating click count:", updateError);
      }

      // Fetch updated analytics
      await fetchAnalytics(urlId);
    } catch (err) {
      console.error("Error in tracking:", err);
    }
  };

  const fetchAnalytics = async (urlId) => {
    try {
      // Get total clicks
      const { count, error: countError } = await supabase
        .from("clicks")
        .select("*", { count: "exact", head: true })
        .eq("url_id", urlId);

      if (countError) throw countError;

      // Get last click
      const { data: lastClick, error: lastError } = await supabase
        .from("clicks")
        .select("created_at")
        .eq("url_id", urlId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (lastError && lastError.code !== "PGRST116") {
        console.error("Error fetching last click:", lastError);
      }

      // Get top country
      const { data: countryData, error: countryError } = await supabase
        .from("clicks")
        .select("country")
        .eq("url_id", urlId)
        .not("country", "is", null)
        .order("country");

      let topCountry = null;
      if (countryData && countryData.length > 0) {
        // Simple mode calculation
        const countryCounts = {};
        countryData.forEach(click => {
          countryCounts[click.country] = (countryCounts[click.country] || 0) + 1;
        });
        
        const mostFrequent = Object.keys(countryCounts).reduce((a, b) => 
          countryCounts[a] > countryCounts[b] ? a : b
        );
        topCountry = mostFrequent;
      }

      // Get device stats
      const { data: deviceData, error: deviceError } = await supabase
        .from("clicks")
        .select("device")
        .eq("url_id", urlId)
        .not("device", "is", null);

      let deviceStats = null;
      if (deviceData && deviceData.length > 0) {
        const deviceCounts = {};
        deviceData.forEach(click => {
          deviceCounts[click.device] = (deviceCounts[click.device] || 0) + 1;
        });
        deviceStats = deviceCounts;
      }

      setAnalytics({
        totalClicks: count || 0,
        lastClicked: lastClick?.created_at || null,
        topCountry: topCountry,
        deviceStats: deviceStats
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  const handleRedirect = async (code) => {
    try {
      setLoading(true);
      
      // Find the URL by short_code or custom_url
      const { data, error } = await supabase
        .from("urls")
        .select("*")
        .or(`short_url.eq.${code},custom_url.eq.${code}`)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setError("URL not found");
        } else {
          throw error;
        }
        return;
      }

      if (!data.is_active) {
        setError("This link has been disabled by its owner");
        setUrlData(data);
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError("This link has expired");
        setUrlData(data);
        return;
      }

      setUrlData(data);
      
      // Track the click
      await trackClick(data.id, code);
      
      // Start redirect countdown
      setRedirecting(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = data.original_url;
      }, 3000);
      
    } catch (err) {
      console.error("Redirect error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleManualRedirect = () => {
    if (urlData?.original_url) {
      window.location.href = urlData.original_url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <h1 className="mt-6 text-2xl font-bold text-slate-900">Loading link...</h1>
          <p className="mt-2 text-slate-600">Please wait while we process your request</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {error ? "Link Information" : "Redirecting..."}
          </h1>
          <p className="text-slate-600 mt-2">
            {error ? "Details about this shortened link" : "You're being redirected to your destination"}
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ExternalLink className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold">
                  {urlData?.title || "Shortened Link"}
                </div>
                <div className="text-sm text-slate-500 font-normal">
                  {window.location.host}/{shortCode}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Destination URL */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Destination URL</p>
                  <p className="text-sm text-slate-600 break-all">
                    {urlData?.original_url || "Unknown"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (urlData?.original_url) {
                      navigator.clipboard.writeText(urlData.original_url);
                    }
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Redirect Timer */}
            {redirecting && !error && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Redirecting in 3 seconds...</p>
                      <p className="text-sm text-blue-700">
                        You will be automatically redirected to the destination
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleManualRedirect}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Go Now
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {urlData && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Link Statistics
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Total Clicks */}
                  <div className="bg-white border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      {analytics.totalClicks + (urlData ? 1 : 0)}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">Total Clicks</div>
                  </div>

                  {/* Last Clicked */}
                  <div className="bg-white border rounded-lg p-4 text-center">
                    <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-900">
                      {analytics.lastClicked ? formatDate(analytics.lastClicked) : "First Click!"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Last Clicked</div>
                  </div>

                  {/* Top Country */}
                  <div className="bg-white border rounded-lg p-4 text-center">
                    <Globe className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-900">
                      {analytics.topCountry || "N/A"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Top Country</div>
                  </div>

                  {/* Device Stats */}
                  <div className="bg-white border rounded-lg p-4 text-center">
                    <Smartphone className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-900">
                      {analytics.deviceStats ? Object.keys(analytics.deviceStats).length : "0"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Devices</div>
                  </div>
                </div>

                {/* Device Breakdown */}
                {analytics.deviceStats && Object.keys(analytics.deviceStats).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Device Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(analytics.deviceStats).map(([device, count]) => (
                        <div key={device} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{device}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full"
                                style={{ 
                                  width: `${(count / analytics.totalClicks) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-900">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Link Details */}
            {urlData && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Link Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Created</p>
                    <p className="font-medium">{formatDate(urlData.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <p className={`font-medium ${urlData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {urlData.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  {urlData.expires_at && (
                    <div>
                      <p className="text-sm text-slate-600">Expires</p>
                      <p className="font-medium">{formatDate(urlData.expires_at)}</p>
                    </div>
                  )}
                  {urlData.user_id && (
                    <div>
                      <p className="text-sm text-slate-600">Managed by</p>
                      <p className="font-medium">Registered User</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t pt-6 flex flex-col gap-4">
            {/* Manual Redirect Button */}
            {!redirecting && urlData?.original_url && !error && (
              <Button 
                onClick={handleManualRedirect}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Destination
              </Button>
            )}

            {/* Create Your Own Link */}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">
                Want to create your own short links?
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="w-full"
              >
                Create Free Account
              </Button>
            </div>

            {/* Safety Notice */}
            <div className="text-center text-xs text-slate-500">
              <p>
                This is a secure URL shortener service. Never enter passwords or sensitive information on redirected pages.
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border text-center">
            <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-slate-900">Location Tracking</h4>
            <p className="text-sm text-slate-600">See where your clicks come from</p>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <Smartphone className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-slate-900">Device Analytics</h4>
            <p className="text-sm text-slate-600">Track mobile vs desktop usage</p>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <BarChart3 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-slate-900">Real-time Stats</h4>
            <p className="text-sm text-slate-600">Monitor performance instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedirectLink;