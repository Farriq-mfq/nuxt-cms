import sharp from "sharp";

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  width: number;
  height: number;
}

export interface ImageProcessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  convertToWebp?: boolean;
}

const DEFAULT_OPTIONS: Required<ImageProcessOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 80,
  convertToWebp: true,
};

export async function processImage(
  buffer: Buffer,
  options: ImageProcessOptions = {},
): Promise<ProcessedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let pipeline = sharp(buffer).rotate(); // auto-rotate berdasar EXIF, lalu strip EXIF

  const metadata = await sharp(buffer).metadata();

  const shouldResize =
    (metadata.width && metadata.width > opts.maxWidth) ||
    (metadata.height && metadata.height > opts.maxHeight);

  if (shouldResize) {
    pipeline = pipeline.resize({
      width: opts.maxWidth,
      height: opts.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  if (opts.convertToWebp) {
    pipeline = pipeline.webp({ quality: opts.quality });
  } else {
    pipeline = pipeline.jpeg({ quality: opts.quality, mozjpeg: true });
  }

  const outputBuffer = await pipeline.toBuffer();
  const outputMetadata = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    mimeType: opts.convertToWebp ? "image/webp" : "image/jpeg",
    extension: opts.convertToWebp ? ".webp" : ".jpg",
    width: outputMetadata.width ?? 0,
    height: outputMetadata.height ?? 0,
  };
}

export async function generateThumbnail(
  buffer: Buffer,
  size = 300,
): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(size, size, { fit: "cover" })
    .webp({ quality: 75 })
    .toBuffer();
}

export async function getImageMetadata(buffer: Buffer) {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    format: metadata.format,
  };
}
