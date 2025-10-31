"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Code2, Save, LogOut, Mail } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [email, setEmail] = useState("")

  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      setUser(authUser)

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

      if (profileData) {
        setProfile(profileData)
        setUsername(profileData.username)
        setBio(profileData.bio || "")
        setEmail(profileData.email)
      }
    }

    loadProfile()
  }, [router])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSaving(true)

    if (!username.trim()) {
      setError("Username is required")
      setIsSaving(false)
      return
    }

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username,
          bio: bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess("Profile updated successfully!")
      setIsEditing(false)

      // Reload profile
      const { data: updatedProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (updatedProfile) {
        setProfile(updatedProfile)
      }

      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (!profile) {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ZiaanBlox</h1>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="bg-transparent">
                Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Profile</h2>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={email} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={4}
                      />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {success && <p className="text-sm text-green-600">{success}</p>}

                    <div className="flex gap-2">
                      <Button type="submit" disabled={isSaving} className="gap-2">
                        <Save className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="bg-transparent"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Username</p>
                      <p className="text-lg font-semibold">{profile.username}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <p className="text-sm">{profile.email}</p>
                      </div>
                    </div>

                    {profile.bio && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Bio</p>
                        <p className="text-sm">{profile.bio}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                      <p className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>

                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Card */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`text-sm font-medium ${profile.is_banned ? "text-destructive" : "text-green-600"}`}>
                    {profile.is_banned ? "Banned" : "Active"}
                  </p>
                </div>
                {profile.is_developer && (
                  <div className="p-3 bg-primary/10 rounded border border-primary/20">
                    <p className="text-xs font-medium text-primary">Developer Account</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    My Dashboard
                  </Button>
                </Link>
                <Link href="/scripts" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Browse Scripts
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
