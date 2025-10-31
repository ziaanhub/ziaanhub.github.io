"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "bash",
  "json",
  "html",
  "css",
  "sql",
  "java",
  "csharp",
  "php",
  "ruby",
  "go",
  "rust",
]

export function ScriptUploadForm() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    language: "javascript",
    tags: "",
    isPublic: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in to upload scripts")
        setLoading(false)
        return
      }

      // Get or create user profile
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single()

      if (!profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          username: user.email?.split("@")[0],
          avatar_url: null,
        })
      }

      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const { data, error: insertError } = await supabase.from("scripts").insert({
        author_id: user.id,
        title: formData.title,
        description: formData.description,
        code: formData.code,
        language: formData.language,
        tags,
        is_public: formData.isPublic,
      })

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({
        title: "",
        description: "",
        code: "",
        language: "javascript",
        tags: "",
        isPublic: false,
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload script")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Your Script</h2>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-600 text-sm">Script uploaded successfully! Redirecting...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input
            type="text"
            placeholder="Enter script title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            placeholder="Describe what your script does"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Code</label>
          <Textarea
            placeholder="Paste your script code here"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            rows={10}
            required
            className="font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
          <Input
            type="text"
            placeholder="e.g., automation, utility, web"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="isPublic" className="text-sm font-medium">
            Make this script public
          </label>
        </div>

        <Button type="submit" disabled={loading} className="w-full gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Script
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}
