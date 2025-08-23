"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Package,
  MessageSquare,
  FileText,
  CheckCircle,
  Clock,
  Star,
  Download,
  Play,
  Search,
  Filter,
} from "lucide-react"
import { enhancedWorkflowEngine, type BusinessProcessTemplate } from "@/lib/enhanced-workflow-engine"

const PROCESS_ICONS: Record<string, any> = {
  approval: CheckCircle,
  notification: MessageSquare,
  data_processing: FileText,
  integration: Package,
  customer_journey: Users,
}

const INDUSTRY_OPTIONS = [
  { value: "all", label: "All Industries" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance & Banking" },
  { value: "technology", label: "Technology" },
  { value: "education", label: "Education" },
]

export default function BusinessProcessTemplates() {
  const [templates, setTemplates] = useState<BusinessProcessTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<BusinessProcessTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessProcessTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("all")
  const [selectedProcessType, setSelectedProcessType] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, searchTerm, selectedIndustry, selectedProcessType])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const templatesData = await enhancedWorkflowEngine.getBusinessProcessTemplates()
      setTemplates(templatesData)
    } catch (error) {
  // console.error("Error loading templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterTemplates = () => {
    let filtered = templates

    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedIndustry !== "all") {
      filtered = filtered.filter((template) => template.industry.includes(selectedIndustry))
    }

    if (selectedProcessType !== "all") {
      filtered = filtered.filter((template) => template.processType === selectedProcessType)
    }

    setFilteredTemplates(filtered)
  }

  const deployProcess = async (processId: string) => {
    try {
      const workflow = await enhancedWorkflowEngine.deployBusinessProcess(processId, {})
      alert(`Business process "${workflow.name}" deployed successfully!`)
    } catch (error) {
  // console.error("Error deploying process:", error)
      alert("Failed to deploy business process")
    }
  }

  const getProcessTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      approval: "bg-blue-100 text-blue-800",
      notification: "bg-green-100 text-green-800",
      data_processing: "bg-purple-100 text-purple-800",
      integration: "bg-orange-100 text-orange-800",
      customer_journey: "bg-pink-100 text-pink-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Process Templates</h1>
          <p className="text-gray-600 mt-1">Ready-to-use business process automation templates</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Templates
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedProcessType} onValueChange={setSelectedProcessType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Process Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="approval">Approval</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="data_processing">Data Processing</SelectItem>
            <SelectItem value="integration">Integration</SelectItem>
            <SelectItem value="customer_journey">Customer Journey</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const ProcessIcon = PROCESS_ICONS[template.processType] || FileText

          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <ProcessIcon className="w-8 h-8 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge className={getProcessTypeColor(template.processType)}>
                        {template.processType.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">4.8</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>

                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {template.benefits.slice(0, 2).map((benefit, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Industries:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.industry.slice(0, 3).map((industry) => (
                        <Badge key={industry} variant="outline" className="text-xs">
                          {industry === "all" ? "Universal" : industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{template.workflow.estimatedSetupTime} min setup</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>{template.workflow.nodes.length} steps</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setSelectedTemplate(template)} className="flex-1">
                    <Play className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deployProcess(template.id)}>
                    Deploy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const ProcessIcon = PROCESS_ICONS[selectedTemplate.processType] || FileText
                    return <ProcessIcon className="w-8 h-8 text-blue-600" />
                  })()}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                    <p className="text-gray-600">{selectedTemplate.description}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="p-6">
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="benefits">Benefits</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="setup">Setup Guide</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Process Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Process Type:</span>
                          <Badge className={getProcessTypeColor(selectedTemplate.processType)}>
                            {selectedTemplate.processType.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Setup Time:</span>
                          <span>{selectedTemplate.workflow.estimatedSetupTime} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Complexity:</span>
                          <Badge variant="outline">{selectedTemplate.workflow.difficulty}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Steps:</span>
                          <span>{selectedTemplate.workflow.nodes.length} nodes</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Industries</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.industry.map((industry) => (
                          <Badge key={industry} variant="outline">
                            {industry === "all" ? "Universal" : industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="benefits" className="space-y-4">
                  <h3 className="font-semibold">Key Benefits</h3>
                  <ul className="space-y-3">
                    {selectedTemplate.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="requirements" className="space-y-4">
                  <h3 className="font-semibold">Requirements</h3>
                  <ul className="space-y-3">
                    {selectedTemplate.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="setup" className="space-y-4">
                  <h3 className="font-semibold">Setup Instructions</h3>
                  <ol className="space-y-3">
                    {selectedTemplate.setupInstructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                          {index + 1}
                        </div>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 mt-6 pt-6 border-t">
                <Button onClick={() => deployProcess(selectedTemplate.id)} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Deploy This Process
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
