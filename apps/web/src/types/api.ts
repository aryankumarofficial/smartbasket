export interface NormalizedApiError {
  message: string
  status: number
  code?: string
  details?: unknown
}
