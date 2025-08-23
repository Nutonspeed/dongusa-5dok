"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Bug, TrendingUp, AlertTriangle, Search, Star } from "lucide-react"
import { feedbackBugManager } from "@/lib/feedback-bug-management"

export default function FeedbackManagementPage() {
  const [feedbackData, setFeedbackData] = useState<any>(null)
  const [bugReports, setBugReports] = useState<any[]>([])
  const [trends, setTrends] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [feedbackResponse, bugsResponse, trendsData] = await Promise.all([
        fetch("/api/feedback"),
        fetch("/api/bugs"),
        feedbackBugManager.getFeedbackTrends(30),
      ])

      const feedback = await feedbackResponse.json()
      const bugs = await bugsResponse.json()

      setFeedbackData(feedback)
      setBugReports(bugs.bugs || [])
      setTrends(trendsData)
    } catch (error) {
  // console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bugId: string, newStatus: string) => {
    const success = await feedbackBugManager.updateBugStatus(bugId, newStatus as any)
    if (success) {
      loadData() // Reload data
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      confirmed: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-purple-100 text-purple-800",
      testing: "bg-orange-100 text-orange-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    }
    return colors[severity as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const filteredBugs = bugReports.filter((bug) => {
    const matchesSearch =
      bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || bug.status === statusFilter
    const matchesPriority = priorityFilter === "all" || bug.severity === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback & Bug Management</h1>
          <p className="text-gray-600">จัดการความคิดเห็นและรายงานปัญหาจากผู้ใช้</p>
        </div>
        <Button onClick={loadData}>
          <TrendingUp className="w-4 h-4 mr-2" />
          รีเฟรชข้อมูล
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ความคิดเห็นทั้งหมด</p>
                <p className="text-2xl font-bold">{feedbackData?.stats?.totalFeedback || 0}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{feedbackData?.stats?.averageRating?.toFixed(1) || 0}</p>
                  <Star className="w-5 h-5 text-yellow-400 ml-1" />
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bug Reports</p>
                <p className="text-2xl font-bold">{bugReports.length}</p>
              </div>
              <Bug className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">
                  {bugReports.filter((b) => b.severity === "critical").length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feedback" className="space-y-6">
        <TabsList>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
          <TabsTrigger value="bugs">Bug Reports</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackData?.feedback?.slice(0, 10).map((feedback: any) => (
                  <div key={feedback.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{feedback.title}</h3>
                          <Badge variant="outline">{feedback.feedback_type}</Badge>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < feedback.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{feedback.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{feedback.email || "Anonymous"}</span>
                          <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
                          <span>{feedback.page_url}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bugs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="ค้นหา bug reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bug Reports List */}
          <div className="space-y-4">
            {filteredBugs.map((bug) => (
              <Card key={bug.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{bug.title}</h3>
                        <Badge className={getSeverityColor(bug.severity)}>{bug.severity}</Badge>
                        <Badge className={getStatusColor(bug.status)}>{bug.status}</Badge>
                        <span className="text-sm text-gray-500">Priority: {bug.priority}/10</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{bug.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                        <span>{bug.reporter_email || "Anonymous"}</span>
                        <span>{new Date(bug.created_at).toLocaleDateString()}</span>
                        <span>{bug.page_url}</span>
                      </div>
                      {bug.tags && bug.tags.length > 0 && (
                        <div className="flex items-center space-x-1 mb-3">
                          {bug.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select value={bug.status} onValueChange={(value) => handleStatusUpdate(bug.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {trends && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sentiment Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-green-600">Positive</span>
                        <span>{trends.sentimentDistribution?.positive || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Neutral</span>
                        <span>{trends.sentimentDistribution?.neutral || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Negative</span>
                        <span>{trends.sentimentDistribution?.negative || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {trends.topIssues?.slice(0, 5).map((issue: string, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span className="capitalize">{issue}</span>
                          <Badge variant="outline">{index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {trends.improvementSuggestions?.map((suggestion: string, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {suggestion}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
