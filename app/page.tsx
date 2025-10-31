import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Code2, Share2, Users, Zap, ArrowRight, Search } from "lucide-react"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let topScripts = []
  const { data, error } = await supabase
    .from("scripts")
    .select("*, profiles:author_id(username, avatar_url)")
    .eq("is_public", true)
    .order("views_count", { ascending: false })
    .limit(6)

  if (!error) {
    topScripts = data || []
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ZiaanBlox</h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline">Profile</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground text-balance">
            Share Your <span className="text-primary">Scripts</span> with the World
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            ZiaanBlox is a community platform where developers share, discover, and collaborate on scripts. Join
            thousands of developers today.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {user ? (
              <>
                <Link href="/dashboard/upload">
                  <Button size="lg" className="gap-2">
                    Upload Script <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/scripts">
                  <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                    Browse Scripts <Search className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/sign-up">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/scripts">
                  <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                    Browse Scripts <Search className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-balance">Why Choose ZiaanBlox?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-border rounded-lg">
              <Share2 className="w-12 h-12 text-primary mb-4" />
              <h4 className="text-xl font-semibold mb-2">Easy Sharing</h4>
              <p className="text-muted-foreground">
                Upload your scripts in seconds and share with the community instantly.
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h4 className="text-xl font-semibold mb-2">Collaboration</h4>
              <p className="text-muted-foreground">
                Connect with other developers, get feedback, and improve together.
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h4 className="text-xl font-semibold mb-2">Fast & Reliable</h4>
              <p className="text-muted-foreground">Lightning-fast hosting with 99.9% uptime guaranteed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Scripts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold mb-8 text-balance">Popular Scripts</h3>
        {topScripts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground mb-4">No scripts uploaded yet. Be the first to share!</p>
            {user && (
              <Link href="/dashboard/upload">
                <Button className="gap-2">
                  Upload Your First Script <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topScripts.map((script: any) => (
              <Link key={script.id} href={`/scripts/${script.id}`}>
                <div className="p-6 border border-border rounded-lg hover:border-primary transition-colors h-full cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded font-medium">
                      {script.language}
                    </span>
                    <span className="text-xs text-muted-foreground">{script.views_count} views</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-balance line-clamp-2">{script.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{script.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>By {script.profiles?.username}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link href="/scripts">
            <Button variant="outline" size="lg">
              View All Scripts
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2025 ZiaanBlox. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
