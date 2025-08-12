"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/actions"

export default function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<{ error?: string; success?: boolean } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    startTransition(() => {
      void (async () => {
        try {
          const result = await signIn(null, formData)
          setState(result)

          if (result?.success) {
            router.push("/")
          }
        } catch (error) {
          setState({ error: "An error occurred during sign in" })
        }
      })()
    })
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-burgundy-900">Welcome back</h1>
        <p className="text-lg text-gray-600">Sign in to your account</p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{state.error}</div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="text-center text-gray-600">
            Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="text-burgundy-600 hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  )
}
