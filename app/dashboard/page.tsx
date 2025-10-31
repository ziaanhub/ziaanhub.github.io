"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Plus, LogOut, Settings } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userScripts, setUserScripts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createClient()

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authUser) {
        router.push("/auth/login")
        return
      }

      setUser(authUser)

      // Load user profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

      setUserProfile(profileData)

      // Load user scripts
      const { data: scriptsData } = await supabase
        .from("scripts")
        .select("*")
        .eq("author_id", authUser.id)
        .order("created_at", { ascending: false })

      setUserScripts(scriptsData || [])
      setIsLoading(false)
    }

    loadUserData()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ZiaanBlox</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.username}!</h2>
          <p className="text-muted-foreground">Manage your scripts and share code with the community</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Scripts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{userScripts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">
                {userScripts.reduce((sum, script) => sum + (script.views_count || 0), 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Member Since</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : "-"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Button */}
        <Link href="/dashboard/upload" className="mb-8 block">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Upload New Script
          </Button>
        </Link>

        {/* My Scripts */}
        <Card>
          <CardHeader>
            <CardTitle>My Scripts</CardTitle>
          </CardHeader>
          <CardContent>
            {userScripts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                You haven't uploaded any scripts yet. Start by uploading your first script!
              </p>
            ) : (
              <div className="space-y-3">
                {userScripts.map((script: any) => (
                  <Link key={script.id} href={`/scripts/${script.id}`}>
                    <div className="p-4 border border-border rounded hover:border-primary transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{script.title}</h4>
                          <p className="text-sm text-muted-foreground">{script.description}</p>
                        </div>
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded font-medium">
                          {script.language}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">{script.views_count} views</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
