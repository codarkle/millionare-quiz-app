"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/actions"
import { LogOut, HelpCircle, User } from "lucide-react"

export function Navigation() {

  const router = useRouter()

  const handleViewHelp = () => {
    router.push("/help")
  }
  const handleViewProfile = () => {
    router.push("/profile")
  }
  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <header className="p-2 bg-black/50 flex items-center">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image
              src="/image/logo.jpg"
              alt="Who Wants To Be A Millionaire Logo"
              width={100}
              height={100}
              className="rounded-full"
            />
          </Link>
          <h2 className="text-3xl font-bold text-white">Millionaire Quiz Show</h2>
        </div>
        <div className="flex gap-4">
            <HelpCircle size="32" onClick={handleViewHelp} style={{cursor:"pointer",marginRight:"30px"}}/>
            <User size="32" onClick={handleViewProfile} style={{cursor:"pointer",marginRight:"30px"}}/>
            <LogOut size="32" onClick={handleLogout} style={{cursor:"pointer",marginRight:"30px"}}/>
        </div>
      </div>
    </header>
  )
} 