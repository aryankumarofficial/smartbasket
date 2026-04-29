import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { requireAdminRequest } from "@/src/lib/auth/admin-guard"

function safeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await requireAdminRequest(request)
    const { productId } = await params

    const form = await request.formData()
    const files = form.getAll("files").filter((f): f is File => f instanceof File)

    if (!files.length) {
      return NextResponse.json(
        { error: "No files uploaded. Use form field 'files'." },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const buf = Buffer.from(await file.arrayBuffer())
        const key = `products/${productId}/${randomUUID()}-${safeFilename(file.name || "image")}`
        const { uploadService } = await import("@/src/services/upload.service")
        return uploadService.upload({
          file: buf,
          key,
          contentType: file.type || "application/octet-stream",
        })
      })
    )

    return NextResponse.json({
      success: true,
      productId,
      files: results,
      urls: results.map((r) => r.url),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload images"
    const status =
      message === "Unauthorized" ? 401 : message === "Admin role required" ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

