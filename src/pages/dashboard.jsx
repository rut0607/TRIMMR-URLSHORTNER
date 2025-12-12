import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { urlsAPI } from "@/api/urls"; // Import the API
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PlusCircle, 
  Link as LinkIcon, 
  BarChart3, 
  Users, 
  Globe, 
  Clock,
  TrendingUp,
  Eye,
  Copy,
  ExternalLink,
  Edit,
  Trash2,
  QrCode,
  AlertCircle
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
      
      // Calculate stats
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {user?.email?.split('@')[0] || "User"}! 👋</h1>
              <p className="text-blue-100">Manage your shortened URLs and track their performance</p>
            </div>
            <Button 
              onClick={() => navigate("/link")}
              className="bg-white text-blue-600 hover:bg-blue-50 gap-2 px-6 py-6 text-lg"
            >
              <PlusCircle className="w-5 h-5" />
              Create New Link
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Links</CardTitle>
              <LinkIcon className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalLinks}</div>
              <p className="text-sm text-gray-500 mt-1">All your shortened URLs</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Clicks</CardTitle>
              <BarChart3 className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalClicks}</div>
              <p className="text-sm text-gray-500 mt-1">All-time clicks across all links</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Links</CardTitle>
              <div className={`h-5 w-5 rounded-full ${stats.activeLinks > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeLinks}</div>
              <p className="text-sm text-gray-500 mt-1">Currently active URLs</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Avg. Clicks/Link</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgClicks}</div>
              <p className="text-sm text-gray-500 mt-1">Average clicks per URL</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate("/link")}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Create Short Link</h3>
                <p className="text-sm text-gray-500">Shorten a new URL instantly</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => toast.info("QR Code feature coming soon!")}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <QrCode className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">QR Codes</h3>
                <p className="text-sm text-gray-500">Generate QR codes for links</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate("/link")}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">View Analytics</h3>
                <p className="text-sm text-gray-500">Detailed click analytics</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* URLs List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Links</CardTitle>
                <CardDescription>Manage and track all your shortened URLs</CardDescription>
              </div>
              <Button 
                onClick={() => navigate("/link")}
                className="gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                New Link
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {urls.length === 0 ? (
              <div className="text-center py-12">
                <LinkIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No URLs yet</h3>
                <p className="text-gray-500 mb-6">Create your first shortened URL to get started</p>
                <Button 
                  onClick={() => navigate("/link")}
                  className="gap-2 px-6"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Your First Link
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {urls.map((url) => (
                  <div key={url.id} className="border rounded-xl p-4 hover:border-blue-300 transition-colors duration-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <LinkIcon className="w-4 h-4 text-blue-500" />
                          <a 
                            href={getShortUrl(url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-700 hover:underline truncate"
                          >
                            {getShortUrl(url)}
                          </a>
                          <button 
                            onClick={() => copyToClipboard(getShortUrl(url))}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mb-2">{url.original_url}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {url.clicks_count || 0} clicks
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(url.created_at)}
                          </span>
                          {url.title && (
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {url.title}
                            </span>
                          )}
                          {!url.is_active && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/link/${url.id}`)}
                          className="gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/link/${url.id}?tab=analytics`)}
                          className="gap-1"
                        >
                          <BarChart3 className="w-3 h-3" />
                          Stats
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteUrl(url.id)}
                          className="gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          {urls.length > 0 && (
            <CardHeader className="border-t pt-6 flex justify-between items-center">
              <CardDescription>
                Showing {urls.length} of {urls.length} links
              </CardDescription>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardHeader>
          )}
        </Card>

        {/* Recent Activity */}
        {urls.length > 0 && (
          <Card className="border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest clicks on your URLs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {urls
                  .filter(url => url.clicks_count > 0)
                  .slice(0, 3)
                  .map((url) => (
                    <div key={url.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded">
                          <LinkIcon className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">{url.title || "Untitled Link"}</p>
                          <p className="text-sm text-gray-500">{getShortUrl(url)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{url.clicks_count || 0} clicks</p>
                        <p className="text-sm text-gray-500">Last click: Today</p>
                      </div>
                    </div>
                  ))}
                {urls.filter(url => url.clicks_count > 0).length === 0 && (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No clicks yet. Share your links to see activity here!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;