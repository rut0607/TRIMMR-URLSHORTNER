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
  Globe,
  Target,
  Activity,
  Shield,
  Rocket,
  ChevronRight,
  Filter,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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
  const [searchQuery, setSearchQuery] = useState("");

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

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const filteredUrls = urls.filter(url => 
    url.original_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    url.short_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (url.title && url.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block">
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
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/4 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <LinkIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user?.email?.split('@')[0] || "User"}</span>!
                  </h1>
                  <p className="text-slate-600 text-lg mt-2">Manage your shortened URLs and track their performance</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/link")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-3 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            >
              <PlusCircle className="w-6 h-6" />
              Create New Link
            </Button>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search your links by URL, slug, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white/80"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Links</p>
                  <h3 className="text-3xl font-bold text-slate-900">{stats.totalLinks}</h3>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                  <LinkIcon className="w-7 h-7 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">All your shortened URLs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-green-50 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Clicks</p>
                  <h3 className="text-3xl font-bold text-slate-900">{stats.totalClicks.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                  <BarChart3 className="w-7 h-7 text-green-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">All-time clicks across all links</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-orange-50 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Active Links</p>
                  <h3 className="text-3xl font-bold text-slate-900">{stats.activeLinks}</h3>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl">
                  <div className={`w-7 h-7 rounded-full ${stats.activeLinks > 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-slate-300'}`}></div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">Currently active URLs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-purple-50 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Avg. Clicks/Link</p>
                  <h3 className="text-3xl font-bold text-slate-900">{stats.avgClicks}</h3>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl">
                  <TrendingUp className="w-7 h-7 text-purple-600" />
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
            className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-white hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
            onClick={() => navigate("/link")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <LinkIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Create Short Link</h3>
                  <p className="text-sm text-slate-600">Shorten a new URL instantly</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/link")}
                className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 rounded-xl"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-2xl bg-gradient-to-br from-purple-50 to-white hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
            onClick={() => urls.length > 0 ? navigate(`/qr/${urls[0].id}`) : navigate("/link")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <QrCode className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">QR Codes</h3>
                  <p className="text-sm text-slate-600">
                    {urls.length > 0 ? "Generate QR codes for links" : "Create a link first"}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => urls.length > 0 ? navigate(`/qr/${urls[0].id}`) : navigate("/link")}
                className="w-full mt-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-6 rounded-xl"
                disabled={urls.length === 0}
              >
                <QrCode className="w-5 h-5 mr-2" />
                {urls.length > 0 ? "View QR Codes" : "Create Link First"}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-2xl bg-gradient-to-br from-teal-50 to-white hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
            onClick={() => urls.length > 0 ? navigate(`/analytics/${urls[0].id}`) : toast.info("Create a link first to view analytics")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">View Analytics</h3>
                  <p className="text-sm text-slate-600">
                    {urls.length > 0 ? "Detailed click analytics" : "No data yet"}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => urls.length > 0 ? navigate(`/analytics/${urls[0].id}`) : toast.info("Create a link first to view analytics")}
                className="w-full mt-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-6 rounded-xl"
                disabled={urls.length === 0}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                {urls.length > 0 ? "View Analytics" : "Create Link First"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* URLs List */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50 mb-10">
          <CardHeader className="border-b border-slate-100 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Your Links</CardTitle>
                <CardDescription className="text-slate-600">Manage and track all your shortened URLs</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                {searchQuery && (
                  <span className="text-sm text-slate-500">
                    Found {filteredUrls.length} of {urls.length} links
                  </span>
                )}
                <Button 
                  onClick={() => navigate("/link")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-3 shadow-lg rounded-xl"
                >
                  <PlusCircle className="w-5 h-5" />
                  New Link
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {urls.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-8">
                  <LinkIcon className="h-16 w-16 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">No URLs yet</h3>
                <p className="text-slate-600 mb-10 max-w-md mx-auto text-lg">
                  Create your first shortened URL to start tracking clicks and generating QR codes
                </p>
                <Button 
                  onClick={() => navigate("/link")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-4 px-10 py-7 text-xl rounded-xl"
                >
                  <PlusCircle className="w-6 h-6" />
                  Create Your First Link
                </Button>
              </div>
            ) : filteredUrls.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-slate-400 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">No links found</h3>
                <p className="text-slate-600 mb-6">Try adjusting your search terms</p>
                <Button 
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  className="border-slate-300 text-slate-700"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUrls.map((url) => (
                  <div key={url.id} className="border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300 bg-white group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl mt-1">
                            <LinkIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <a 
                              href={getShortUrl(url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-blue-600 hover:text-blue-700 hover:underline truncate text-lg block"
                            >
                              {getShortUrl(url)}
                            </a>
                            <p className="text-sm text-slate-600 truncate mt-1">{url.original_url}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm pl-14">
                          <span className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                            <Eye className="w-4 h-4" />
                            {url.clicks_count || 0} clicks
                          </span>
                          <span className="flex items-center gap-2 text-slate-600 px-4 py-2">
                            <Clock className="w-4 h-4" />
                            Created {formatTimeAgo(url.created_at)}
                          </span>
                          {url.title && (
                            <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium">
                              {url.title}
                            </span>
                          )}
                          {!url.is_active && (
                            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm flex items-center gap-2 font-semibold">
                              <AlertCircle className="w-4 h-4" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => copyToClipboard(getShortUrl(url))}
                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => navigate(`/qr/${url.id}`)}
                            className="p-3 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                            title="Generate QR Code"
                          >
                            <QrCode className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-2">
                         <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/link/${url.id}/edit`)}
                            className="border-blue-200 text-blue-600 bg-white rounded-xl"
>
                           <Edit className="w-4 h-4" />
                           Edit
                        </Button>
                          {/* Stats Button */}
                        <Button 
                         variant="outline" 
  size="sm"
  onClick={() => navigate(`/analytics/${url.id}`)}
  className="border-purple-200 text-purple-600 bg-white rounded-xl"
>
  <BarChart3 className="w-4 h-4" />
  Stats
</Button>

{/* Delete Button */}
<Button 
  variant="destructive" 
  size="sm"
  onClick={() => handleDeleteUrl(url.id)}
  className="bg-white border-red-200 text-red-600 rounded-xl"
>
  <Trash2 className="w-4 h-4" />
</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          {filteredUrls.length > 0 && (
            <CardHeader className="border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <CardDescription className="text-slate-600">
                Showing {filteredUrls.length} of {urls.length} links
              </CardDescription>
              <div className="flex gap-2">
  <Button 
    variant="outline" 
    size="sm" 
    className="border-slate-300 text-slate-700 bg-white rounded-xl"
  >
    Previous
  </Button>
  <Button 
    variant="outline" 
    size="sm" 
    className="border-slate-300 text-slate-700 bg-white rounded-xl"
  >
    Next
  </Button>
</div>
            </CardHeader>
          )}
        </Card>

        {/* Insights Section */}
        {urls.length > 0 && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Recent Activity */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-slate-900">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">Recent Activity</div>
                    <CardDescription className="text-slate-600">Latest clicks on your URLs</CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {urls
                    .filter(url => url.clicks_count > 0)
                    .slice(0, 4)
                    .map((url, index) => (
                      <div key={url.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            index === 0 ? 'bg-gradient-to-r from-blue-100 to-blue-200' :
                            index === 1 ? 'bg-gradient-to-r from-purple-100 to-purple-200' :
                            'bg-gradient-to-r from-teal-100 to-teal-200'
                          }`}>
                            <span className={`font-bold ${
                              index === 0 ? 'text-blue-600' :
                              index === 1 ? 'text-purple-600' : 'text-teal-600'
                            }`}>{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{url.title || "Untitled Link"}</p>
                            <p className="text-sm text-slate-500 truncate max-w-[200px]">{getShortUrl(url)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-lg">{url.clicks_count || 0} clicks</p>
                          <p className="text-sm text-slate-500">Last click: Today</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-slate-900">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">Quick Tips</div>
                    <CardDescription className="text-slate-600">Get the most out of Trimmr</CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <span className="text-white font-bold text-lg">💡</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Customize Your Links</h4>
                      <p className="text-sm text-slate-600">Use custom slugs to make your URLs memorable and brand-friendly.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <span className="text-white font-bold text-lg">📊</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Track Performance</h4>
                      <p className="text-sm text-slate-600">Monitor clicks, locations, and devices in the analytics dashboard.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl">
                    <div className="p-2 bg-pink-500 rounded-lg">
                      <span className="text-white font-bold text-lg">📱</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Generate QR Codes</h4>
                      <p className="text-sm text-slate-600">Create QR codes for easy sharing on print materials and social media.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Section */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50 mb-10">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900">Why Choose Trimmr?</CardTitle>
            <CardDescription className="text-slate-600">Powerful features for your link management needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Secure & Reliable</h3>
                <p className="text-slate-600">Enterprise-grade security with 99.9% uptime guarantee</p>
              </div>
              <div className="text-center p-6">
                <div className="inline-flex p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl mb-4">
                  <Rocket className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Lightning Fast</h3>
                <p className="text-slate-600">Instant URL shortening with global CDN delivery</p>
              </div>
              <div className="text-center p-6">
                <div className="inline-flex p-4 bg-gradient-to-r from-teal-100 to-teal-200 rounded-2xl mb-4">
                  <Target className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Advanced Analytics</h3>
                <p className="text-slate-600">Detailed insights into clicks, locations, and devices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-600 mb-4">
            Need help? Check our <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">documentation</a> or 
            contact <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">support</a>
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            <span>© {new Date().getFullYear()} Trimmr</span>
            <span>•</span>
            <span>Made with ❤️ for the web</span>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 hover:underline">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;