"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WorkflowAutomationDashboard from "@/components/workflow/WorkflowAutomationDashboard"
import VisualWorkflowBuilder from "@/components/workflow/VisualWorkflowBuilder"
import BusinessProcessTemplates from "@/components/workflow/BusinessProcessTemplates"

export default function WorkflowPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <div className="border-b bg-white px-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="p-6">
          <WorkflowAutomationDashboard />
        </TabsContent>

        <TabsContent value="builder" className="p-0">
          <VisualWorkflowBuilder />
        </TabsContent>

        <TabsContent value="templates" className="p-6">
          <BusinessProcessTemplates />
        </TabsContent>
      </Tabs>
    </div>
  )
}
