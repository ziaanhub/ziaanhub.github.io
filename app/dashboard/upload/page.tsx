"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Code2, Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UploadScriptPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [tags, setTags] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
      } else {
        setUser(authUser)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim() || !code.trim()) {
      setError("Title and code are required")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Get or create user profile
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single()

      if (!profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          username: user.email?.split("@")[0],
          avatar_url: null,
        })
      }

      const parsedTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const { error: uploadError } = await supabase.from("scripts").insert({
        title,
        description: description || null,
        code,
        language,
        tags: parsedTags,
        author_id: user.id,
        is_public: isPublic,
      })

      if (uploadError) throw uploadError

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload script")
    } finally {
      setIsLoading(false)
    }
  }

  const languages = [
    "javascript",
    "python",
    "lua",
    "typescript",
    "java",
    "cpp",
    "csharp",
    "php",
    "ruby",
    "go",
    "rust",
    "kotlin",
    "swift",
    "sql",
    "html",
    "css",
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ZiaanBlox</h1>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Upload New Script</h2>
          <p className="text-muted-foreground">Share your code with the community</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Script Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Discord Bot Command Handler"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  placeholder="Describe what your script does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">Programming Language</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional, comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., automation, utility, web"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Script Code</Label>
                <textarea
                  id="code"
                  placeholder="Paste your code here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  rows={15}
                  required
                />
              </div>

              {/* Public Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Make this script public
                </Label>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              {/* Submit Button */}
              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                <Upload className="w-4 h-4" />
                {isLoading ? "Uploading..." : "Upload Script"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
