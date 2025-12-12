// src/pages/Analytics.jsx - UPDATED with real data
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, TrendingUp, Users, Globe, Smartphone, 
  Calendar, MapPin, Clock, Eye, ArrowUpRight,
  Download, ChevronLeft, Link as LinkIcon
} from "lucide-react";

const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [urlData, setUrlData] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalClicks: 0,
    uniqueVisitors: 0,
    clicksToday: 0,
    clicksThisWeek: 0,
    clicksThisMonth: 0,
    topCountries: [],
    devices: { mobile: 0, desktop: 0, tablet: 0 },
    hourlyData: [],
    dailyData: []
  });

  useEffect(() => {
    if (id) {
      fetchUrlData();
      fetchAnalyticsData();
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
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch clicks data from your clicks table
      const { data: clicksData, error } = await supabase
        .from('clicks')
        .select('*')
        .eq('url_id', id);

      if (error) throw error;

      // Calculate analytics
      const totalClicks = clicksData?.length || 0;
      const uniqueVisitors = new Set(clicksData?.map(click => click.ip_address)).size;
      
      // Calculate today's clicks
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const clicksToday = clicksData?.filter(click => 
        new Date(click.created_at) >= today
      ).length || 0;

      // Calculate device distribution
      const devices = { mobile: 0, desktop: 0, tablet: 0 };
      clicksData?.forEach(click => {
        if (click.device_type === 'mobile') devices.mobile++;
        else if (click.device_type === 'desktop') devices.desktop++;
        else if (click.device_type === 'tablet') devices.tablet++;
      });

      // Calculate percentages
      const totalDeviceClicks = devices.mobile + devices.desktop + devices.tablet;
      if (totalDeviceClicks > 0) {
        devices.mobile = Math.round((devices.mobile / totalDeviceClicks) * 100);
        devices.desktop = Math.round((devices.desktop / totalDeviceClicks) * 100);
        devices.tablet = Math.round((devices.tablet / totalDeviceClicks) * 100);
      }

      // Generate hourly data (last 24 hours)
      const hourlyData = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date();
        hour.setHours(hour.getHours() - (23 - i), 0, 0, 0);
        
        const clicksInHour = clicksData?.filter(click => {
          const clickTime = new Date(click.created_at);
          return clickTime.getHours() === hour.getHours() && 
                 clickTime.getDate() === hour.getDate();
        }).length || 0;

        return {
          hour: hour.getHours(),
          time: hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }),
          clicks: clicksInHour
        };
      });

      // Generate daily data (last 7 days)
      const dailyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const clicksInDay = clicksData?.filter(click => {
          const clickTime = new Date(click.created_at);
          return clickTime >= date && clickTime < nextDay;
        }).length || 0;

        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          clicks: clicksInDay
        };
      });

      setAnalytics({
        totalClicks,
        uniqueVisitors,
        clicksToday,
        clicksThisWeek: totalClicks, // Simplified for now
        clicksThisMonth: totalClicks, // Simplified for now
        topCountries: [{ country: "Global", count: totalClicks }],
        devices,
        hourlyData,
        dailyData
      });
      
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Link Analytics</h1>
              <p className="text-gray-600">
                Real-time performance tracking for your shortened URL
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate(`/qr/${id}`)}
                variant="outline"
              >
                QR Code
              </Button>
              <Button
                onClick={() => navigate(`/link/${id}/edit`)}
                variant="outline"
              >
                Edit Link
              </Button>
            </div>
          </div>

          {/* Link Info */}
          {urlData && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <LinkIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-500">Short URL</span>
                    </div>
                    <a 
                      href={`${window.location.origin}/${urlData.short_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-mono text-blue-600 hover:underline break-all"
                    >
                      {`${window.location.origin}/${urlData.short_url}`}
                    </a>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-500 mb-1">Created</div>
                    <div className="text-gray-700">
                      {new Date(urlData.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Clicks</p>
                  <h3 className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</h3>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Unique Visitors</p>
                  <h3 className="text-2xl font-bold">{analytics.uniqueVisitors.toLocaleString()}</h3>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Clicks Today</p>
                  <h3 className="text-2xl font-bold">{analytics.clicksToday}</h3>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <h3 className="text-2xl font-bold">
                    {analytics.totalClicks > 0 
                      ? `${((analytics.uniqueVisitors / analytics.totalClicks) * 100).toFixed(1)}%` 
                      : "0%"}
                  </h3>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Device Distribution</CardTitle>
              <CardDescription>Where are your clicks coming from?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Mobile
                    </span>
                    <span>{analytics.devices.mobile}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500" 
                      style={{ width: `${analytics.devices.mobile}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Desktop</span>
                    <span>{analytics.devices.desktop}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500" 
                      style={{ width: `${analytics.devices.desktop}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tablet</span>
                    <span>{analytics.devices.tablet}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-500" 
                      style={{ width: `${analytics.devices.tablet}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Clicks Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Last 7 Days</CardTitle>
              <CardDescription>Daily click distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end h-48 gap-2">
                {analytics.dailyData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-8 bg-blue-500 rounded-t transition-all duration-500"
                      style={{ 
                        height: `${Math.max(10, (day.clicks / Math.max(...analytics.dailyData.map(d => d.clicks), 1)) * 100)}%` 
                      }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      {day.date.split(' ')[0]}
                    </div>
                    <div className="text-xs font-semibold mt-1">{day.clicks}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Activity */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>24-Hour Activity</CardTitle>
            <CardDescription>Clicks by hour (last 24 hours)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="flex gap-4 min-w-max">
                {analytics.hourlyData.map((hour, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-2">{hour.time}</div>
                    <div 
                      className="w-6 bg-blue-500 rounded-t transition-all duration-500"
                      style={{ 
                        height: `${Math.max(10, (hour.clicks / Math.max(...analytics.hourlyData.map(h => h.clicks), 1)) * 80)}px` 
                      }}
                    ></div>
                    <div className="text-xs font-semibold mt-2">{hour.clicks}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;