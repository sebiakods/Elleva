import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "./env";

/* -------------------------------------------------------------------------- */
/* B2 S3 CLIENT                                                               */
/* -------------------------------------------------------------------------- */

const b2Client = new S3Client({
  region: env.B2_REGION,
  endpoint: env.B2_ENDPOINT,

  credentials: {
    accessKeyId: env.B2_APPLICATION_KEY_ID,
    secretAccessKey: env.B2_APPLICATION_KEY,
  },

  forcePathStyle: true,
});

/* -------------------------------------------------------------------------- */
/* UPLOAD                                                                     */
/* -------------------------------------------------------------------------- */

export async function uploadToB2(
  file: Express.Multer.File,
  folder: string
): Promise<string> {
  const safeName = file.originalname
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  const key = `${folder}/${Date.now()}-${safeName}`;

  await b2Client.send(
    new PutObjectCommand({
      Bucket: env.B2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    })
  );

  return key;
}

/* -------------------------------------------------------------------------- */
/* B2 URL / KEY NORMALIZATION                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Converts:
 *
 * https://f004.backblazeb2.com/file/ellevadz-files/courses/123/file.pdf
 *
 * into:
 *
 * courses/123/file.pdf
 *
 * Also supports:
 *
 * http://f004.backblazeb2.com/file/...
 *
 * and already-normalized B2 object keys.
 */
export function extractB2Key(value: string): string {
  if (!value) {
    return value;
  }

  const normalized = value.trim();

  // Already a clean B2 object key
  if (
    !normalized.startsWith("http://") &&
    !normalized.startsWith("https://")
  ) {
    return normalized.replace(/^\/+/, "");
  }

  try {
    const url = new URL(normalized);

    const pathname = decodeURIComponent(url.pathname);

    /*
     * S3-compatible B2 URL:
     *
     * https://s3.us-west-004.backblazeb2.com/ellevadz-files/courses/...
     *
     * pathname:
     * /ellevadz-files/courses/...
     */
    const bucketPrefix = `/${env.B2_BUCKET_NAME}/`;

    if (pathname.startsWith(bucketPrefix)) {
      return pathname
        .substring(bucketPrefix.length)
        .replace(/^\/+/, "");
    }

    /*
     * Native B2 URL:
     *
     * https://f004.backblazeb2.com/file/ellevadz-files/courses/...
     */
    const marker = `/file/${env.B2_BUCKET_NAME}/`;

    const markerIndex = pathname.indexOf(marker);

    if (markerIndex !== -1) {
      return pathname
        .substring(markerIndex + marker.length)
        .replace(/^\/+/, "");
    }

    /*
     * Generic fallback for /file/bucket/key
     */
    const parts = pathname.split("/").filter(Boolean);

    const fileIndex = parts.indexOf("file");

    if (fileIndex !== -1) {
      const afterFile = parts.slice(fileIndex + 1);

      if (afterFile[0] === env.B2_BUCKET_NAME) {
        afterFile.shift();
      }

      return afterFile.join("/");
    }
  } catch {
    // Ignore malformed URLs
  }

  throw new Error(`Invalid B2 URL or key: ${value}`);
}

/* -------------------------------------------------------------------------- */
/* SIGNED DOWNLOAD URL                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Generates a temporary signed URL for a private B2 file.
 *
 * Works with both:
 *
 * 1. New DB values:
 *    courses/123/file.pdf
 *
 * 2. Old DB values:
 *    https://f004.backblazeb2.com/file/ellevadz-files/courses/123/file.pdf
 */
export async function getB2SignedUrl(
  value: string,
  expiresIn = 3600
): Promise<string> {
  if (!value) {
    throw new Error("B2 file key is missing.");
  }

  const key = extractB2Key(value);

  if (!key) {
    throw new Error("Unable to determine B2 object key.");
  }

  const command = new GetObjectCommand({
    Bucket: env.B2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(b2Client, command, {
    expiresIn,
  });
}