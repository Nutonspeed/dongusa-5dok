interface WorkflowNode {
  id: string
  type: "trigger" | "condition" | "action" | "approval" | "delay" | "webhook" | "email" | "sms"
  name: string
  config: any
  position: { x: number; y: number }
  connections: string[]
}

interface WorkflowTrigger {
  id: string
  type: "schedule" | "event" | "webhook" | "manual" | "condition_met"
  name: string
  config: {
    schedule?: string // cron expression
    event_type?: string
    webhook_url?: string
    conditions?: any[]
  }
  enabled: boolean
}

interface WorkflowAction {
  id: string
  type: "email" | "sms" | "database_update" | "api_call" | "create_task" | "send_notification" | "generate_report"
  name: string
  config: any
  retry_config?: {
    max_retries: number
    retry_delay: number
    backoff_strategy: "linear" | "exponential"
  }
}

interface ApprovalStep {
  id: string
  name: string
  approvers: string[]
  approval_type: "any" | "all" | "majority"
  timeout_hours: number
  escalation_rules?: {
    escalate_to: string[]
    escalate_after_hours: number
  }
}

interface Workflow {
  id: string
  name: string
  description: string
  category: "sales" | "marketing" | "inventory" | "customer_service" | "finance" | "operations"
  status: "draft" | "active" | "paused" | "archived"
  version: number
  nodes: WorkflowNode[]
  triggers: WorkflowTrigger[]
  variables: Record<string, any>
  created_by: string
  created_at: string
  updated_at: string
  execution_stats: {
    total_executions: number
    successful_executions: number
    failed_executions: number
    average_duration: number
  }
}

interface WorkflowExecution {
  id: string
  workflow_id: string
  status: "running" | "completed" | "failed" | "cancelled" | "waiting_approval"
  started_at: string
  completed_at?: string
  duration?: number
  trigger_data: any
  execution_log: ExecutionLogEntry[]
  current_node?: string
  variables: Record<string, any>
  error_message?: string
}

interface ExecutionLogEntry {
  timestamp: string
  node_id: string
  node_type: string
  status: "started" | "completed" | "failed" | "skipped"
  message: string
  data?: any
  duration?: number
}

class ComprehensiveWorkflowAutomation {
  private workflows: Map<string, Workflow> = new Map()
  private executions: Map<string, WorkflowExecution> = new Map()
  private activeExecutions: Set<string> = new Set()

