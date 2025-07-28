"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  AlertCircle,
  CheckCircle,
  Hash,
  TrendingUp,
  Filter,
} from "lucide-react"
import { billDatabase } from "@/lib/enhanced-bill-database"
import { toast } from "@/hooks/use-toast"

interface TagUsage {
  tag: string
  count: number
  recentlyUsed: Date
  associatedBills: string[]
}

export default function TagsManagementPage() {
  const [tags, setTags] = useState<string[]>([])
  const [tagUsage, setTagUsage] = useState<TagUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagDescription, setNewTagDescription] = useState("")
  const [editingTag, setEditingTag] = useState<string>("")
  const [editTagName, setEditTagName] = useState("")
  const [editTagDescription, setEditTagDescription] = useState("")

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const [tagsData, billsData] = await Promise.all([billDatabase.getCustomTags(), billDatabase.getBills()])

      setTags(tagsData)

      // Calculate tag usage statistics
      const usage: TagUsage[] = tagsData.map((tag) => {
        const associatedBills = billsData.filter((bill) => bill.tags.includes(tag))
        const recentlyUsed =
          associatedBills.length > 0
            ? new Date(Math.max(...associatedBills.map((bill) => bill.updatedAt.getTime())))
            : new Date(0)

        return {
          tag,
          count: associatedBills.length,
          recentlyUsed,
          associatedBills: associatedBills.map((bill) => bill.id),
        }
      })

      setTagUsage(usage.sort((a, b) => b.count - a.count))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tags",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tag name",
        variant: "destructive",
      })
      return
    }

    if (tags.includes(newTagName.trim())) {
      toast({
        title: "Error",
        description: "Tag already exists",
        variant: "destructive",
      })
      return
    }

    try {
      await billDatabase.addCustomTag(newTagName.trim())
      await loadTags()
      setNewTagName("")
      setNewTagDescription("")
      setIsCreateDialogOpen(false)
      toast({
        title: "Success",
        description: "Tag created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      })
    }
  }

  const handleEditTag = async () => {
    if (!editTagName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tag name",
        variant: "destructive",
      })
      return
    }

    if (editTagName.trim() !== editingTag && tags.includes(editTagName.trim())) {
      toast({
        title: "Error",
        description: "Tag name already exists",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real implementation, you would update the tag name in all associated bills
      // For now, we'll just update the tag list
      await billDatabase.removeCustomTag(editingTag)
      await billDatabase.addCustomTag(editTagName.trim())
      await loadTags()
      setEditingTag("")
      setEditTagName("")
      setEditTagDescription("")
      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Tag updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tag",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTag = async (tagName: string) => {
    const usage = tagUsage.find((u) => u.tag === tagName)

    if (usage && usage.count > 0) {
      const confirmed = confirm(
        `This tag is used in ${usage.count} bill(s). Deleting it will remove the tag from all associated bills. Are you sure you want to continue?`,
      )
      if (!confirmed) return
    }

    try {
      await billDatabase.removeCustomTag(tagName)
      await loadTags()
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (tagName: string) => {
    setEditingTag(tagName)
    setEditTagName(tagName)
    setEditTagDescription("")
    setIsEditDialogOpen(true)
  }

  const filteredTags = tagUsage.filter((usage) => usage.tag.toLowerCase().includes(searchTerm.toLowerCase()))

  const getUsageColor = (count: number) => {
    if (count === 0) return "bg-gray-100 text-gray-800"
    if (count < 5) return "bg-blue-100 text-blue-800"
    if (count < 10) return "bg-green-100 text-green-800"
    if (count < 20) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const formatLastUsed = (date: Date) => {
    if (date.getTime() === 0) return "Never"
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tags Management</h1>
          <p className="text-gray-600 mt-1">Create and manage custom tags for bill classification and organization</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tagName">Tag Name</Label>
                <Input
                  id="tagName"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="tagDescription">Description (Optional)</Label>
                <Textarea
                  id="tagDescription"
                  value={newTagDescription}
                  onChange={(e) => setNewTagDescription(e.target.value)}
                  placeholder="Describe what this tag represents..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setNewTagName("")
                    setNewTagDescription("")
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTag}>Create Tag</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tags</p>
                <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tags</p>
                <p className="text-2xl font-bold text-gray-900">{tagUsage.filter((u) => u.count > 0).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unused Tags</p>
                <p className="text-2xl font-bold text-gray-900">{tagUsage.filter((u) => u.count === 0).length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Most Used</p>
                <p className="text-lg font-bold text-gray-900">{tagUsage.length > 0 ? tagUsage[0].tag : "None"}</p>
                <p className="text-sm text-gray-500">{tagUsage.length > 0 ? `${tagUsage[0].count} uses` : ""}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tags Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            All Tags ({filteredTags.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag Name</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.map((usage) => (
                <TableRow key={usage.tag} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="font-medium">
                        {usage.tag}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getUsageColor(usage.count)}>
                      {usage.count} {usage.count === 1 ? "use" : "uses"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{formatLastUsed(usage.recentlyUsed)}</span>
                  </TableCell>
                  <TableCell>
                    {usage.count > 0 ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Unused</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(usage.tag)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Tag
                        </DropdownMenuItem>
                        {usage.count > 0 && (
                          <DropdownMenuItem>
                            <Search className="mr-2 h-4 w-4" />
                            View Bills ({usage.count})
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTag(usage.tag)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Tag
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTags.length === 0 && (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No tags found" : "No tags created yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search term."
                  : "Create your first tag to start organizing your bills."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Tag
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Tag Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTagName">Tag Name</Label>
              <Input
                id="editTagName"
                value={editTagName}
                onChange={(e) => setEditTagName(e.target.value)}
                placeholder="Enter tag name..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editTagDescription">Description (Optional)</Label>
              <Textarea
                id="editTagDescription"
                value={editTagDescription}
                onChange={(e) => setEditTagDescription(e.target.value)}
                placeholder="Describe what this tag represents..."
                rows={3}
                className="mt-1"
              />
            </div>
            {tagUsage.find((u) => u.tag === editingTag)?.count > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This tag is currently used in {tagUsage.find((u) => u.tag === editingTag)?.count} bill(s). Changing
                  the name will update all associated bills.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingTag("")
                  setEditTagName("")
                  setEditTagDescription("")
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditTag}>Update Tag</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Usage Analytics */}
      {tagUsage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Tag Usage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Most Popular Tags</h4>
                <div className="space-y-2">
                  {tagUsage.slice(0, 5).map((usage, index) => (
                    <div key={usage.tag} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-xs font-medium text-pink-600">
                          {index + 1}
                        </div>
                        <Badge variant="outline">{usage.tag}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{usage.count} uses</div>
                        <div className="text-xs text-gray-500">Last used {formatLastUsed(usage.recentlyUsed)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {tagUsage.filter((u) => u.count === 0).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Unused Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {tagUsage
                      .filter((u) => u.count === 0)
                      .map((usage) => (
                        <Badge key={usage.tag} variant="secondary" className="text-gray-600">
                          {usage.tag}
                        </Badge>
                      ))}
                  </div>
                  <Alert className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Consider removing unused tags to keep your tag list organized and relevant.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
