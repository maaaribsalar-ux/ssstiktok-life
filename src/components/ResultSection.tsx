import { onCleanup, createSignal } from "solid-js";

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
    images?: string[] | null;
  } | null;
}

interface ResultSectionProps {
  data: TikTokData;
  onReset: () => void;
}

function ResultSection({ data, onReset }: ResultSectionProps) {
  const [imageIndex, setImageIndex] = createSignal(0);
  
  const getVideoUrl = () => {
    const result = data?.result;
    // Prioritize HD over SD for preview, but ensure we have a valid URL
    return result?.videoHD || result?.video_hd || result?.videoSD || result?.videoWatermark || "";
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
    const desc = data?.result?.desc || "";
    const baseFilename = `${author}_${desc}`.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 50);
    return baseFilename || 'tiktok_video';
  };

  // Check if this is an image/slideshow post
  const hasImages = () => {
    return data?.result?.images && Array.isArray(data.result.images) && data.result.images.length > 0;
  };

  // Get downloadable video URLs (in order of quality preference)
  const getDownloadUrls = () => {
    const result = data?.result;
    const urls: Array<{url: string, label: string, color: string}> = [];
    
    if (result?.videoHD || result?.video_hd) {
      urls.push({
        url: result.videoHD || result.video_hd!,
        label: "Download HD (No Watermark)",
        color: "from-pink-600 to-pink-400 hover:from-pink-500 hover:to-pink-300"
      });
    }
    
    if (result?.videoSD && result.videoSD !== (result?.videoHD || result?.video_hd)) {
      urls.push({
        url: result.videoSD,
        label: "Download SD (No Watermark)", 
        color: "from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300"
      });
    }
    
    if (result?.videoWatermark && result.videoWatermark !== result?.videoSD && result.videoWatermark !== (result?.videoHD || result?.video_hd)) {
      urls.push({
        url: result.videoWatermark,
        label: "Download (With Watermark)",
        color: "from-green-600 to-green-400 hover:from-green-500 hover:to-green-300"
      });
    }
    
    return urls;
  };

  return (
    <div class="max-w-6xl mx-auto mt-8 px-4">
      {/* Results Section */}
      <div class="mt-4 max-w-6xl mx-auto">
        <div class="bg-white rounded overflow-hidden backdrop-blur-sm border border-white/10 p-4">
          <div class="flex flex-col md:flex-row gap-4">
            
            {/* Media Preview Section */}
            <div class="md:w-1/3 flex-shrink-0">
              <div class="relative rounded-lg overflow-hidden max-h-[430px]">
                {hasImages() ? (
                  /* Image Slideshow */
                  <div class="relative">
                    <img 
                      src={data!.result!.images![imageIndex()]}
                      alt={`Slide ${imageIndex() + 1}`}
                      class="w-full h-full object-cover max-h-[430px]"
                      onError={(e) => {
                        console.error("Image failed to load:", e.currentTarget.src);
                        // Try next image if current one fails
                        if (imageIndex() + 1 < data!.result!.images!.length) {
                          setImageIndex(imageIndex() + 1);
                        }
                      }}
                    />
                    
                    {/* Image Navigation */}
                    {data!.result!.images!.length > 1 && (
                      <>
                        <button 
                          onClick={() => setImageIndex(Math.max(0, imageIndex() - 1))}
                          disabled={imageIndex() === 0}
                          class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:opacity-50 text-white p-2 rounded-full transition-all"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                          </svg>
                        </button>
                        
                        <button 
                          onClick={() => setImageIndex(Math.min(data!.result!.images!.length - 1, imageIndex() + 1))}
                          disabled={imageIndex() === data!.result!.images!.length - 1}
                          class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:opacity-50 text-white p-2 rounded-full transition-all"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </button>
                        
                        {/* Image Counter */}
                        <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {imageIndex() + 1} / {data!.result!.images!.length}
                        </div>
                      </>
                    )}
                  </div>
                ) : getVideoUrl() ? (
                  /* Video Preview */
                  <video 
                    controls 
                    src={getVideoUrl()} 
                    class="w-full h-full object-cover" 
                    referrerpolicy="no-referrer"
                    onError={(e) => {
                      console.error("Video failed to load:", e.currentTarget.src);
                      e.currentTarget.style.display = 'none';
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  /* Fallback when no media */
                  <div class="w-full h-64 bg-gray-700 flex items-center justify-center rounded-lg">
                    <div class="text-center text-gray-400">
                      <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      <p>No preview available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Info and Download Buttons */}
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
                  <div class="flex-1">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                      {getAuthorInfo().nickname}
                    </h2>
                    {data?.result?.uploadDate && (
                      <p class="text-sm text-gray-500">
                        {new Date(data.result.uploadDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div class="text-gray-400 text-xs px-2 py-1 bg-white/10 rounded-full">
                    {data?.result?.type === "image" || hasImages() ? "Images" : "Video"}
                  </div>
                </div>
                
                <div class="text-gray-900 text-sm mb-4">
                  {data?.result?.desc || "No description available"}
                </div>
              </div>

              {/* Download Buttons Section */}
              <div class="space-y-2">
                {/* Video Downloads */}
                {getDownloadUrls().map((download) => (
                  <button class={`download-button bg-gradient-to-r ${download.color} w-full p-3 rounded-lg text-white flex items-center justify-center transition-all duration-300 hover:shadow-lg transform hover:scale-105`}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg> 
                    <a 
                      href={`https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent(download.url)}&type=.mp4&title=${getSafeFilename()}`} 
                      class="text-white no-underline"
                    >
                      {download.label}
                    </a>
                  </button>
                ))}

                {/* Images Download (if applicable) */}
                {hasImages() && (
                  <div class="space-y-2">
                    <button class="download-button bg-gradient-to-r from-indigo-600 to-indigo-400 hover:from-indigo-500 hover:to-indigo-300 w-full p-3 rounded-lg text-white flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg> 
                      <a 
                        href={`https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent(data!.result!.images![imageIndex()])}&type=.jpg&title=${getSafeFilename()}_image_${imageIndex() + 1}`} 
                        class="text-white no-underline"
                      >
                        Download Current Image ({imageIndex() + 1} of {data!.result!.images!.length})
                      </a>
                    </button>
                    
                    {/* Download all images button */}
                    <div class="grid grid-cols-2 gap-2">
                      {data!.result!.images!.map((imageUrl, index) => (
                        <button class="download-button bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 w-full p-2 rounded text-white text-sm flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                          <a 
                            href={`https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent(imageUrl)}&type=.jpg&title=${getSafeFilename()}_image_${index + 1}`} 
                            class="text-white no-underline"
                          >
                            Image {index + 1}
                          </a>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio Download */}
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

                {/* Reset/New Download Button */}
                <button 
                  onClick={onReset}
                  class="download-button bg-gradient-to-r from-gray-600 to-gray-400 hover:from-gray-500 hover:to-gray-300 w-full p-3 rounded-lg text-white flex items-center justify-center">
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
