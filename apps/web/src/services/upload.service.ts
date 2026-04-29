export interface UploadProvider {
  upload(params: {
    file: Buffer
    key: string
    contentType?: string
  }): Promise<{ url: string; key: string }>
}

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

function joinPublicUrl(base: string, key: string): string {
  const trimmed = base.replace(/\/+$/, "")
  const normalizedKey = key.replace(/^\/+/, "")
  return `${trimmed}/${normalizedKey}`
}

class CloudflareR2Provider implements UploadProvider {
  private client: S3Client | null | undefined = undefined

  private getClient() {
    if (this.client !== undefined) return this.client

    const accountId = process.env.R2_ACCOUNT_ID
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

    if (!accountId || !accessKeyId || !secretAccessKey) {
      this.client = null
      return this.client
    }

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })
    return this.client
  }

  async upload(params: { file: Buffer; key: string; contentType?: string }) {
    const bucket = process.env.R2_BUCKET
    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL

    if (!bucket || !publicBaseUrl) {
      throw new Error("R2_BUCKET and R2_PUBLIC_BASE_URL must be set for R2 uploads")
    }

    const client = this.getClient()
    if (!client) {
      throw new Error(
        "R2 credentials not configured (R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY)"
      )
    }

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: params.key,
        Body: params.file,
        ContentType: params.contentType ?? "application/octet-stream",
      })
    )

    return {
      url: joinPublicUrl(publicBaseUrl, params.key),
      key: params.key,
    }
  }
}

class CloudinaryProvider implements UploadProvider {
  async upload(_params: { file: Buffer; key: string }) {
    return {
      url: joinPublicUrl(
        process.env.CLOUDINARY_BASE_URL ?? "https://res.cloudinary.com",
        _params.key
      ),
      key: _params.key,
    }
  }
}

class ImageKitProvider implements UploadProvider {
  async upload(_params: { file: Buffer; key: string }) {
    return {
      url: joinPublicUrl(
        process.env.IMAGEKIT_BASE_URL ?? "https://ik.imagekit.io",
        _params.key
      ),
      key: _params.key,
    }
  }
}

const providerName = (process.env.UPLOAD_PROVIDER ?? "r2").toLowerCase()

export const uploadService: UploadProvider =
  providerName === "cloudinary"
    ? new CloudinaryProvider()
    : providerName === "imagekit"
      ? new ImageKitProvider()
      : new CloudflareR2Provider()
