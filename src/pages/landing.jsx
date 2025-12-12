import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// shadcn components
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const Landing = () => {
  const [longUrl, setLongUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
  e.preventDefault();
  if (!longUrl.trim()) return;
  // Redirect to login page with the URL to shorten
  navigate(`/login?createNew=${encodeURIComponent(longUrl)}`);
};

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center px-4">
      <h2 className="my-10 sm:my-16 text-3xl sm:text-6xl lg:text-7xl text-white text-center font-extrabold">
        The only URL shortener you will ever need!
      </h2>

      {/* --- SHORTEN URL FORM --- */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl flex flex-col sm:flex-row gap-3"
      >
        <Input
          type="url"
          value={longUrl}
          placeholder="Paste your loooooong URL here..."
          className="flex-1 py-4 px-7 h-full"
          onChange={(e) => setLongUrl(e.target.value)}
          required
        />

        <Button
          type="submit"
          className="w-full sm:w-auto h-full py-4 px-5 active:scale-[0.98] transition-transform"
          variant="destructive"
        >
          Shorten URL
        </Button>
      </form>

      <img src="/banner.png" alt="banner" className="w-full my-11 md:px-10" />

      {/* --- SIMPLE FAQ SECTION --- */}
      <div className="w-full max-w-3xl mt-8 px-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-2">
                Do I need an account to use the app?
              </h4>
              <p className="text-sm text-slate-300">
                Yes. Creating an account allows you to manage your URLs, view
                analytics, and customize your short URLs.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">
                What analytics are available for my shortened URLs?
              </h4>
              <p className="text-sm text-slate-300">
                You can view the number of clicks, geolocation data of the clicks,
                and device types for each of your shortened URLs.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">
                Is there a limit to how many URLs I can shorten?
              </h4>
              <p className="text-sm text-slate-300">
                Free plan allows 100 URLs. Upgrade for more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;