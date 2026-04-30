import { UserOrderDetailView } from "@/src/features/user/UserOrderDetailView"

export default async function UserOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <UserOrderDetailView orderId={id} />
}
