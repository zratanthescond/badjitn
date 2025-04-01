import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import Hls from "hls.js";

interface Props extends React.HTMLProps<HTMLVideoElement> {
  manifest: string;
}

const HLSPlayer = forwardRef<HTMLVideoElement, Props>(
  ({ manifest, ...props }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    useImperativeHandle(ref, () => videoRef.current!);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !manifest) return;

      // Ensure previous HLS instance is destroyed
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari (native HLS)
        video.src = manifest;
        video.addEventListener("loadedmetadata", () => video.play());
      } else if (Hls.isSupported()) {
        const hls = new Hls({
          lowLatencyMode: true,
          maxBufferLength: 10,
          liveSyncDurationCount: 2,
        });

        hlsRef.current = hls;
        hls.loadSource(manifest);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_LOADED, () => {
          console.log("HLS manifest loaded successfully");
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS Error:", data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn("Network error occurred, retrying...");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn("Media error, attempting recovery...");
                hls.recoverMediaError();
                break;
              default:
                console.error("Unrecoverable error, destroying HLS instance.");
                hls.destroy();
                hlsRef.current = null;
            }
          }
        });
      } else {
        console.error("HLS is not supported on this device.");
      }

      return () => {
        hlsRef.current?.destroy();
        hlsRef.current = null;
      };
    }, [manifest]);

    return <video {...props} ref={videoRef} autoPlay muted playsInline />;
  }
);

HLSPlayer.displayName = "HLSPlayer";
export default HLSPlayer;
