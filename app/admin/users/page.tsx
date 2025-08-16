"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserPlus, Shield, Eye, EyeOff, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/app/contexts/AuthContext"

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: "admin" | "staff" | "customer"
  created_at: string
  last_login?: string
  status: "active" | "locked" | "pending"
  failed_attempts: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "staff" as "admin" | "staff",
  })
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const mockUsers: AdminUser[] = [
        {
          id: "admin-1",
          email: "admin@sofacover.com",
          full_name: "Super Admin",
          role: "admin",
          created_at: "2024-01-01T00:00:00Z",
          last_login: "2024-01-15T10:30:00Z",
          status: "active",
          failed_attempts: 0,
        },
        {
          id: "staff-1",
          email: "staff@sofacover.com",
          full_name: "Staff Member",
          role: "staff",
          created_at: "2024-01-05T00:00:00Z",
          last_login: "2024-01-14T15:20:00Z",
          status: "active",
          failed_attempts: 0,
        },
      ]
      setUsers(mockUsers)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createUser = async () => {
    if (!newUser.email || !newUser.full_name || !newUser.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    try {
      const createdUser: AdminUser = {
        id: `user-${Date.now()}`,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        created_at: new Date().toISOString(),
        status: "active",
        failed_attempts: 0,
      }

      setUsers((prev) => [...prev, createdUser])
      setNewUser({ email: "", full_name: "", password: "", role: "staff" })
      setShowCreateDialog(false)

      toast({
        title: "Success",
        description: `User ${newUser.email} created successfully`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create user",
      })
    }
  }

  const resetUserPassword = async (userId: string, email: string) => {
    try {
      toast({
        title: "Password Reset",
        description: `Password reset email sent to ${email}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset password",
      })
    }
  }

  const unlockUser = async (userId: string) => {
    try {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: "active" as const, failed_attempts: 0 } : u)),
      )

      toast({
        title: "Success",
        description: "User account unlocked successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unlock user",
      })
    }
  }

  const getStatusBadge = (status: string, failedAttempts: number) => {
    if (status === "locked" || failedAttempts >= 5) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Locked
        </Badge>
      )
    }
    if (status === "pending") {
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      )
    }
    return (
      <Badge variant="default">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      staff: "bg-blue-100 text-blue-800",
      customer: "bg-green-100 text-green-800",
    }

    return (
      <Badge className={colors[role as keyof typeof colors]}>
        {role === "admin" && <Shield className="w-3 h-3 mr-1" />}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage admin and staff accounts</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="user@sofacover.com"
                />
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, full_name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: "admin" | "staff") => setNewUser((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createUser}>Create User</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Only super admins can create new admin accounts. Staff accounts have limited permissions.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Admin & Staff Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Failed Attempts</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status, user.failed_attempts)}</TableCell>
                    <TableCell>{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</TableCell>
                    <TableCell>
                      <span className={user.failed_attempts >= 3 ? "text-red-600 font-medium" : ""}>
                        {user.failed_attempts}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {(user.status === "locked" || user.failed_attempts >= 5) && (
                          <Button size="sm" variant="outline" onClick={() => unlockUser(user.id)}>
                            Unlock
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => resetUserPassword(user.id, user.email)}>
                          Reset Password
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
