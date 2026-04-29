export interface UploadProvider {
  upload(file: Buffer, key: string): Promise<{ url: string; key: string }>
}

class CloudflareR2Provider implements UploadProvider {
  async upload(_file: Buffer, key: string) {
    return {
      url: `${process.env.R2_PUBLIC_BASE_URL ?? "https://r2.invalid"}/${key}`,
      key,
    }
  }
}

class CloudinaryProvider implements UploadProvider {
  async upload(_file: Buffer, key: string) {
    return {
      url: `${process.env.CLOUDINARY_BASE_URL ?? "https://res.cloudinary.com"}/${key}`,
      key,
    }
  }
}

class ImageKitProvider implements UploadProvider {
  async upload(_file: Buffer, key: string) {
    return {
      url: `${process.env.IMAGEKIT_BASE_URL ?? "https://ik.imagekit.io"}/${key}`,
      key,
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
