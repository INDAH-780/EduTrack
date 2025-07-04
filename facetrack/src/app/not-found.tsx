import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600">
        The page you're looking for doesn't exist or you don't have access.
      </p>
      <Button asChild>
        <Link href="/login">Return to Login</Link>
      </Button>
    </div>
  )
}