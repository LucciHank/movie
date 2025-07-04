import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { SwiperSlide } from "swiper/react";
import tmdbConfigs from "../../api/configs/tmdb.configs";
import NavigationSwiper from "./NavigationSwiper";
import Hls from "hls.js";

const MediaVideo = ({ video }) => {
  const iframeRef = useRef();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isHlsVideo, setIsHlsVideo] = useState(false);
  const [hlsUrl, setHlsUrl] = useState(null);

  useEffect(() => {
    // Check if this is a HLS video
    if (video.key && (
      video.key.includes('.m3u8') || 
      video.site === 'HLS' || 
      (video.key.includes('vz-968cfbf9-496.b-cdn.net'))
    )) {
      setIsHlsVideo(true);
      setHlsUrl(video.key);
      console.log("HLS URL detected:", video.key);
    } else {
      setIsHlsVideo(false);
    }

    if (!isHlsVideo && iframeRef.current) {
      const height = iframeRef.current.offsetWidth * 9 / 16 + "px";
      iframeRef.current.setAttribute("height", height);
    }
  }, [video]);

  // Thêm hỗ trợ HLS.js
  useEffect(() => {
    if (isHlsVideo && hlsUrl && videoRef.current) {
      const video = videoRef.current;
      
      console.log("Setting up HLS video:", hlsUrl);
      
      // Clean up any existing hls instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      // Safari supports HLS natively
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log("Using native HLS support");
        video.src = hlsUrl;
      } 
      // For other browsers, use hls.js
      else if (Hls.isSupported()) {
        console.log("Using HLS.js");
        const hls = new Hls({
          debug: true,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        
        hlsRef.current = hls;
        
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log("HLS media attached");
        });
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed");
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.log("HLS error:", data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal HLS error:', data);
                hls.destroy();
                break;
            }
          }
        });
      } else {
        console.error("Browser does not support HLS");
      }
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isHlsVideo, hlsUrl]);

  return (
    <Box sx={{ height: "max-content" }}>
      {isHlsVideo ? (
        <Box 
          sx={{ 
            position: "relative",
            paddingTop: "56.25%", // 16:9 aspect ratio
            width: "100%"
          }}
        >
          <video
            ref={videoRef}
            controls
            playsInline
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%"
            }}
          >
            Your browser does not support HTML5 video.
          </video>
        </Box>
      ) : (
        <iframe
          key={video.key}
          src={tmdbConfigs.youtubePath(video.key)}
          ref={iframeRef}
          width="100%"
          title={video.id}
          style={{ border: 0 }}
        ></iframe>
      )}
    </Box>
  );
};

const MediaVideosSlide = ({ videos }) => {
  console.log({ videos });
  return (
    <NavigationSwiper>
      {videos.map((video, index) => (
        <SwiperSlide key={index}>
          <MediaVideo video={video} />
        </SwiperSlide>
      ))}
    </NavigationSwiper>
  );
};

export default MediaVideosSlide;