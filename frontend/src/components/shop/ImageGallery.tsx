"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types";

interface ImageGalleryProps {
  images: ProductImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (!active) return null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
        <Image
          src={active.url}
          alt={active.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
          unoptimized
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square w-16 overflow-hidden rounded-md border-2 transition-colors ${
                i === activeIndex ? "border-foreground" : "border-transparent"
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
