"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { adminUploadImage, adminDeleteImage } from "@/lib/api/admin";

interface ImageData {
  id?: string;
  url: string;
  alt?: string;
  publicId?: string | null;
}

interface ImageUploaderProps {
  images: ImageData[];
  onChange: (images: ImageData[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const remaining = maxImages - images.length;
    const toUpload = Array.from(files).slice(0, remaining);

    setUploading(true);
    const newImages: ImageData[] = [...images];

    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const result = await adminUploadImage(file);
        newImages.push({
          url: result.url,
          publicId: result.publicId,
          alt: "",
        });
      } catch {
        toast.error(`Error al subir ${file.name}`);
      }
    }

    onChange(newImages);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function removeImage(index: number) {
    const img = images[index];
    if (img.publicId) {
      try {
        await adminDeleteImage(img.publicId);
      } catch {
        toast.error("Error al eliminar la imagen del servidor");
      }
    }
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div
            key={img.publicId ?? img.url}
            className="group relative size-24 overflow-hidden rounded-lg border bg-muted"
          >
            <img
              src={img.url}
              alt={img.alt || `Imagen ${i + 1}`}
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

        {images.length < maxImages && !uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <ImagePlus className="size-5" />
            <span className="text-[10px]">Agregar</span>
          </button>
        )}

        {uploading && (
          <div className="flex size-24 items-center justify-center rounded-lg border-2 border-dashed">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
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
        Máximo {maxImages} imágenes. Solo archivos de imagen (JPG, PNG, WebP).
      </p>
    </div>
  );
}
