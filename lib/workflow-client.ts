export interface Workflow {
  id: string
  name: string
  description: string
  category: "sales" | "marketing" | "inventory" | "customer_service" | "finance" | "operations"
  status: "draft" | "active" | "paused" | "archived"
  version: number
  created_by: string
  created_at: string
  updated_at: string
  // UI expects nodes and execution_stats to be present
  nodes: any[]
  execution_stats: {
    total_executions: number
    successful_executions: number
    average_duration: number
  }
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  status: "running" | "completed" | "failed" | "cancelled" | "waiting_approval"
  started_at: string
  completed_at?: string
  duration?: number
  trigger_data: any
  current_node?: string
  variables: Record<string, any>
  error_message?: string
}

const API = "/api/admin/workflow"

export const workflowAutomation = {
  async getWorkflows(): Promise<Workflow[]> {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "workflows" }),
    })
    return res.json()
  },
  async getExecutions(): Promise<WorkflowExecution[]> {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "executions" }),
    })
    return res.json()
  },
  async getWorkflowAnalytics(workflowId: string) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "analytics", workflowId }),
    })
    return res.json()
  },
}
