"use client"

import Link from "next/link"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"

export function StudioFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="sc-proposals site-bg min-h-screen text-black dark:text-white">
      <Header homePath="/" />
      <main className="sc-proposals-main">{children}</main>
      <Footer homePath="/" />
    </div>
  )
}

export function StudioLogo() {
  return (
    <Link
      href="/"
      className="sc-proposals-logo"
      aria-label="SC WebStudio, volver al inicio"
    >
      <Image
        src="/logo/logo-full-b.png"
        alt=""
        width={320}
        height={90}
        className="h-auto w-full dark:hidden"
        priority
      />
      <Image
        src="/logo/logo-full-w.png"
        alt=""
        width={320}
        height={90}
        className="hidden h-auto w-full dark:block"
        priority
      />
    </Link>
  )
}
