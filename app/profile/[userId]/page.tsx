"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code2, Mail, User } from "lucide-react"

export default function PublicProfilePage() {
  const params = useParams()
  const userId = params.userId as string

  const [profile, setProfile] = useState<any>(null)
  const [userScripts, setUserScripts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserProfile = async () => {
      const supabase = createClient()

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (profileData) {
        setProfile(profileData)

        // Load user's public scripts
        const { data: scriptsData } = await supabase
          .from("scripts")
          .select("*")
          .eq("author_id", userId)
          .eq("is_public", true)
          .order("created_at", { ascending: false })

        setUserScripts(scriptsData || [])
      }

      setIsLoading(false)
    }

    loadUserProfile()
  }, [userId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ZiaanBlox</h1>
          </Link>
          <Link href="/scripts">
            <Button variant="outline" size="sm" className="bg-transparent">
              Back to Scripts
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary-foreground" />
              </div>

              <div className="flex-grow">
                <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </span>
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>

                {profile.bio && <p className="text-foreground mb-4">{profile.bio}</p>}

                {profile.is_developer && (
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                    Developer
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User's Scripts */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Public Scripts ({userScripts.length})</h2>

          {userScripts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground py-12">
                <p>This user hasn't published any public scripts yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userScripts.map((script) => (
                <Link key={script.id} href={`/scripts/${script.id}`}>
                  <Card className="hover:border-primary transition-colors h-full cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">{script.title}</CardTitle>
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded font-medium whitespace-nowrap ml-2">
                          {script.language}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {script.description || "No description"}
                      </p>
                      <p className="text-xs text-muted-foreground">{script.views_count} views</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
