"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [state, setState] = useState<{ error?: string; success?: string } | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const result = await signUp(null, formData)
      setState(result)
      if (result.error) {
        toast({ variant: "destructive", description: result.error })
      } else if (result.success) {
        toast({ description: result.success })
      }
    } catch {
      const message = "An error occurred during sign up"
      setState({ error: message })
      toast({ variant: "destructive", description: message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-burgundy-900">Create an account</h1>
        <p className="text-lg text-gray-600">Sign up to get started</p>
      </div>

      <form action={handleSubmit as any} className="space-y-6">
        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{state.error}</div>
        )}

        {state?.success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{state.success}</div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Your full name"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
            />
          </div>
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
          disabled={isLoading}
          className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing up...
            </>
          ) : (
            "Sign Up"
          )}
        </Button>

        <div className="text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-burgundy-600 hover:underline">
            Log in
          </Link>
        </div>
      </form>
    </div>
  )
}
