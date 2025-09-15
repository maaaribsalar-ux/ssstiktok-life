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
  
  // ALL ADSENSE CODE REMOVED FOR BETTER PERFORMANCE

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
                
                {/* AD CONTAINER REMOVED FOR BETTER PERFORMANCE */}
              </div>

              <div class="space-y-2">
                {data?.result?.videoSD && (
                  <button class="download-button bg-sky-500 w-full p-3 rounded text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg> 
                    <a href={`https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent(data!.result!.videoSD!)}&type=.mp4&title=${getSafeFilename()}`} class="text-white no-underline">
                      Download without Watermark
                    </a>
                  </button>
                )}

                {(data?.result?.videoHD || data?.result?.video_hd) && (
                  <button class="download-button bg-sky-500 w-full p-3 rounded text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg> 
                    <a href={`https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent((data!.result!.videoHD || data!.result!.video_hd)!)}&type=.mp4&title=${getSafeFilename()}`} class="text-white no-underline">
                      Download without Watermark [HD]
                    </a>
                  </button>
                )}

                {data?.result?.videoWatermark && (
                  <button class="download-button bg-sky-500 w-full p-3 rounded text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                    </svg> 
                    <a href={`https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent(data!.result!.videoWatermark!)}&type=.mp4&title=${getSafeFilename()}`} class="text-white no-underline">
                      Download with Watermark
                    </a>
                  </button>
                )}

                {data?.result?.music && (
                  <button class="download-button bg-sky-500 w-full p-3 rounded text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                    </svg> 
                    <a href={`https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent(data!.result!.music!)}&type=.mp3&title=${getSafeFilename()}_audio`} class="text-white no-underline">
                      Download MP3 audio
                    </a>
                  </button>
                )}

                <button 
                  onClick={onReset}
                  class="download-button bg-sky-500 w-full p-3 rounded text-white flex items-center justify-center">
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

