"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Code2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditScriptPage() {
  const params = useParams()
  const scriptId = params.id as string
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [isPublic, setIsPublic] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadScript = async () => {
      const supabase = createClient()

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      setUser(authUser)

      const { data: scriptData, error: scriptError } = await supabase
        .from("scripts")
        .select("*")
        .eq("id", scriptId)
        .single()

      if (scriptError || !scriptData) {
        router.push("/scripts")
        return
      }

      if (scriptData.author_id !== authUser.id) {
        router.push(`/scripts/${scriptId}`)
        return
      }

      setTitle(scriptData.title)
      setDescription(scriptData.description || "")
      setContent(scriptData.content)
      setLanguage(scriptData.language)
      setIsPublic(scriptData.is_public)
      setIsLoading(false)
    }

    loadScript()
  }, [scriptId, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required")
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from("scripts")
        .update({
          title,
          description: description || null,
          content,
          language,
          is_public: isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq("id", scriptId)

      if (updateError) throw updateError

      router.push(`/scripts/${scriptId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save script")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
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
          <Link href={`/scripts/${scriptId}`}>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Back to Script
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Edit Script</h2>
          <p className="text-muted-foreground">Update your script details and code</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
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
                <Label htmlFor="description">Description</Label>
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

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Script Code</Label>
                <textarea
                  id="content"
                  placeholder="Paste your code here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
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
              <Button type="submit" className="w-full gap-2" disabled={isSaving}>
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
