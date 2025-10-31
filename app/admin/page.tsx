"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code2, Users, Shield, Trash2, Ban, Plus, LogOut, Zap, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [scripts, setScripts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminRole, setNewAdminRole] = useState("moderator")
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const mode = localStorage.getItem("adminMode")
    if (mode === "true") {
      setIsAuthenticated(true)
      loadAllData()
    }
  }, [])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password === "Ilham201127") {
      localStorage.setItem("adminMode", "true")
      setIsAuthenticated(true)
      loadAllData()
    } else {
      setError("Invalid password")
    }
  }

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // Load users
      const { data: usersData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      setUsers(usersData || [])

      // Load admin users
      const { data: adminData } = await supabase.from("user_admin_roles").select("*, profiles:user_id(username, email)")

      setAdminUsers(adminData || [])

      // Load scripts
      const { data: scriptsData } = await supabase
        .from("scripts")
        .select("*, profiles:author_id(username)")
        .order("created_at", { ascending: false })

      setScripts(scriptsData || [])
    } catch (err) {
      console.error("Error loading data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBanUser = async (userId: string, currentBanned: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from("profiles").update({ is_banned: !currentBanned }).eq("id", userId)

    if (error) {
      setError("Failed to update user")
    } else {
      loadAllData()
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure? This will delete the user and all their data.")) return

    const supabase = createClient()

    try {
      // Delete user from profiles (cascade will handle auth.users)
      const { error } = await supabase.from("profiles").delete().eq("id", userId)

      if (error) throw error
      loadAllData()
    } catch (err) {
      setError("Failed to delete user")
    }
  }

  const handleDeleteScript = async (scriptId: string) => {
    if (!confirm("Are you sure you want to delete this script?")) return

    const supabase = createClient()
    const { error } = await supabase.from("scripts").delete().eq("id", scriptId)

    if (error) {
      setError("Failed to delete script")
    } else {
      loadAllData()
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newAdminEmail.trim()) {
      setError("Email is required")
      return
    }

    const supabase = createClient()

    try {
      // Find user by email
      const { data: userData } = await supabase.from("profiles").select("id").eq("email", newAdminEmail).single()

      if (!userData) {
        setError("User not found")
        return
      }

      // Get role ID
      const { data: roleData } = await supabase.from("admin_roles").select("id").eq("role_name", newAdminRole).single()

      if (!roleData) {
        setError("Role not found")
        return
      }

      // Get current user (for assigned_by)
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        setError("Not authenticated")
        return
      }

      // Create admin assignment
      const { error: insertError } = await supabase.from("user_admin_roles").insert({
        user_id: userData.id,
        role_id: roleData.id,
        assigned_by: currentUser.id,
      })

      if (insertError) {
        if (insertError.message.includes("duplicate")) {
          setError("User is already an admin")
        } else {
          throw insertError
        }
      } else {
        setNewAdminEmail("")
        loadAllData()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admin")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full">
                Login as Admin
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalScripts = scripts.length
  const totalUsers = users.length
  const totalAdmins = adminUsers.length
  const bannedUsers = users.filter((u) => u.is_banned).length

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ZiaanBlox Admin</h1>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem("adminMode")
              setIsAuthenticated(false)
              router.push("/")
            }}
            className="gap-2 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{totalAdmins}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Scripts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{totalScripts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Banned Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-destructive">{bannedUsers}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-2">
              <Shield className="w-4 h-4" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="scripts" className="gap-2">
              <Code2 className="w-4 h-4" />
              Scripts
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Zap className="w-4 h-4" />
              Permissions
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Username</th>
                          <th className="px-4 py-2 text-left font-semibold">Email</th>
                          <th className="px-4 py-2 text-left font-semibold">Joined</th>
                          <th className="px-4 py-2 text-left font-semibold">Status</th>
                          <th className="px-4 py-2 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium">{user.username}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{user.email}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${user.is_banned ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-700 dark:text-green-400"}`}
                              >
                                {user.is_banned ? "Banned" : "Active"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBanUser(user.id, user.is_banned)}
                                  className="gap-1 text-xs bg-transparent"
                                >
                                  <Ban className="w-3 h-3" />
                                  {user.is_banned ? "Unban" : "Ban"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="gap-1 text-xs"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>Admin Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Create Admin Form */}
                <div className="p-4 border border-border rounded-lg bg-card">
                  <h3 className="font-semibold mb-4">Create New Admin</h3>
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">User Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="user@example.com"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                          id="role"
                          value={newAdminRole}
                          onChange={(e) => setNewAdminRole(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="moderator">Moderator</option>
                          <option value="content_manager">Content Manager</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button type="submit" className="w-full gap-2">
                          <Plus className="w-4 h-4" />
                          Create Admin
                        </Button>
                      </div>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                  </form>
                </div>

                {/* Existing Admins */}
                <div>
                  <h3 className="font-semibold mb-4">Current Admins</h3>
                  <div className="space-y-3">
                    {adminUsers.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No admins yet</p>
                    ) : (
                      adminUsers.map((admin) => (
                        <div
                          key={admin.id}
                          className="p-3 border border-border rounded flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-sm">{admin.profiles?.username}</p>
                            <p className="text-xs text-muted-foreground">{admin.profiles?.email}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">
                              {admin.role_id}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scripts Tab */}
          <TabsContent value="scripts">
            <Card>
              <CardHeader>
                <CardTitle>Script Management</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Title</th>
                          <th className="px-4 py-2 text-left font-semibold">Author</th>
                          <th className="px-4 py-2 text-left font-semibold">Language</th>
                          <th className="px-4 py-2 text-left font-semibold">Views</th>
                          <th className="px-4 py-2 text-left font-semibold">Created</th>
                          <th className="px-4 py-2 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {scripts.map((script) => (
                          <tr key={script.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium text-xs line-clamp-1">{script.title}</td>
                            <td className="px-4 py-3 text-xs">{script.profiles?.username}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-secondary/10 text-secondary-foreground text-xs rounded">
                                {script.language}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs">{script.views_count}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {new Date(script.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteScript(script.id)}
                                className="gap-1 text-xs"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Permission Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold mb-4">Available Permissions</h3>
                    {[
                      { name: "ban_user", desc: "Can ban/unban users" },
                      { name: "delete_script", desc: "Can delete any script" },
                      { name: "delete_comment", desc: "Can delete any comment" },
                      { name: "create_admin", desc: "Can create new admin accounts" },
                      { name: "manage_permissions", desc: "Can manage admin permissions" },
                      { name: "view_analytics", desc: "Can view platform analytics" },
                    ].map((perm) => (
                      <div key={perm.name} className="p-3 border border-border rounded">
                        <p className="font-medium text-sm">{perm.name}</p>
                        <p className="text-xs text-muted-foreground">{perm.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold mb-4">Default Roles</h3>
                    {[
                      {
                        name: "Super Admin",
                        perms: "All permissions",
                        desc: "Full access to all features",
                      },
                      {
                        name: "Moderator",
                        perms: "ban_user, delete_script, delete_comment",
                        desc: "Can manage content and users",
                      },
                      {
                        name: "Content Manager",
                        perms: "delete_script, delete_comment",
                        desc: "Can manage scripts and comments",
                      },
                    ].map((role) => (
                      <div key={role.name} className="p-3 border border-border rounded">
                        <p className="font-medium text-sm">{role.name}</p>
                        <p className="text-xs text-muted-foreground mb-2">{role.desc}</p>
                        <p className="text-xs text-primary font-mono bg-primary/5 p-2 rounded">{role.perms}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
