"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Code2, Search, Heart, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<any[]>([])
  const [filteredScripts, setFilteredScripts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const loadScripts = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      const { data, error } = await supabase
        .from("scripts")
        .select("*, profiles:author_id(username, avatar_url), script_likes(count)")
        .eq("is_public", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading scripts:", error)
      } else {
        setScripts(data || [])
        setFilteredScripts(data || [])
      }
      setIsLoading(false)
    }

    loadScripts()
  }, [])

  useEffect(() => {
    let filtered = scripts

    if (selectedLanguage !== "all") {
      filtered = filtered.filter((s) => s.language.toLowerCase() === selectedLanguage.toLowerCase())
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.profiles?.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredScripts(filtered)
  }, [searchQuery, selectedLanguage, scripts])

  const languages = ["all", ...new Set(scripts.map((s) => s.language))]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ZiaanBlox</h1>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    Profile
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search scripts by title, description, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {languages.map((lang) => (
              <Button
                key={lang}
                variant={selectedLanguage === lang ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage(lang)}
              >
                {lang === "all" ? "All Languages" : lang}
              </Button>
            ))}
          </div>
        </div>

        {/* Scripts Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading scripts...</p>
          </div>
        ) : filteredScripts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No scripts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScripts.map((script: any) => (
              <Link key={script.id} href={`/scripts/${script.id}`}>
                <div className="p-6 border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all h-full cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded font-medium">
                      {script.language}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-balance line-clamp-2">{script.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {script.description || "No description provided"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {script.views_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {script.script_likes?.[0]?.count || 0}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">By {script.profiles?.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
