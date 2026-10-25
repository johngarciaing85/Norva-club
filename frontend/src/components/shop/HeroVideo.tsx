"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const show = () => setVisible(true);

    video.addEventListener("loadeddata", show);
    video.play().catch(() => {});

    const fallback = setTimeout(show, 2000);

    return () => {
      video.removeEventListener("loadeddata", show);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}
