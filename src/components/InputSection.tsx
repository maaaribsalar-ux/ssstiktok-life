import { toast } from "solid-toast";
import { createSignal } from "solid-js";

interface InputSectionProps {
  onDataFetched: (data: any) => void;
}

function InputSection({ onDataFetched }: InputSectionProps) {
  const [url, setUrl] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [autoProcessing, setAutoProcessing] = createSignal(false);

  // Function to extract TikTok URL from text that might contain promotional content
  const extractTikTokUrl = (text: string): string => {
    // Common TikTok URL patterns - updated to handle query parameters and new formats
    const patterns = [
      // Standard tiktok.com URLs with or without query parameters
      /https?:\/\/(?:www\.)?tiktok\.com\/@[^\/\s]*\/video\/\d+[^\s]*/g,
      // TikTok short URLs with /t/ format
      /https?:\/\/(?:www\.)?tiktok\.com\/t\/[A-Za-z0-9]+[^\s]*/g,
      // vm.tiktok.com with short codes
      /https?:\/\/vm\.tiktok\.com\/[A-Za-z0-9]+[^\s]*/g,
      // vm.tiktok.com with numeric IDs
      /https?:\/\/vm\.tiktok\.com\/\d+[^\s]*/g,
      // vt.tiktok.com
      /https?:\/\/vt\.tiktok\.com\/[A-Za-z0-9]+[^\s]*/g,
      // Mobile tiktok URLs
      /https?:\/\/m\.tiktok\.com\/v\/\d+\.html[^\s]*/g,
      // Any tiktok.com URL (fallback)
      /https?:\/\/[^\/]*tiktok\.com\/[^\s]*/g
    ];

    console.log("Extracting URL from text:", text);
    
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        // Return the first match, clean it up
        let url = matches[0];
        // Remove trailing punctuation that might be part of the sentence
        url = url.replace(/[.,!?;]+$/, '');
        console.log("Extracted URL:", url);
        return url;
      }
    }

    // If no pattern matches, check if the text itself is a clean URL
    const cleanText = text.trim();
    if (isValidTikTokUrl(cleanText)) {
      return cleanText;
    }

    return text; // Return original if no URL found
  };

  // Function to validate TikTok URL
  const isValidTikTokUrl = (url: string): boolean => {
    const tikTokPatterns = [
      /tiktok\.com/,
      /douyin/,
      /vm\.tiktok\.com/,
      /vt\.tiktok\.com/,
      /m\.tiktok\.com/
    ];
    
    return tikTokPatterns.some(pattern => pattern.test(url));
  };

  // Function to suggest URL format fixes
  const suggestUrlFix = (url: string): string => {
    if (url.includes('tiktok') && !url.startsWith('http')) {
      return 'https://' + url;
    }
    return url;
  };

  // Function to clean and format URL for better success rate
  const cleanTikTokUrl = (url: string): string => {
    let cleanUrl = url.trim();
    
    // First extract the TikTok URL if text contains promotional content
    cleanUrl = extractTikTokUrl(cleanUrl);
    
    // Remove all query parameters and fragments from desktop/laptop TikTok URLs
    // Handle parameters like: ?is_from_webapp=1&sender_device=pc&web_id=123456
    if (cleanUrl.includes('?')) {
      cleanUrl = cleanUrl.split('?')[0];
      console.log("Removed query parameters, clean URL:", cleanUrl);
    }
    
    // Remove URL fragments (# and everything after)
    if (cleanUrl.includes('#')) {
      cleanUrl = cleanUrl.split('#')[0];
      console.log("Removed fragments, clean URL:", cleanUrl);
    }
    
    // Ensure we have https protocol
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    // Remove any trailing slashes that might cause issues
    cleanUrl = cleanUrl.replace(/\/+$/, '');
    
    console.log("Final cleaned URL:", cleanUrl);
    return cleanUrl;
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const tiktokUrl = url().trim();
      console.log("=== FRONTEND DEBUG ===");
      console.log("1. Original URL:", tiktokUrl);
      
      if (!tiktokUrl) {
        throw new Error("Please enter a TikTok URL");
      }

      if (!isValidTikTokUrl(tiktokUrl)) {
        const suggestedUrl = suggestUrlFix(tiktokUrl);
        if (suggestedUrl !== tiktokUrl) {
          setUrl(suggestedUrl);
          throw new Error(`Invalid TikTok URL. Try: ${suggestedUrl}`);
        } else {
          throw new Error("Please enter a valid TikTok URL (tiktok.com, vm.tiktok.com, etc.)");
        }
      }
      
      console.log("2. Encoded URL:", encodeURIComponent(tiktokUrl));
      
      const apiUrl = `/api/tik.json?url=${encodeURIComponent(tiktokUrl)}`;
      console.log("3. Final API URL:", apiUrl);
      
      let res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("4. Response status:", res.status);
      console.log("5. Response URL:", res.url);
      
      let json = await res.json();
      
      console.log("6. FULL API RESPONSE:");
      console.log(JSON.stringify(json, null, 2));
      
      if (json.debug) {
        console.log("7. DEBUG INFO FROM SERVER:");
        console.log(JSON.stringify(json.debug, null, 2));
      }
      
      if (!res.ok) {
        // More specific error messages based on status
        if (res.status === 400) {
          throw new Error(json.error || 'Invalid request. Please check your TikTok URL.');
        } else if (res.status === 404) {
          throw new Error('Video not found. The video might have been deleted or is private.');
        } else if (res.status === 500) {
          throw new Error('Server error. Please try again in a moment.');
        } else {
          throw new Error(`HTTP error! status: ${res.status} - ${json.error || 'Unknown error'}`);
        }
      }
      
      if (json.status === "error" || json.error) {
        throw new Error(json.error || json.message || "Failed to fetch video data");
      }

      if (!json.result) {
        throw new Error("No video data found. The video might be private or restricted.");
      }

      // Check if we have any downloadable content
      const hasVideo = json.result.videoSD || json.result.videoHD || json.result.video_hd || json.result.videoWatermark;
      const hasAudio = json.result.music;
      
      if (!hasVideo && !hasAudio) {
        throw new Error("No downloadable content found. The video might be protected or unavailable.");
      }

      // Pass data to parent component instead of setting local state
      onDataFetched(json);
      setError("");
      
      toast.success("Video loaded successfully!", {
        duration: 2000,
        position: "bottom-center",
        style: {
          "font-size": "16px",
        },
      });
      
    } catch (error) {
      console.error("=== FETCH ERROR ===", error);
      
      let errorMessage = error.message || "An error occurred while fetching data";
      
      // Provide helpful suggestions based on error type
      if (errorMessage.includes("Invalid TikTok URL")) {
        errorMessage += "\n\nSupported formats:\n• https://www.tiktok.com/@username/video/123456789\n• https://vm.tiktok.com/shortcode/\n• https://m.tiktok.com/v/123456789.html";
      } else if (errorMessage.includes("private") || errorMessage.includes("restricted")) {
        errorMessage += "\n\nTip: Try copying the URL directly from the TikTok app or website.";
      } else if (errorMessage.includes("not found")) {
        errorMessage += "\n\nThe video might have been deleted or the URL is incorrect.";
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        position: "bottom-center",
        style: {
          "font-size": "16px",
          "max-width": "400px",
          "white-space": "pre-line",
        },
      });
      
      setError(error.message);
    }
    setLoading(false);
  };

  const handlePaste = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'clipboard-read' as any });
      if (permission.state === 'granted' || permission.state === 'prompt') {
        const text = await navigator.clipboard.readText();
        console.log("=== PASTE PROCESSING ===");
        console.log("Pasted raw text:", text);
        console.log("Text length:", text.length);
        
        // Extract and clean the TikTok URL from the pasted text
        const extractedUrl = extractTikTokUrl(text);
        const cleanedUrl = cleanTikTokUrl(extractedUrl);
        
        console.log("Extracted URL:", extractedUrl);
        console.log("Cleaned URL:", cleanedUrl);
        console.log("URL length:", cleanedUrl.length);
        
        setUrl(cleanedUrl);
        
        // Auto-validate pasted URL and provide feedback
        if (cleanedUrl && isValidTikTokUrl(cleanedUrl)) {
          // Enhanced detection for promotional content
          const isPromotionalContent = (
            text.length > cleanedUrl.length + 15 && // More than just URL + small buffer
            (
              text.toLowerCase().includes('tiktok lite') ||
              text.toLowerCase().includes('download tiktok') ||
              text.toLowerCase().includes('shared via') ||
              text.toLowerCase().includes('this post is') ||
              text.includes('://www.tiktok.com/tiktoklite') ||
              text.split(' ').length > 8 // More than 8 words suggests promotional text
            )
          );
          
          console.log("Is promotional content:", isPromotionalContent);
          console.log("Content indicators:", {
            lengthDiff: text.length - cleanedUrl.length,
            hasTikTokLite: text.toLowerCase().includes('tiktok lite'),
            hasDownloadTikTok: text.toLowerCase().includes('download tiktok'),
            hasSharedVia: text.toLowerCase().includes('shared via'),
            wordCount: text.split(' ').length
          });
          
          if (isPromotionalContent) {
            console.log("Auto-processing promotional content...");
            setAutoProcessing(true);
            
            toast.success("TikTok URL extracted! Starting download automatically...", {
              duration: 2500,
              position: "bottom-center",
              style: {
                "font-size": "14px",
              },
            });
            
            // Auto-start processing for promotional content
            setTimeout(() => {
              console.log("Executing auto fetchData...");
              fetchData();
            }, 1200); // Slightly longer delay to ensure UI updates
            
          } else {
            console.log("Direct URL pasted, no auto-processing");
            toast.success("Valid TikTok URL pasted! Click Download to process.", {
              duration: 1500,
              position: "bottom-center",
            });
          }
        } else if (text && text.includes('tiktok')) {
          toast.error("Could not extract a valid TikTok URL from the pasted content.", {
            duration: 2500,
            position: "bottom-center",
          });
        }
      }
    } catch (err) {
      console.error("Paste error:", err);
      toast.error("Clipboard access denied");
    }
  };

  // Function to cancel auto-processing
  const cancelAutoProcessing = () => {
    setAutoProcessing(false);
    toast.info("Auto-processing cancelled", {
      duration: 1000,
      position: "bottom-center",
    });
  };

  return (
    <div class="max-w-6xl mx-auto mt-8 px-4">
      {/* Enhanced Input Form Section */}
      <div class="max-w-6xl mx-auto">
        <div class="download-box rounded-2xl">
          <div class="bg-pink-50 rounded backdrop-blur-md p-2">
            <form class="flex flex-col md:flex-row items-stretch md:items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                
                // Don't start manual processing if auto-processing is happening
                if (autoProcessing()) {
                  toast.info("Auto-processing in progress...", {
                    duration: 1000,
                    position: "bottom-center",
                  });
                  return;
                }
                
                const currentUrl = url().trim();
                console.log("=== FORM SUBMISSION ===");
                console.log("Form submission - URL value:", currentUrl);
                
                // Auto-extract URL if the input contains promotional text
                if (currentUrl && currentUrl.length > 100 && currentUrl.includes('tiktok')) {
                  const extractedUrl = extractTikTokUrl(currentUrl);
                  if (extractedUrl !== currentUrl) {
                    setUrl(extractedUrl);
                    toast.info("Extracted TikTok URL from shared content", {
                      duration: 1500,
                      position: "bottom-center",
                    });
                    // Small delay to let user see the extraction
                    setTimeout(() => fetchData(), 500);
                    return;
                  }
                }
                
                fetchData();
              }}
            >
              <div class="relative flex-grow rounded bg-white">
                <input type="text"
                  value={url()}
                  onInput={(e) => {
                    const newUrl = e.currentTarget.value;
                    console.log("Input changed:", newUrl);
                    setUrl(newUrl);
                    
                    // Clear previous error when user starts typing
                    if (error()) {
                      setError("");
                    }

                    // Auto-detect and process promotional content when typing/pasting into input
                    if (newUrl && newUrl.length > 50 && newUrl.includes('tiktok')) {
                      const extractedUrl = extractTikTokUrl(newUrl);
                      const cleanedUrl = cleanTikTokUrl(extractedUrl);
                      
                      // Check if this looks like promotional content
                      const isPromotionalContent = (
                        newUrl.length > cleanedUrl.length + 15 &&
                        (
                          newUrl.toLowerCase().includes('tiktok lite') ||
                          newUrl.toLowerCase().includes('download tiktok') ||
                          newUrl.toLowerCase().includes('shared via') ||
                          newUrl.toLowerCase().includes('this post is') ||
                          newUrl.includes('://www.tiktok.com/tiktoklite') ||
                          newUrl.split(' ').length > 8
                        )
                      );

                      if (isPromotionalContent && cleanedUrl !== newUrl) {
                        console.log("Auto-processing detected in input field");
                        setUrl(cleanedUrl);
                        setAutoProcessing(true);
                        
                        toast.success("TikTok URL extracted! Starting download automatically...", {
                          duration: 2500,
                          position: "bottom-center",
                        });
                        
                        // Auto-process after short delay
                        setTimeout(() => {
                          fetchData();
                        }, 1200);
                      }
                    }
                  }}
                  onPaste={(e) => {
                    // Handle paste event directly in the input field
                    setTimeout(() => {
                      const pastedText = e.currentTarget.value;
                      console.log("Direct paste in input:", pastedText);
                      
                      if (pastedText && pastedText.length > 50) {
                        const extractedUrl = extractTikTokUrl(pastedText);
                        const cleanedUrl = cleanTikTokUrl(extractedUrl);
                        
                        const isPromotionalContent = (
                          pastedText.length > cleanedUrl.length + 15 &&
                          (
                            pastedText.toLowerCase().includes('tiktok lite') ||
                            pastedText.toLowerCase().includes('download tiktok') ||
                            pastedText.toLowerCase().includes('shared via') ||
                            pastedText.toLowerCase().includes('this post is') ||
                            pastedText.includes('://www.tiktok.com/tiktoklite') ||
                            pastedText.split(' ').length > 8
                          )
                        );

                        if (isPromotionalContent && cleanedUrl !== pastedText) {
                          console.log("Auto-processing pasted promotional content");
                          setUrl(cleanedUrl);
                          setAutoProcessing(true);
                          
                          toast.success("TikTok URL extracted! Starting download automatically...", {
                            duration: 2500,
                            position: "bottom-center",
                          });
                          
                          setTimeout(() => {
                            fetchData();
                          }, 1200);
                        }
                      }
                    }, 100); // Small delay to let paste complete
                  }}
                  placeholder="Paste TikTok video link or shared content here (we'll extract the URL automatically)"
                  class="w-full h-14 border-gray-700 text-black rounded-xl px-5 pr-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                />
                <button type="button" 
                  onClick={handlePaste} 
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-700/80 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 112 2h2a2 2 0 012-2"></path>
                  </svg>
                  Paste
                </button>
              </div>
              <button type="submit" 
                disabled={loading() || autoProcessing()}
                class="h-14 px-8 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:from-gray-500 disabled:to-gray-400 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed">
                {loading() ? (
                  <>
                    <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Processing...
                  </>
                ) : autoProcessing() ? (
                  <>
                    <svg class="animate-pulse h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="3"/>
                      <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>
                    </svg>
                    Auto-starting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg> 
                    Download
                  </>
                )}
              </button>
            </form>
            
            {/* Auto-processing indicator with cancel option */}
            {autoProcessing() && (
              <div class="mt-3 p-3 bg-blue-100 border border-blue-300 rounded-lg flex items-center justify-between">
                <div class="flex items-center gap-2 text-blue-700">
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8v8z"/>
                  </svg>
                  <span class="text-sm font-medium">Auto-processing extracted URL...</span>
                </div>
                <button 
                  onClick={cancelAutoProcessing}
                  class="text-blue-600 hover:text-blue-800 text-sm underline transition-colors">
                  Cancel
                </button>
              </div>
            )}
            
          </div>
          {/* URL Format Help */}
            <div class="mt-3 text-xs text-white/70">
              <p>
                {autoProcessing() ? (
                  <span class="flex items-center gap-1">
                    <svg class="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8v8z"/>
                    </svg>
                    Auto-processing TikTok Lite shared content...
                  </span>
                ) : (
                  "Supported: Direct TikTok URLs, TikTok Lite shared content, vm.tiktok.com, m.tiktok.com - we'll extract the video URL automatically!"
                )}
              </p>
            </div>
        </div>
      </div>

      {error() && (
        <div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <strong>Error:</strong>
          </div>
          <p class="mt-1">{error()}</p>
        </div>
      )}
    </div>
  );
}

export default InputSection;