  // Workflow Management
  async createWorkflow(
    workflowData: Omit<Workflow, "id" | "created_at" | "updated_at" | "execution_stats">,
  ): Promise<Workflow> {
    const workflow: Workflow = {
      ...workflowData,
      id: `workflow_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_stats: {
        total_executions: 0,
        successful_executions: 0,
        failed_executions: 0,
        average_duration: 0,
      },
    }

    this.workflows.set(workflow.id, workflow)
    await this.saveWorkflow(workflow)
    return workflow
  }

  async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) throw new Error("Workflow not found")

    const updatedWorkflow = {
      ...workflow,
      ...updates,
      updated_at: new Date().toISOString(),
      version: workflow.version + 1,
    }

    this.workflows.set(workflowId, updatedWorkflow)
    await this.saveWorkflow(updatedWorkflow)
    return updatedWorkflow
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) throw new Error("Workflow not found")

    // Cancel any running executions
    const runningExecutions = Array.from(this.executions.values()).filter(
      (exec) => exec.workflow_id === workflowId && exec.status === "running",
    )

    for (const execution of runningExecutions) {
      await this.cancelExecution(execution.id)
    }

    this.workflows.delete(workflowId)
    await this.deleteWorkflowFromStorage(workflowId)
  }

  // Workflow Execution
  async executeWorkflow(workflowId: string, triggerData: any = {}): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) throw new Error("Workflow not found")
    if (workflow.status !== "active") throw new Error("Workflow is not active")

    const execution: WorkflowExecution = {
      id: `execution_${Date.now()}`,
      workflow_id: workflowId,
      status: "running",
      started_at: new Date().toISOString(),
      trigger_data: triggerData,
      execution_log: [],
      variables: { ...workflow.variables, ...triggerData },
    }

    this.executions.set(execution.id, execution)
    this.activeExecutions.add(execution.id)

    try {
      await this.runWorkflowExecution(execution, workflow)
    } catch (error) {
      execution.status = "failed"
      execution.error_message = error instanceof Error ? error.message : "Unknown error"
      execution.completed_at = new Date().toISOString()
      execution.duration = Date.now() - new Date(execution.started_at).getTime()
    } finally {
      this.activeExecutions.delete(execution.id)
      await this.saveExecution(execution)
      await this.updateWorkflowStats(workflow, execution)
    }

    return execution
  }

  private async runWorkflowExecution(execution: WorkflowExecution, workflow: Workflow): Promise<void> {
    const startNode = workflow.nodes.find((node) => node.type === "trigger")
    if (!startNode) throw new Error("No trigger node found")

    await this.executeNode(execution, workflow, startNode)
  }

  private async executeNode(execution: WorkflowExecution, workflow: Workflow, node: WorkflowNode): Promise<void> {
    const logEntry: ExecutionLogEntry = {
      timestamp: new Date().toISOString(),
      node_id: node.id,
      node_type: node.type,
      status: "started",
      message: `Executing ${node.type}: ${node.name}`,
    }

    execution.execution_log.push(logEntry)
    execution.current_node = node.id

    const startTime = Date.now()

    try {
      let shouldContinue = true

      switch (node.type) {
        case "trigger":
          shouldContinue = await this.executeTriggerNode(execution, node)
          break
        case "condition":
          shouldContinue = await this.executeConditionNode(execution, node)
          break
        case "action":
          await this.executeActionNode(execution, node)
          break
        case "approval":
          shouldContinue = await this.executeApprovalNode(execution, node)
          break
        case "delay":
          await this.executeDelayNode(execution, node)
          break
        case "webhook":
          await this.executeWebhookNode(execution, node)
          break
        case "email":
          await this.executeEmailNode(execution, node)
          break
        case "sms":
          await this.executeSMSNode(execution, node)
          break
        default:
          throw new Error(`Unknown node type: ${node.type}`)
      }

      logEntry.status = "completed"
      logEntry.duration = Date.now() - startTime
      logEntry.message = `Completed ${node.type}: ${node.name}`

      // Execute connected nodes
      if (shouldContinue && node.connections.length > 0) {
        for (const connectionId of node.connections) {
          const nextNode = workflow.nodes.find((n) => n.id === connectionId)
          if (nextNode) {
            await this.executeNode(execution, workflow, nextNode)
          }
        }
      }

      // Check if workflow is complete
      if (node.connections.length === 0) {
        execution.status = "completed"
        execution.completed_at = new Date().toISOString()
        execution.duration = Date.now() - new Date(execution.started_at).getTime()
      }
    } catch (error) {
      logEntry.status = "failed"
      logEntry.duration = Date.now() - startTime
      logEntry.message = `Failed ${node.type}: ${error instanceof Error ? error.message : "Unknown error"}`
      throw error
    }
  }

  // Node Execution Methods
  private async executeTriggerNode(execution: WorkflowExecution, node: WorkflowNode): Promise<boolean> {
    // Trigger nodes always continue execution
    return true
  }

  private async executeConditionNode(execution: WorkflowExecution, node: WorkflowNode): Promise<boolean> {
    const { conditions, operator = "and" } = node.config

    const results = await Promise.all(
      conditions.map(async (condition: any) => {
        return await this.evaluateCondition(execution, condition)
      }),
    )

    if (operator === "and") {
      return results.every((result) => result)
    } else if (operator === "or") {
      return results.some((result) => result)
    }

    return false
  }

  private async executeActionNode(execution: WorkflowExecution, node: WorkflowNode): Promise<void> {
    const { action_type, config } = node.config

    switch (action_type) {
      case "update_database":
        await this.updateDatabase(execution, config)
        break
      case "send_notification":
        await this.sendNotification(execution, config)
        break
      case "create_task":
        await this.createTask(execution, config)
        break
      case "api_call":
        await this.makeAPICall(execution, config)
        break
      case "generate_report":
        await this.generateReport(execution, config)
        break
      default:
        throw new Error(`Unknown action type: ${action_type}`)
    }
  }

  private async executeApprovalNode(execution: WorkflowExecution, node: WorkflowNode): Promise<boolean> {
    const { approvers, approval_type, timeout_hours } = node.config

    // Create approval request
    const approvalRequest = {
      id: `approval_${Date.now()}`,
      execution_id: execution.id,
      node_id: node.id,
      approvers,
      approval_type,
      timeout_hours,
      created_at: new Date().toISOString(),
      status: "pending",
      responses: [],
    }

    // Send approval notifications
    await this.sendApprovalNotifications(approvalRequest)

    // Set execution status to waiting
    execution.status = "waiting_approval"

    // In a real implementation, this would wait for approval responses
    // For now, we'll simulate approval after a short delay
    setTimeout(async () => {
      const approved = await this.checkApprovalStatus(approvalRequest)
      if (approved) {
        execution.status = "running"
        // Continue execution from next node
      } else {
        execution.status = "cancelled"
        execution.completed_at = new Date().toISOString()
      }
    }, 5000) // 5 second simulation

    return false // Don't continue immediately
  }

  private async executeDelayNode(execution: WorkflowExecution, node: WorkflowNode): Promise<void> {
    const { delay_type, delay_value } = node.config

    let delayMs = 0
    switch (delay_type) {
      case "seconds":
        delayMs = delay_value * 1000
        break
      case "minutes":
        delayMs = delay_value * 60 * 1000
        break
      case "hours":
        delayMs = delay_value * 60 * 60 * 1000
        break
      case "days":
        delayMs = delay_value * 24 * 60 * 60 * 1000
        break
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  private async executeWebhookNode(execution: WorkflowExecution, node: WorkflowNode): Promise<void> {
    const { url, method = "POST", headers = {}, body } = node.config

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        ...body,
        execution_id: execution.id,
        variables: execution.variables,
      }),
    })

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
    }

    const responseData = await response.json()
    execution.variables = { ...execution.variables, webhook_response: responseData }
  }

  private async executeEmailNode(execution: WorkflowExecution, node: WorkflowNode): Promise<void> {
    const { to, subject, template, variables } = node.config

    // Use existing email service
    const { emailService } = await import("@/lib/email")

    const processedSubject = this.processTemplate(subject, { ...execution.variables, ...variables })
    const processedContent = this.processTemplate(template, { ...execution.variables, ...variables })

    await emailService.sendBulkEmail([to], processedSubject, processedContent)
  }

  private async executeSMSNode(execution: WorkflowExecution, node: WorkflowNode): Promise<void> {
    const { to, message } = node.config

    // Use existing marketing automation SMS service
    const { marketingAutomation } = await import("@/lib/marketing-automation")

    const processedMessage = this.processTemplate(message, execution.variables)
    await marketingAutomation.sendSMS(to, processedMessage)
  }

  // Helper Methods
  private async evaluateCondition(execution: WorkflowExecution, condition: any): Promise<boolean> {
    const { field, operator, value } = condition

    const fieldValue = this.getVariableValue(execution.variables, field)

    switch (operator) {
      case "equals":
        return fieldValue === value
      case "not_equals":
        return fieldValue !== value
      case "greater_than":
        return Number(fieldValue) > Number(value)
      case "less_than":
        return Number(fieldValue) < Number(value)
      case "contains":
        return String(fieldValue).includes(String(value))
      case "starts_with":
        return String(fieldValue).startsWith(String(value))
      case "ends_with":
        return String(fieldValue).endsWith(String(value))
      case "is_empty":
        return !fieldValue || fieldValue === ""
      case "is_not_empty":
        return fieldValue && fieldValue !== ""
      default:
        return false
    }
  }

  private getVariableValue(variables: Record<string, any>, path: string): any {
    return path.split(".").reduce((obj, key) => obj?.[key], variables)
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getVariableValue(variables, path)
      return value !== undefined ? String(value) : match
    })
  }

  private async updateDatabase(execution: WorkflowExecution, config: any): Promise<void> {
    // Simulate database update
    console.log("Updating database:", config)
  }

  private async sendNotification(execution: WorkflowExecution, config: any): Promise<void> {
    // Simulate sending notification
    console.log("Sending notification:", config)
  }

  private async createTask(execution: WorkflowExecution, config: any): Promise<void> {
    // Simulate task creation
    console.log("Creating task:", config)
  }

  private async makeAPICall(execution: WorkflowExecution, config: any): Promise<void> {
    const { url, method, headers, body } = config

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`)
    }

