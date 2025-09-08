import { onCleanup } from "solid-js";

interface TikTokData {
  status: string | null;
  result: {
    type: string | null;
    author: {
      avatar: string | null;
      nickname: string | null;
    } | null;
    desc: string | null;
    videoSD: string | null;
    videoHD: string | null;
    video_hd: string | null;
    videoWatermark: string | null;
    music: string | null;
    uploadDate?: string | null;
  } | null;
}

interface ResultSectionProps {
  data: TikTokData;
  onReset: () => void;
}

function ResultSection({ data, onReset }: ResultSectionProps) {
  
  // Load Google AdSense ad
  const loadGoogleAd = () => {
    try {
      console.log("=== ADSENSE DEBUG ===");
      console.log("Loading Google AdSense...");
      
      // Check if AdSense script is already loaded
      let adsenseScript = document.querySelector('script[src*="adsbygoogle.js"]');
      
      if (!adsenseScript) {
        console.log("AdSense script not found, loading...");
        adsenseScript = document.createElement('script');
        adsenseScript.async = true;
        adsenseScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4342939946293194";
        adsenseScript.crossOrigin = "anonymous";
        
        adsenseScript.onload = () => {
          console.log("AdSense script loaded successfully");
          initializeAd();
        };
        
        adsenseScript.onerror = () => {
          console.error("Failed to load AdSense script");
          showAdPlaceholder();
        };
        
        document.head.appendChild(adsenseScript);
      } else {
        console.log("AdSense script already loaded");
        initializeAd();
      }
    } catch (error) {
      console.error("AdSense loading error:", error);
      showAdPlaceholder();
    }
  };

  // Initialize the AdSense ad
  const initializeAd = () => {
    setTimeout(() => {
      try {
        console.log("Initializing AdSense ad...");
        
        // Check if adsbygoogle is available
        if (typeof window.adsbygoogle !== 'undefined') {
          console.log("adsbygoogle is available, pushing ad...");
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log("AdSense ad pushed successfully");
        } else {
          console.error("adsbygoogle not available");
          showAdPlaceholder();
        }
      } catch (e) {
        console.error("AdSense initialization error:", e);
        showAdPlaceholder();
      }
    }, 1000); // Longer delay to ensure DOM is ready
  };

  // Show placeholder when AdSense fails
  const showAdPlaceholder = () => {
    const adContainer = document.querySelector('.adsense-container');
    if (adContainer) {
      adContainer.innerHTML = `
        <div style="width:336px;height:280px;background:#f8f9fa;display:flex;align-items:center;justify-content:center;border:2px dashed #dee2e6;border-radius:8px;">
          <div style="text-align:center;color:#6c757d;padding:20px;">
            <p style="margin:0;font-size:14px;font-weight:500;">Advertisement Space</p>
            <p style="margin:5px 0 0;font-size:12px;">Configure AdSense to display ads</p>
          </div>
        </div>
      `;
    }
  };

  // Load ads when component mounts
  loadGoogleAd();

  onCleanup(() => {
    // Cleanup AdSense related resources if needed
    const adsenseScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (adsenseScript) {
      adsenseScript.remove();
    }
  });

  const getVideoUrl = () => {
    const result = data?.result;
    return result?.videoSD || result?.videoHD || result?.video_hd || result?.videoWatermark || result?.music || "";
  };

  const getAuthorInfo = () => {
    const author = data?.result?.author;
    return {
      avatar: author?.avatar || "",
      nickname: author?.nickname || "Unknown Author"
    };
  };

  // Helper to get safe filename for downloads
  const getSafeFilename = () => {
    const author = getAuthorInfo().nickname;
    return author.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  };

  return (
    <div class="max-w-6xl mx-auto mt-8 px-4">
      
      {/* Results Section */}
      <div class="mt-4 max-w-6xl mx-auto">
        <div class="bg-white rounded overflow-hidden backdrop-blur-sm border border-white/10 p-4">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="md:w-1/3 flex-shrink-0">
              <div class="relative rounded-lg overflow-hidden max-h-[430px]">
                {getVideoUrl() && (
                  <video 
                    controls 
                    src={getVideoUrl()} 
                    class="w-full h-full object-cover" 
                    referrerpolicy="no-referrer"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>

            <div class="md:w-2/3 flex flex-col justify-between">
              <div class="mb-3">
                <div class="flex items-center gap-3 justify-between mb-1">
                  {getAuthorInfo().avatar && (
                    <img 
                      src={getAuthorInfo().avatar}
                      alt={getAuthorInfo().nickname}
                      class="rounded-full w-24 h-24"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                    {getAuthorInfo().nickname}
                  </h2>
                  <div class="text-gray-400 text-xs px-2 py-1 bg-white/10 rounded-full"></div>
                </div>
                <div class="text-gray-900 text-sm mb-2">
                  {data?.result?.desc || "No description available"}
                </div>
                
                {/* Google AdSense Ad Container */}
                <div class="flex justify-center my-4">
                  <div class="adsense-container" style="width:336px;margin:0 auto;">
                    {/* AdSense Ad Unit */}
                    <ins class="adsbygoogle"
                         style="display:block;width:336px;height:280px"
                         data-ad-client="ca-pub-4342939946293194"
                         data-ad-slot="6558620513"
                         data-ad-format="rectangle"
                         data-full-width-responsive="false"></ins>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                {data?.result?.videoSD && (
                  <button class="download-button bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 w-full p-3 rounded-lg text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg> 
                    <a href={`https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent(data!.result!.videoSD!)}&type=.mp4&title=${getSafeFilename()}`} class="text-white no-underline">
                      Download SD (No Watermark)
                    </a>
                  </button>
                )}

                {(data?.result?.videoHD || data?.result?.video_hd) && (
                  <button class="download-button bg-gradient-to-r from-pink-600 to-pink-400 hover:from-pink-500 hover:to-pink-300 w-full p-3 rounded-lg text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg> 
                    <a href={`https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent((data!.result!.videoHD || data!.result!.video_hd)!)}&type=.mp4&title=${getSafeFilename()}`} class="text-white no-underline">
                      Download HD (No Watermark)
                    </a>
                  </button>
                )}

                {data?.result?.videoWatermark && (
                  <button class="download-button bg-gradient-to-r from-green-600 to-green-400 hover:from-green-500 hover:to-green-300 w-full p-3 rounded-lg text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                    </svg> 
                    <a href={`https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent(data!.result!.videoWatermark!)}&type=.mp4&title=${getSafeFilename()}`} class="text-white no-underline">
                      Download (With Watermark)
                    </a>
                  </button>
                )}

                {data?.result?.music && (
                  <button class="download-button bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 w-full p-3 rounded-lg text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                    </svg> 
                    <a href={`https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent(data!.result!.music!)}&type=.mp3&title=${getSafeFilename()}_audio`} class="text-white no-underline">
                      Download Audio Only
                    </a>
                  </button>
                )}

                <button 
                  onClick={onReset}
                  class="download-button bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 w-full p-3 rounded-lg text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Download Another Video
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultSection;