import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const error_description = searchParams.get("error_description")

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error_description || error)}`, request.url),
    )
  }

  if (code) {
    const supabase = await createClient()

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Create or update profile
      if (user) {
        const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (!existingProfile) {
          // Extract username from email or user metadata
          const username =
            user.user_metadata?.name || user.email?.split("@")[0] || `user_${Math.random().toString(36).substring(7)}`

          const { error: profileError } = await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            username: username,
            avatar_url: user.user_metadata?.avatar_url || null,
          })

          if (profileError) {
            console.error("Error creating profile:", profileError)
          }
        }
      }

      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.redirect(new URL("/auth/login?error=Authentication%20failed", request.url))
}
