import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { urlsAPI } from "@/api/urls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PlusCircle, 
  Link as LinkIcon, 
  BarChart3, 
  Clock,
  TrendingUp,
  Eye,
  Copy,
  Edit,
  Trash2,
  QrCode,
  AlertCircle,
  Zap,
  Sparkles,
  ExternalLink,
  Download,
  Users,
  Globe
} from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
    avgClicks: 0
  });

  useEffect(() => {
    fetchUserUrls();
  }, []);

  const fetchUserUrls = async () => {
    try {
      setLoading(true);
      const data = await urlsAPI.getUserUrls();
      setUrls(data);
      
      const totalClicks = data.reduce((sum, url) => sum + (url.clicks_count || 0), 0);
      const activeLinks = data.filter(url => url.is_active).length;
      
      setStats({
        totalLinks: data.length,
        totalClicks,
        activeLinks,
        avgClicks: data.length > 0 ? Math.round(totalClicks / data.length) : 0
      });
    } catch (error) {
      console.error("Error fetching URLs:", error);
      toast.error("Failed to load your URLs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUrl = async (id) => {
    if (!window.confirm("Are you sure you want to delete this URL?")) return;
    
    try {
      await urlsAPI.deleteUrl(id);
      setUrls(urls.filter(url => url.id !== id));
      toast.success("URL deleted successfully");
    } catch (error) {
      console.error("Error deleting URL:", error);
      toast.error("Failed to delete URL");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getShortUrl = (url) => {
    return `${window.location.origin}/${url.short_url}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
                  Welcome back, {user?.email?.split('@')[0] || "User"}! 👋
                </h1>
              </div>
              <p className="text-slate-600 text-lg">Manage your shortened URLs and track their performance</p>
            </div>
            <Button 
              onClick={() => navigate("/link")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-3 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusCircle className="w-5 h-5" />
              Create New Link
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Links</p>
                  <h3 className="text-3xl font-bold text-slate-900">{stats.totalLinks}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <LinkIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">All your shortened URLs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Clicks</p>
                  <h3 className="text-3xl font-bold text-slate-900">{stats.totalClicks.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">All-time clicks across all links</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Active Links</p>
                  <h3 className="text-3xl font-bold text-slate-900">{stats.activeLinks}</h3>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <div className={`w-6 h-6 rounded-full ${stats.activeLinks > 0 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">Currently active URLs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Avg. Clicks/Link</p>
                  <h3 className="text-3xl font-bold text-slate-900">{stats.avgClicks}</h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">Average clicks per URL</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card 
            className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            onClick={() => navigate("/link")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">Create Short Link</h3>
                  <p className="text-sm text-slate-600">Shorten a new URL instantly</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/link")}
                className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            onClick={() => urls.length > 0 ? navigate(`/qr/${urls[0].id}`) : navigate("/link")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">QR Codes</h3>
                  <p className="text-sm text-slate-600">
                    {urls.length > 0 ? "Generate QR codes for links" : "Create a link first"}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => urls.length > 0 ? navigate(`/qr/${urls[0].id}`) : navigate("/link")}
                className="w-full mt-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                disabled={urls.length === 0}
              >
                <QrCode className="w-4 h-4 mr-2" />
                {urls.length > 0 ? "View QR Codes" : "Create Link First"}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            onClick={() => urls.length > 0 ? navigate(`/analytics/${urls[0].id}`) : toast.info("Create a link first to view analytics")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">View Analytics</h3>
                  <p className="text-sm text-slate-600">
                    {urls.length > 0 ? "Detailed click analytics" : "No data yet"}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => urls.length > 0 ? navigate(`/analytics/${urls[0].id}`) : toast.info("Create a link first to view analytics")}
                className="w-full mt-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                disabled={urls.length === 0}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {urls.length > 0 ? "View Analytics" : "Create Link First"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* URLs List */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="border-b border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Your Links</CardTitle>
                <CardDescription className="text-slate-600">Manage and track all your shortened URLs</CardDescription>
              </div>
              <Button 
                onClick={() => navigate("/link")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2 shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                New Link
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {urls.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                  <LinkIcon className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">No URLs yet</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Create your first shortened URL to start tracking clicks and generating QR codes
                </p>
                <Button 
                  onClick={() => navigate("/link")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-3 px-8 py-6 text-lg"
                >
                  <PlusCircle className="w-5 h-5" />
                  Create Your First Link
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {urls.map((url) => (
                  <div key={url.id} className="border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg">
                            <LinkIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <a 
                              href={getShortUrl(url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline truncate text-lg block"
                            >
                              {getShortUrl(url)}
                            </a>
                            <p className="text-sm text-slate-600 truncate mt-1">{url.original_url}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm pl-11">
                          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                            <Eye className="w-3 h-3" />
                            {url.clicks_count || 0} clicks
                          </span>
                          <span className="flex items-center gap-1 text-slate-600 px-3 py-1.5">
                            <Clock className="w-3 h-3" />
                            {formatDate(url.created_at)}
                          </span>
                          {url.title && (
                            <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs">
                              {url.title}
                            </span>
                          )}
                          {!url.is_active && (
                            <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 font-medium">
                              <AlertCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => copyToClipboard(getShortUrl(url))}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/qr/${url.id}`)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Generate QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-2 ml-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/link/${url.id}/edit`)}
                            className="border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/analytics/${url.id}`)}
                            className="border-slate-300 text-slate-700 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
                          >
                            <BarChart3 className="w-3 h-3" />
                            Stats
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteUrl(url.id)}
                            className="hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          {urls.length > 0 && (
            <CardHeader className="border-t border-slate-100 pt-6 flex justify-between items-center">
              <CardDescription className="text-slate-600">
                Showing {urls.length} of {urls.length} links
              </CardDescription>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-slate-300 text-slate-700">
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="border-slate-300 text-slate-700">
                  Next
                </Button>
              </div>
            </CardHeader>
          )}
        </Card>

        {/* Recent Activity Section */}
        {urls.length > 0 && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest clicks on your URLs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {urls
                    .filter(url => url.clicks_count > 0)
                    .slice(0, 3)
                    .map((url) => (
                      <div key={url.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <LinkIcon className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{url.title || "Untitled Link"}</p>
                            <p className="text-sm text-slate-500 truncate max-w-[200px]">{getShortUrl(url)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">{url.clicks_count || 0} clicks</p>
                          <p className="text-sm text-slate-500">Last click: Today</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Get the most out of Trimmr</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white/50 border border-slate-100 rounded-xl">
                    <h4 className="font-medium text-slate-900 mb-2">💡 Customize Your Links</h4>
                    <p className="text-sm text-slate-600">Use custom slugs to make your URLs memorable and brand-friendly.</p>
                  </div>
                  <div className="p-4 bg-white/50 border border-slate-100 rounded-xl">
                    <h4 className="font-medium text-slate-900 mb-2">📊 Track Performance</h4>
                    <p className="text-sm text-slate-600">Monitor clicks, locations, and devices in the analytics dashboard.</p>
                  </div>
                  <div className="p-4 bg-white/50 border border-slate-100 rounded-xl">
                    <h4 className="font-medium text-slate-900 mb-2">📱 Generate QR Codes</h4>
                    <p className="text-sm text-slate-600">Create QR codes for easy sharing on print materials and social media.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500">
            Need help? Check our <a href="#" className="text-blue-600 hover:underline">documentation</a> or 
            contact <a href="#" className="text-blue-600 hover:underline">support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;