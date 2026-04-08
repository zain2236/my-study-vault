import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Readable } from "stream";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME
) {
  console.warn(
    "[R2] Missing configuration. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in your environment.",
  );
}

function createR2Client() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error("R2 storage is not configured.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

const r2Client = createR2Client();

export interface PresignedUploadOptions {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}

// Create a preassigned url for client to directly upload file to the R2
export async function createPresignedUploadUrl(
  options: PresignedUploadOptions,
) {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured.");
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: options.key,
    ContentType: options.contentType,
  });

  // Preassigned url duration
  const url = await getSignedUrl(r2Client, command, {
    expiresIn: options.expiresInSeconds ?? 60 * 60, // default 1 hour
  });

  return url;
}

// Delete file from R2
export async function deleteObjectFromR2(key: string): Promise<boolean> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured.");
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error("[R2] Failed to delete object", key, error);
    return false;
  }
}

// Check if object exists in R2
export async function objectExistsInR2(key: string): Promise<boolean> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured.");
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);
    return true;
  } catch {
    return false;
  }
}

// Convert stream to buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

// Get object buffer from R2
export async function getObjectBufferFromR2(
  key: string,
): Promise<Buffer | null> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured.");
  }

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    const response = await r2Client.send(command);
    const body = response.Body;

    if (!body) {
      return null;
    }

    if (body instanceof Buffer) {
      return body;
    }

    const readable = body as Readable;
    return await streamToBuffer(readable);
  } catch (error) {
    console.error("[R2] Failed to read object", key, error);
    return null;
  }
}
