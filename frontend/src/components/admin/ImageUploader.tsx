"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const remaining = maxImages - images.length;
    const toProcess = Array.from(files).slice(0, remaining);

    toProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      // TODO(Fase 6): upload to server/CDN instead of local preview
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onChange([...images, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((src, i) => (
          <div
            key={i}
            className="group relative size-24 overflow-hidden rounded-lg border bg-muted"
          >
            <img
              src={src}
              alt={`Imagen ${i + 1}`}
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={`Eliminar imagen ${i + 1}`}
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <ImagePlus className="size-5" />
            <span className="text-[10px]">Agregar</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        Máximo {maxImages} imágenes. Solo archivos de imagen.
      </p>
    </div>
  );
}
