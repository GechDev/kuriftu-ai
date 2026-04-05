"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80";

export function SafeImage({ src, alt, onError, ...rest }: ImageProps) {
  const [failed, setFailed] = useState(false);

  if (typeof src !== "string") {
    return <Image src={src} alt={alt} onError={onError} {...rest} />;
  }

  return (
    <Image
      {...rest}
      src={failed ? PLACEHOLDER : src}
      alt={alt}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
    />
  );
}