    const responseData = await response.json()
    execution.variables = { ...execution.variables, api_response: responseData }
  }

  private async generateReport(execution: WorkflowExecution, config: any): Promise<void> {
    // Simulate report generation
    console.log("Generating report:", config)
  }

  private async sendApprovalNotifications(approvalRequest: any): Promise<void> {
    // Send notifications to approvers
    console.log("Sending approval notifications:", approvalRequest)
  }

  private async checkApprovalStatus(approvalRequest: any): Promise<boolean> {
    // Simulate approval check - in real implementation, this would check actual responses
    return Math.random() > 0.3 // 70% approval rate
  }

  // Workflow Analytics
  async getWorkflowAnalytics(workflowId: string, dateRange?: { start: string; end: string }) {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) throw new Error("Workflow not found")

    let executions = Array.from(this.executions.values()).filter((exec) => exec.workflow_id === workflowId)

    if (dateRange) {
      executions = executions.filter((exec) => exec.started_at >= dateRange.start && exec.started_at <= dateRange.end)
    }

    const totalExecutions = executions.length
    const successfulExecutions = executions.filter((exec) => exec.status === "completed").length
    const failedExecutions = executions.filter((exec) => exec.status === "failed").length
    const averageDuration = executions.reduce((sum, exec) => sum + (exec.duration || 0), 0) / totalExecutions

    const nodePerformance = workflow.nodes.map((node) => {
      const nodeExecutions = executions.flatMap((exec) => exec.execution_log.filter((log) => log.node_id === node.id))

      const nodeSuccessful = nodeExecutions.filter((log) => log.status === "completed").length
      const nodeFailed = nodeExecutions.filter((log) => log.status === "failed").length
      const nodeAverageDuration =
        nodeExecutions.reduce((sum, log) => sum + (log.duration || 0), 0) / nodeExecutions.length

      return {
        node_id: node.id,
        node_name: node.name,
        node_type: node.type,
        executions: nodeExecutions.length,
        successful: nodeSuccessful,
        failed: nodeFailed,
        success_rate: nodeExecutions.length > 0 ? (nodeSuccessful / nodeExecutions.length) * 100 : 0,
        average_duration: nodeAverageDuration || 0,
      }
    })

    return {
      workflow_id: workflowId,
      workflow_name: workflow.name,
      total_executions: totalExecutions,
      successful_executions: successfulExecutions,
      failed_executions: failedExecutions,
      success_rate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
      average_duration: averageDuration || 0,
      node_performance: nodePerformance,
      execution_trend: this.getExecutionTrend(executions),
    }
  }

  private getExecutionTrend(executions: WorkflowExecution[]) {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last30Days.map((date) => {
      const dayExecutions = executions.filter((exec) => exec.started_at.startsWith(date))
      return {
        date,
        total: dayExecutions.length,
        successful: dayExecutions.filter((exec) => exec.status === "completed").length,
        failed: dayExecutions.filter((exec) => exec.status === "failed").length,
      }
    })
  }

  // Utility Methods
  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId)
    if (!execution) throw new Error("Execution not found")

    execution.status = "cancelled"
    execution.completed_at = new Date().toISOString()
    execution.duration = Date.now() - new Date(execution.started_at).getTime()

    this.activeExecutions.delete(executionId)
    await this.saveExecution(execution)
  }

  async getWorkflows(category?: string): Promise<Workflow[]> {
    let workflows = Array.from(this.workflows.values())
    if (category) {
      workflows = workflows.filter((w) => w.category === category)
    }
    return workflows.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }

  async getExecutions(workflowId?: string): Promise<WorkflowExecution[]> {
    let executions = Array.from(this.executions.values())
    if (workflowId) {
      executions = executions.filter((exec) => exec.workflow_id === workflowId)
    }
    return executions.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
  }

  // Storage Methods (placeholder implementations)
  private async saveWorkflow(workflow: Workflow): Promise<void> {
    // In a real implementation, this would save to database
    console.log("Saving workflow:", workflow.id)
  }

  private async deleteWorkflowFromStorage(workflowId: string): Promise<void> {
    // In a real implementation, this would delete from database
    console.log("Deleting workflow:", workflowId)
  }

  private async saveExecution(execution: WorkflowExecution): Promise<void> {
    // In a real implementation, this would save to database
    console.log("Saving execution:", execution.id)
  }

  private async updateWorkflowStats(workflow: Workflow, execution: WorkflowExecution): Promise<void> {
    workflow.execution_stats.total_executions++
    if (execution.status === "completed") {
      workflow.execution_stats.successful_executions++
    } else if (execution.status === "failed") {
      workflow.execution_stats.failed_executions++
    }

    if (execution.duration) {
      const totalDuration =
        workflow.execution_stats.average_duration * (workflow.execution_stats.total_executions - 1) + execution.duration
      workflow.execution_stats.average_duration = totalDuration / workflow.execution_stats.total_executions
    }

    await this.saveWorkflow(workflow)
  }
}

export const workflowAutomation = new ComprehensiveWorkflowAutomation()
export type { Workflow, WorkflowExecution, WorkflowNode, WorkflowTrigger, WorkflowAction, ApprovalStep }
