import { redirect } from 'next/navigation'

export default async function TourStartPage() {
  redirect('/api/tour')
}
