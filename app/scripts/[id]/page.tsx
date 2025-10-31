"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Heart, MessageCircle, Copy, Edit2, Trash2, ArrowLeft, Eye } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

export default function ScriptDetailPage() {
  const params = useParams()
  const scriptId = params.id as string
  const router = useRouter()

  const [script, setScript] = useState<any>(null)
  const [author, setAuthor] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadScriptData = async () => {
      const supabase = createClient()

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      setUser(authUser)

      // Load script
      const { data: scriptData, error: scriptError } = await supabase
        .from("scripts")
        .select("*, profiles:author_id(username, avatar_url)")
        .eq("id", scriptId)
        .single()

      if (scriptError) {
        console.error("Error loading script:", scriptError)
        router.push("/scripts")
        return
      }

      setScript(scriptData)
      setAuthor(scriptData.profiles)

      // Update view count
      await supabase
        .from("scripts")
        .update({ views_count: (scriptData.views_count || 0) + 1 })
        .eq("id", scriptId)

      // Load comments
      const { data: commentsData } = await supabase
        .from("comments")
        .select("*, profiles:author_id(username, avatar_url)")
        .eq("script_id", scriptId)
        .order("created_at", { ascending: false })

      setComments(commentsData || [])

      // Check if user liked this script
      if (authUser) {
        const { data: likeData } = await supabase
          .from("script_likes")
          .select("*")
          .eq("script_id", scriptId)
          .eq("user_id", authUser.id)
          .single()

        setIsLiked(!!likeData)
      }

      // Get like count
      const { count } = await supabase
        .from("script_likes")
        .select("*", { count: "exact", head: true })
        .eq("script_id", scriptId)

      setLikeCount(count || 0)
      setIsLoading(false)
    }

    loadScriptData()
  }, [scriptId, router])

  const handleLike = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const supabase = createClient()

    if (isLiked) {
      const { error } = await supabase.from("script_likes").delete().eq("script_id", scriptId).eq("user_id", user.id)

      if (!error) {
        setIsLiked(false)
        setLikeCount(Math.max(0, likeCount - 1))
      }
    } else {
      const { error } = await supabase.from("script_likes").insert({
        script_id: scriptId,
        user_id: user.id,
      })

      if (!error) {
        setIsLiked(true)
        setLikeCount(likeCount + 1)
      }
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push("/auth/login")
      return
    }

    if (!newComment.trim()) return

    const supabase = createClient()

    const { data: commentData, error } = await supabase
      .from("comments")
      .insert({
        script_id: scriptId,
        author_id: user.id,
        content: newComment,
      })
      .select("*, profiles:author_id(username, avatar_url)")
      .single()

    if (!error && commentData) {
      setComments([commentData, ...comments])
      setNewComment("")
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    const supabase = createClient()

    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (!error) {
      setComments(comments.filter((c) => c.id !== commentId))
    }
  }

  const handleDeleteScript = async () => {
    if (!confirm("Are you sure you want to delete this script?")) return

    const supabase = createClient()

    const { error } = await supabase.from("scripts").delete().eq("id", scriptId)

    if (!error) {
      router.push("/dashboard")
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script?.code || "")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading script...</p>
      </div>
    )
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Script not found</p>
      </div>
    )
  }

  const isAuthor = user?.id === script.author_id

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/scripts" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Scripts</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ZiaanBlox</h1>
          </Link>
          <div className="flex items-center gap-2">
            {isAuthor && (
              <Button variant="destructive" size="sm" onClick={handleDeleteScript} className="gap-1">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{script.title}</h1>
              <p className="text-muted-foreground mb-4">{script.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>By {author?.username}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {script.views_count} views
                </span>
              </div>
            </div>
            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full font-medium">
              {script.language}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Code Block */}
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Code</CardTitle>
                <Button size="sm" variant="outline" onClick={copyToClipboard} className="gap-2 bg-transparent">
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code className="font-mono">{script.code}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Comment Form */}
                {user ? (
                  <form onSubmit={handleAddComment} className="space-y-3">
                    <textarea
                      placeholder="Share your thoughts..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                    <Button type="submit" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Post Comment
                    </Button>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    <Link href="/auth/login" className="text-primary hover:underline">
                      Login
                    </Link>{" "}
                    to post a comment
                  </p>
                )}

                {/* Comments List */}
                <div className="space-y-4 border-t border-border pt-6">
                  {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-4">No comments yet</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="pb-4 border-b border-border last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-sm">{comment.profiles?.username}</p>
                          {user?.id === comment.author_id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-destructive hover:text-destructive/80 text-xs"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full gap-2" variant={isLiked ? "default" : "outline"} onClick={handleLike}>
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  Like ({likeCount})
                </Button>
                {isAuthor && (
                  <Link href={`/scripts/${scriptId}/edit`} className="block">
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <Edit2 className="w-4 h-4" />
                      Edit Script
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Author Info */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="font-semibold mb-2">{author?.username}</p>
                  <Link href={`/profile/${script.author_id}`}>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
