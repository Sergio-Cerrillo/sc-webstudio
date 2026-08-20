import type { Metadata } from "next"
import { birthday27, getBirthday27Guest } from "./data"
import { BossBirthday27Experience } from "./components/boss-birthday-27-experience"

type BossBirthday27PageProps = {
  searchParams?: Promise<{
    g?: string | string[]
  }>
}

export const metadata: Metadata = {
  title: birthday27.title,
  description: birthday27.description,
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: birthday27.title,
    description: birthday27.description,
    type: "website",
  },
}

export default async function BossBirthday27Page({ searchParams }: BossBirthday27PageProps) {
  const resolvedSearchParams = await searchParams
  const guest = getBirthday27Guest(resolvedSearchParams?.g)

  return <BossBirthday27Experience guest={guest} />
}
