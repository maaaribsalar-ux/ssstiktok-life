
import { toast, Toaster } from "solid-toast";
import { createSignal } from "solid-js";
import InputSection from "@components/InputScreen/InputSection";
import ResultSection from "@components/ResultSection/ResultSection";

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

type Props = {};

function InputScreen({}: Props) {
  const [data, setData] = createSignal<TikTokData | null>(null);

  const handleDataFetched = (fetchedData: TikTokData) => {
    setData(fetchedData);
  };

  const handleReset = () => {
    setData(null);
  };

  return (
    <div>
      <Toaster />
      
      {!data() ? (
        /* Show Input Section when no data */
        <InputSection onDataFetched={handleDataFetched} />
      ) : (
        /* Show Result Section when data is available */
        <ResultSection data={data()!} onReset={handleReset} />
      )}
    </div>
  );
}

export default InputScreen;
