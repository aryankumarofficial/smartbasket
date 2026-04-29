const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ?? "http://localhost:8000"

export async function generateProductEmbeddings(): Promise<{
  processed: number
}> {
  console.log("[Worker] Starting product embedding generation...")

  try {
    const response = await fetch(
      `${AI_SERVICE_URL}/embeddings/products/batch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(300000), // 5 min timeout
      }
    )

    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}`)
    }

    const data = (await response.json()) as { processed: number }
    console.log(
      `[Worker] Embedding generation complete. Processed: ${data.processed}`
    )

    return { processed: data.processed }
  } catch (error) {
    console.error("[Worker] Embedding generation failed:", error)
    return { processed: 0 }
  }
}
