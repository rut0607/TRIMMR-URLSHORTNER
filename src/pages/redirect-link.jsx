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
  ChevronRight,
  Zap,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles
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

    if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
      browser = "Chrome";
    } else if (/Firefox/.test(userAgent)) {
      browser = "Firefox";
    } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
      browser = "Safari";
    } else if (/Edge/.test(userAgent)) {
      browser = "Edge";
    }

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

      const { error: updateError } = await supabase.rpc("increment_clicks", {
        url_id: urlId
      });

      if (updateError) {
        console.error("Error updating click count:", updateError);
      }

      await fetchAnalytics(urlId);
    } catch (err) {
      console.error("Error in tracking:", err);
    }
  };

  const fetchAnalytics = async (urlId) => {
    try {
      const { count, error: countError } = await supabase
        .from("clicks")
        .select("*", { count: "exact", head: true })
        .eq("url_id", urlId);

      if (countError) throw countError;

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

      const { data: countryData, error: countryError } = await supabase
        .from("clicks")
        .select("country")
        .eq("url_id", urlId)
        .not("country", "is", null)
        .order("country");

      let topCountry = null;
      if (countryData && countryData.length > 0) {
        const countryCounts = {};
        countryData.forEach(click => {
          countryCounts[click.country] = (countryCounts[click.country] || 0) + 1;
        });
        
        const mostFrequent = Object.keys(countryCounts).reduce((a, b) => 
          countryCounts[a] > countryCounts[b] ? a : b
        );
        topCountry = mostFrequent;
      }

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
      
      await trackClick(data.id, code);
      
      setRedirecting(true);
      
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 border-4 border-blue-200 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Processing Your Link</h1>
          <p className="text-slate-600 max-w-md mx-auto">Please wait while we securely process your redirect request</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-6 lg:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <ExternalLink className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              {error ? "Link Information" : "Redirecting..."}
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {error ? "Details about this shortened link" : "You're being securely redirected to your destination"}
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50 mb-10">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <ExternalLink className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-slate-900">
                  {urlData?.title || "Shortened Link"}
                </div>
                <div className="text-sm text-slate-500 font-normal">
                  {window.location.host}/{shortCode}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-gradient-to-r from-red-50 to-red-100">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
                </div>
              </Alert>
            )}

            {/* Destination URL */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Destination URL
                  </p>
                  <p className="text-sm text-slate-600 break-all font-mono bg-white/50 p-3 rounded-lg">
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
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 rounded-xl"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Redirect Timer */}
            {redirecting && !error && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-green-900 text-lg">Redirecting in 3 seconds...</p>
                      <p className="text-sm text-green-700">
                        You will be automatically redirected to the destination
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleManualRedirect}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-3 rounded-xl"
                  >
                    Go Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {urlData && (
              <div className="border-t pt-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  Link Statistics
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {/* Total Clicks */}
                  <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-2xl p-5 text-center hover:shadow-lg transition-shadow">
                    <div className="text-3xl font-bold text-slate-900 mb-2">
                      {analytics.totalClicks + (urlData ? 1 : 0)}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">Total Clicks</div>
                  </div>

                  {/* Last Clicked */}
                  <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-2xl p-5 text-center hover:shadow-lg transition-shadow">
                    <Clock className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                    <div className="text-sm font-medium text-slate-900">
                      {analytics.lastClicked ? formatDate(analytics.lastClicked) : "First Click!"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Last Clicked</div>
                  </div>

                  {/* Top Country */}
                  <div className="bg-gradient-to-br from-white to-teal-50 border border-teal-200 rounded-2xl p-5 text-center hover:shadow-lg transition-shadow">
                    <Globe className="w-8 h-8 text-teal-500 mx-auto mb-3" />
                    <div className="text-sm font-bold text-slate-900">
                      {analytics.topCountry || "N/A"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Top Country</div>
                  </div>

                  {/* Device Stats */}
                  <div className="bg-gradient-to-br from-white to-orange-50 border border-orange-200 rounded-2xl p-5 text-center hover:shadow-lg transition-shadow">
                    <Smartphone className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                    <div className="text-sm font-bold text-slate-900">
                      {analytics.deviceStats ? Object.keys(analytics.deviceStats).length : "0"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Devices</div>
                  </div>
                </div>

                {/* Device Breakdown */}
                {analytics.deviceStats && Object.keys(analytics.deviceStats).length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Device Breakdown
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(analytics.deviceStats).map(([device, count]) => (
                        <div key={device} className="flex items-center justify-between p-4 bg-white/80 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                          <span className="text-sm font-medium text-slate-700">{device}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                                style={{ 
                                  width: `${(count / analytics.totalClicks) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-bold text-slate-900 min-w-8 text-right">{count}</span>
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
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Link Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-2xl border border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">Created</p>
                    <p className="font-semibold text-slate-900">{formatDate(urlData.created_at)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-2xl border border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">Status</p>
                    <p className={`font-semibold ${urlData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {urlData.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  {urlData.expires_at && (
                    <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-2xl border border-slate-200">
                      <p className="text-sm text-slate-600 mb-2">Expires</p>
                      <p className="font-semibold text-slate-900">{formatDate(urlData.expires_at)}</p>
                    </div>
                  )}
                  {urlData.user_id && (
                    <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-2xl border border-slate-200">
                      <p className="text-sm text-slate-600 mb-2">Managed by</p>
                      <p className="font-semibold text-blue-600">Registered User</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Information */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Security Notice</h4>
                  <p className="text-sm text-slate-600">
                    This is a secure URL shortener service. Never enter passwords or sensitive information on redirected pages.
                    All links are scanned for security threats before redirection.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t pt-8 flex flex-col gap-6">
            {/* Manual Redirect Button */}
            {!redirecting && urlData?.original_url && !error && (
              <Button 
                onClick={handleManualRedirect}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-3 py-7 text-lg rounded-xl"
              >
                <ExternalLink className="w-6 h-6" />
                Go to Destination
              </Button>
            )}

            {/* Create Your Own Link */}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">
                Want to create your own short links with analytics?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/")}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 rounded-xl"
                >
                  Try for Free
                </Button>
                <Button 
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl border border-blue-200 text-center hover:shadow-xl transition-shadow">
            <div className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl mb-4">
              <MapPin className="w-7 h-7 text-blue-600" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Location Tracking</h4>
            <p className="text-sm text-slate-600">See where your clicks come from in real-time</p>
          </div>
          <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-2xl border border-green-200 text-center hover:shadow-xl transition-shadow">
            <div className="inline-flex p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl mb-4">
              <Smartphone className="w-7 h-7 text-green-600" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Device Analytics</h4>
            <p className="text-sm text-slate-600">Track mobile vs desktop usage patterns</p>
          </div>
          <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-2xl border border-purple-200 text-center hover:shadow-xl transition-shadow">
            <div className="inline-flex p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl mb-4">
              <TrendingUp className="w-7 h-7 text-purple-600" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Real-time Stats</h4>
            <p className="text-sm text-slate-600">Monitor performance instantly with live updates</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex p-4 bg-white/20 rounded-2xl mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Create Your Own Short Links</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands of users who trust Trimmr for secure URL shortening and powerful analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/")}
                className="bg-white text-blue-600 hover:bg-blue-50 gap-3 px-8 py-6 text-lg rounded-xl"
              >
                <Sparkles className="w-5 h-5" />
                Try for Free
              </Button>
              <Button 
                onClick={() => navigate("/signup")}
                variant="outline"
                className="border-white text-white hover:bg-white/20 gap-3 px-8 py-6 text-lg rounded-xl"
              >
                <Users className="w-5 h-5" />
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedirectLink;