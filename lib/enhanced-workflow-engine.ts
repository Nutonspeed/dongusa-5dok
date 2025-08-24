import { logger } from "./logger"
import { analytics } from "./analytics-service"

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: "sales" | "marketing" | "inventory" | "customer_service" | "finance" | "operations" | "hr"
  icon: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  variables: WorkflowVariable[]
  isTemplate: boolean
  tags: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedSetupTime: number // minutes
}

export interface WorkflowNode {
  id: string
  type:
    | "trigger"
    | "condition"
    | "action"
    | "approval"
    | "delay"
    | "webhook"
    | "email"
    | "sms"
    | "database"
    | "integration"
  name: string
  description: string
  position: { x: number; y: number }
  config: Record<string, any>
  inputs: WorkflowPort[]
  outputs: WorkflowPort[]
  status?: "idle" | "running" | "completed" | "failed" | "waiting"
}

export interface WorkflowConnection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
  condition?: string
}

export interface WorkflowPort {
  id: string
  name: string
  type: "input" | "output"
  dataType: "any" | "string" | "number" | "boolean" | "object" | "array"
  required: boolean
}

export interface WorkflowVariable {
  id: string
  name: string
  type: "string" | "number" | "boolean" | "object"
  defaultValue: any
  description: string
  isRequired: boolean
}

export interface ApprovalRequest {
  id: string
  workflowId: string
  executionId: string
  nodeId: string
  requesterId: string
  approverId: string
  title: string
  description: string
  data: Record<string, any>
  status: "pending" | "approved" | "rejected" | "expired"
  createdAt: string
  respondedAt?: string
  expiresAt: string
  priority: "low" | "medium" | "high" | "urgent"
}

export interface BusinessProcessTemplate {
  id: string
  name: string
  description: string
  industry: string[]
  processType: "approval" | "notification" | "data_processing" | "integration" | "customer_journey"
  workflow: WorkflowTemplate
  benefits: string[]
  requirements: string[]
  setupInstructions: string[]
}

export class EnhancedWorkflowEngine {
  private templates: WorkflowTemplate[] = []
  private businessProcesses: BusinessProcessTemplate[] = []
  private approvalRequests: ApprovalRequest[] = []
  private integrations: Map<string, any> = new Map()

  constructor() {
    this.initializeTemplates()
    this.initializeBusinessProcesses()
    this.setupIntegrations()
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: "customer_onboarding",
        name: "Customer Onboarding Process",
        description: "Automated customer onboarding with welcome emails, account setup, and follow-up",
        category: "customer_service",
        icon: "Users",
        difficulty: "beginner",
        estimatedSetupTime: 15,
        isTemplate: true,
        tags: ["onboarding", "email", "automation"],
        variables: [
          {
            id: "welcome_delay",
            name: "Welcome Email Delay",
            type: "number",
            defaultValue: 60,
            description: "Minutes to wait before sending welcome email",
            isRequired: false,
          },
        ],
        nodes: [
          {
            id: "trigger_1",
            type: "trigger",
            name: "New Customer Registration",
            description: "Triggers when a new customer registers",
            position: { x: 100, y: 100 },
            config: { event: "customer_registered" },
            inputs: [],
            outputs: [{ id: "out_1", name: "Customer Data", type: "output", dataType: "object", required: true }],
          },
          {
            id: "delay_1",
            type: "delay",
            name: "Wait Period",
            description: "Wait before sending welcome email",
            position: { x: 300, y: 100 },
            config: { duration: "{{welcome_delay}}", unit: "minutes" },
            inputs: [{ id: "in_1", name: "Input", type: "input", dataType: "any", required: true }],
            outputs: [{ id: "out_1", name: "Output", type: "output", dataType: "any", required: true }],
          },
          {
            id: "email_1",
            type: "email",
            name: "Welcome Email",
            description: "Send welcome email to new customer",
            position: { x: 500, y: 100 },
            config: {
              template: "welcome_email",
              subject: "Welcome to {{company_name}}!",
              personalizeContent: true,
            },
            inputs: [{ id: "in_1", name: "Customer", type: "input", dataType: "object", required: true }],
            outputs: [{ id: "out_1", name: "Email Sent", type: "output", dataType: "boolean", required: true }],
          },
        ],
        connections: [
          {
            id: "conn_1",
            sourceNodeId: "trigger_1",
            sourcePortId: "out_1",
            targetNodeId: "delay_1",
            targetPortId: "in_1",
          },
          {
            id: "conn_2",
            sourceNodeId: "delay_1",
            sourcePortId: "out_1",
            targetNodeId: "email_1",
            targetPortId: "in_1",
          },
        ],
      },
      {
        id: "order_fulfillment",
        name: "Order Fulfillment Process",
        description: "Complete order processing from payment to shipping",
        category: "operations",
        icon: "Package",
        difficulty: "intermediate",
        estimatedSetupTime: 30,
        isTemplate: true,
        tags: ["orders", "fulfillment", "shipping", "inventory"],
        variables: [
          {
            id: "auto_approve_limit",
            name: "Auto Approval Limit",
            type: "number",
            defaultValue: 5000,
            description: "Orders below this amount are auto-approved",
            isRequired: true,
          },
        ],
        nodes: [
          {
            id: "trigger_1",
            type: "trigger",
            name: "Order Placed",
            description: "Triggers when a new order is placed",
            position: { x: 100, y: 100 },
            config: { event: "order_placed" },
            inputs: [],
            outputs: [{ id: "out_1", name: "Order Data", type: "output", dataType: "object", required: true }],
          },
          {
            id: "condition_1",
            type: "condition",
            name: "Check Order Amount",
            description: "Check if order needs approval",
            position: { x: 300, y: 100 },
            config: { condition: "order.total > {{auto_approve_limit}}" },
            inputs: [{ id: "in_1", name: "Order", type: "input", dataType: "object", required: true }],
            outputs: [
              { id: "out_true", name: "Needs Approval", type: "output", dataType: "object", required: false },
              { id: "out_false", name: "Auto Approve", type: "output", dataType: "object", required: false },
            ],
          },
          {
            id: "approval_1",
            type: "approval",
            name: "Manager Approval",
            description: "Requires manager approval for high-value orders",
            position: { x: 500, y: 50 },
            config: {
              approvers: ["manager@company.com"],
              timeout: 24,
              escalation: ["director@company.com"],
            },
            inputs: [{ id: "in_1", name: "Order", type: "input", dataType: "object", required: true }],
            outputs: [
              { id: "out_approved", name: "Approved", type: "output", dataType: "object", required: false },
              { id: "out_rejected", name: "Rejected", type: "output", dataType: "object", required: false },
            ],
          },
          {
            id: "action_1",
            type: "action",
            name: "Process Payment",
            description: "Process payment for the order",
            position: { x: 700, y: 100 },
            config: { action: "process_payment", gateway: "stripe" },
            inputs: [{ id: "in_1", name: "Order", type: "input", dataType: "object", required: true }],
            outputs: [{ id: "out_1", name: "Payment Result", type: "output", dataType: "object", required: true }],
          },
        ],
        connections: [
          {
            id: "conn_1",
            sourceNodeId: "trigger_1",
            sourcePortId: "out_1",
            targetNodeId: "condition_1",
            targetPortId: "in_1",
          },
          {
            id: "conn_2",
            sourceNodeId: "condition_1",
            sourcePortId: "out_true",
            targetNodeId: "approval_1",
            targetPortId: "in_1",
          },
          {
            id: "conn_3",
            sourceNodeId: "condition_1",
            sourcePortId: "out_false",
            targetNodeId: "action_1",
            targetPortId: "in_1",
          },
          {
            id: "conn_4",
            sourceNodeId: "approval_1",
            sourcePortId: "out_approved",
            targetNodeId: "action_1",
            targetPortId: "in_1",
          },
        ],
      },
      {
        id: "inventory_restock",
        name: "Automated Inventory Restocking",
        description: "Automatically reorder inventory when stock levels are low",
        category: "inventory",
        icon: "Package",
        difficulty: "advanced",
        estimatedSetupTime: 45,
        isTemplate: true,
        tags: ["inventory", "automation", "suppliers", "purchasing"],
        variables: [
          {
            id: "reorder_threshold",
            name: "Reorder Threshold",
            type: "number",
            defaultValue: 10,
            description: "Minimum stock level before reordering",
            isRequired: true,
          },
        ],
        nodes: [
          {
            id: "trigger_1",
            type: "trigger",
            name: "Low Stock Alert",
            description: "Triggers when inventory falls below threshold",
            position: { x: 100, y: 100 },
            config: { event: "low_stock_detected", schedule: "daily" },
            inputs: [],
            outputs: [{ id: "out_1", name: "Product Data", type: "output", dataType: "object", required: true }],
          },
          {
            id: "database_1",
            type: "database",
            name: "Check Supplier Info",
            description: "Retrieve supplier information for the product",
            position: { x: 300, y: 100 },
            config: { query: "SELECT * FROM suppliers WHERE product_id = {{product.id}}" },
            inputs: [{ id: "in_1", name: "Product", type: "input", dataType: "object", required: true }],
            outputs: [{ id: "out_1", name: "Supplier Data", type: "output", dataType: "object", required: true }],
          },
          {
            id: "webhook_1",
            type: "webhook",
            name: "Create Purchase Order",
            description: "Send purchase order to supplier via API",
            position: { x: 500, y: 100 },
            config: {
              url: "{{supplier.api_endpoint}}/orders",
              method: "POST",
              headers: { Authorization: "Bearer {{supplier.api_key}}" },
            },
            inputs: [
              { id: "in_product", name: "Product", type: "input", dataType: "object", required: true },
              { id: "in_supplier", name: "Supplier", type: "input", dataType: "object", required: true },
            ],
            outputs: [{ id: "out_1", name: "Order Response", type: "output", dataType: "object", required: true }],
          },
        ],
        connections: [
          {
            id: "conn_1",
            sourceNodeId: "trigger_1",
            sourcePortId: "out_1",
            targetNodeId: "database_1",
            targetPortId: "in_1",
          },
          {
            id: "conn_2",
            sourceNodeId: "database_1",
            sourcePortId: "out_1",
            targetNodeId: "webhook_1",
            targetPortId: "in_supplier",
          },
        ],
      },
    ]
  }

  private initializeBusinessProcesses() {
    this.businessProcesses = [
      {
        id: "employee_onboarding",
        name: "Employee Onboarding Process",
        description: "Complete employee onboarding workflow with document collection, training, and setup",
        industry: ["all"],
        processType: "approval",
        benefits: [
          "Reduce onboarding time by 60%",
          "Ensure compliance with all requirements",
          "Improve new employee experience",
          "Automate document collection and verification",
        ],
        requirements: [
          "HR management system integration",
          "Document storage system",
          "Email notification system",
          "Training platform access",
        ],
        setupInstructions: [
          "Configure HR system integration",
          "Set up document templates",
          "Define approval workflows",
          "Test with sample employee data",
        ],
        workflow: {
          id: "employee_onboarding_workflow",
          name: "Employee Onboarding Workflow",
          description: "Automated employee onboarding process",
          category: "hr",
          icon: "Users",
          difficulty: "intermediate",
          estimatedSetupTime: 60,
          isTemplate: true,
          tags: ["hr", "onboarding", "compliance"],
          variables: [],
          nodes: [],
          connections: [],
        },
      },
      {
        id: "invoice_approval",
        name: "Invoice Approval Process",
        description: "Multi-level invoice approval workflow with automatic routing and escalation",
        industry: ["all"],
        processType: "approval",
        benefits: [
          "Reduce approval time by 50%",
          "Ensure proper authorization levels",
          "Maintain audit trail",
          "Prevent duplicate payments",
        ],
        requirements: [
          "Accounting system integration",
          "User role management",
          "Email notification system",
          "Document management system",
        ],
        setupInstructions: [
          "Define approval hierarchy",
          "Set spending limits per role",
          "Configure escalation rules",
          "Test approval workflows",
        ],
        workflow: {
          id: "invoice_approval_workflow",
          name: "Invoice Approval Workflow",
          description: "Multi-level invoice approval process",
          category: "finance",
          icon: "DollarSign",
          difficulty: "intermediate",
          estimatedSetupTime: 45,
          isTemplate: true,
          tags: ["finance", "approval", "invoices"],
          variables: [],
          nodes: [],
          connections: [],
        },
      },
    ]
  }

  private setupIntegrations() {
    // Setup available integrations
    this.integrations.set("email", {
      name: "Email Service",
      type: "communication",
      config: { provider: "sendgrid", apiKey: process.env.SENDGRID_API_KEY },
      actions: ["send_email", "send_template", "add_to_list"],
    })

    this.integrations.set("sms", {
      name: "SMS Service",
      type: "communication",
      config: { provider: "twilio", apiKey: process.env.TWILIO_API_KEY },
      actions: ["send_sms", "send_bulk_sms"],
    })

    this.integrations.set("slack", {
      name: "Slack",
      type: "communication",
      config: { webhookUrl: process.env.SLACK_WEBHOOK_URL },
      actions: ["send_message", "create_channel", "invite_user"],
    })

    this.integrations.set("database", {
      name: "Database",
      type: "data",
      config: { connectionString: process.env.DATABASE_URL },
      actions: ["query", "insert", "update", "delete"],
    })

    this.integrations.set("stripe", {
      name: "Stripe",
      type: "payment",
      config: { apiKey: process.env.STRIPE_SECRET_KEY },
      actions: ["create_payment", "refund_payment", "create_customer"],
    })
  }

  // Template Management
  async getWorkflowTemplates(category?: string, difficulty?: string): Promise<WorkflowTemplate[]> {
    let filtered = this.templates

    if (category) {
      filtered = filtered.filter((t) => t.category === category)
    }

    if (difficulty) {
      filtered = filtered.filter((t) => t.difficulty === difficulty)
    }

    return filtered
  }

  async createWorkflowFromTemplate(
    templateId: string,
    customizations?: Partial<WorkflowTemplate>,
  ): Promise<WorkflowTemplate> {
    const template = this.templates.find((t) => t.id === templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    const newWorkflow: WorkflowTemplate = {
      ...template,
      id: `workflow_${Date.now()}`,
      name: customizations?.name || `${template.name} (Copy)`,
      isTemplate: false,
      ...customizations,
    }

    // Track template usage
    analytics.trackEvent("template_used", "workflow", templateId, 1, {
      templateName: template.name,
      category: template.category,
    })

    return newWorkflow
  }

  // Business Process Management
  async getBusinessProcessTemplates(industry?: string, processType?: string): Promise<BusinessProcessTemplate[]> {
    let filtered = this.businessProcesses

    if (industry) {
      filtered = filtered.filter((p) => p.industry.includes(industry) || p.industry.includes("all"))
    }

    if (processType) {
      filtered = filtered.filter((p) => p.processType === processType)
    }

    return filtered
  }

  async deployBusinessProcess(processId: string, configuration: Record<string, any>): Promise<WorkflowTemplate> {
    const process = this.businessProcesses.find((p) => p.id === processId)
    if (!process) {
      throw new Error(`Business process ${processId} not found`)
    }

    // Create workflow from business process template
    const workflow = await this.createWorkflowFromTemplate(process.workflow.id, {
      name: process.name,
      description: process.description,
    })

    // Apply configuration
    workflow.variables.forEach((variable) => {
      if (configuration[variable.name]) {
        variable.defaultValue = configuration[variable.name]
      }
    })

    logger.info(`Deployed business process: ${process.name}`)
    return workflow
  }

  // Approval Management
  async createApprovalRequest(request: Omit<ApprovalRequest, "id" | "createdAt" | "status">): Promise<ApprovalRequest> {
    const approvalRequest: ApprovalRequest = {
      ...request,
      id: `approval_${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    this.approvalRequests.push(approvalRequest)

    // Send notification to approver
    await this.notifyApprover(approvalRequest)

    // Set up expiration timer
    setTimeout(() => {
      this.expireApprovalRequest(approvalRequest.id)
    }, new Date(approvalRequest.expiresAt).getTime() - Date.now())

    return approvalRequest
  }

  async processApprovalResponse(
    requestId: string,
    response: "approved" | "rejected",
    comment?: string,
  ): Promise<boolean> {
    const request = this.approvalRequests.find((r) => r.id === requestId)
    if (!request || request.status !== "pending") {
      return false
    }

    request.status = response
    request.respondedAt = new Date().toISOString()

    // Continue workflow execution based on response
    await this.continueWorkflowAfterApproval(request, response)

    // Track approval metrics
    analytics.trackEvent("approval_processed", "workflow", response, 1, {
      requestId,
      priority: request.priority,
      responseTime: Date.now() - new Date(request.createdAt).getTime(),
    })

    return true
  }

  async getApprovalRequests(approverId?: string, status?: string): Promise<ApprovalRequest[]> {
    let filtered = this.approvalRequests

    if (approverId) {
      filtered = filtered.filter((r) => r.approverId === approverId)
    }

    if (status) {
      filtered = filtered.filter((r) => r.status === status)
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Integration Management
  async executeIntegrationAction(integration: string, action: string, data: Record<string, any>): Promise<any> {
    const integrationConfig = this.integrations.get(integration)
    if (!integrationConfig) {
      throw new Error(`Integration ${integration} not found`)
    }

    if (!integrationConfig.actions.includes(action)) {
      throw new Error(`Action ${action} not supported by ${integration}`)
    }

    // Execute integration action based on type
    switch (integration) {
      case "email":
        return await this.executeEmailAction(action, data, integrationConfig.config)
      case "sms":
        return await this.executeSMSAction(action, data, integrationConfig.config)
      case "slack":
        return await this.executeSlackAction(action, data, integrationConfig.config)
      case "database":
        return await this.executeDatabaseAction(action, data, integrationConfig.config)
      case "stripe":
        return await this.executeStripeAction(action, data, integrationConfig.config)
      default:
        throw new Error(`Integration ${integration} not implemented`)
    }
  }

  private async executeEmailAction(action: string, data: Record<string, any>, config: any): Promise<any> {
    // Mock email integration
    logger.info(`Executing email action: ${action}`, data)
    return { success: true, messageId: `email_${Date.now()}` }
  }

  private async executeSMSAction(action: string, data: Record<string, any>, config: any): Promise<any> {
    // Mock SMS integration
    logger.info(`Executing SMS action: ${action}`, data)
    return { success: true, messageId: `sms_${Date.now()}` }
  }

  private async executeSlackAction(action: string, data: Record<string, any>, config: any): Promise<any> {
    // Mock Slack integration
    logger.info(`Executing Slack action: ${action}`, data)
    return { success: true, timestamp: Date.now() }
  }

  private async executeDatabaseAction(action: string, data: Record<string, any>, config: any): Promise<any> {
    // Mock database integration
    logger.info(`Executing database action: ${action}`, data)
    return { success: true, rowsAffected: 1 }
  }

  private async executeStripeAction(action: string, data: Record<string, any>, config: any): Promise<any> {
    // Mock Stripe integration
    logger.info(`Executing Stripe action: ${action}`, data)
    return { success: true, transactionId: `stripe_${Date.now()}` }
  }

  // Helper methods
  private async notifyApprover(request: ApprovalRequest): Promise<void> {
    // Send email notification to approver
    await this.executeIntegrationAction("email", "send_email", {
      to: request.approverId,
      subject: `Approval Required: ${request.title}`,
      template: "approval_request",
      data: request,
    })
  }

  private async expireApprovalRequest(requestId: string): Promise<void> {
    const request = this.approvalRequests.find((r) => r.id === requestId)
    if (request && request.status === "pending") {
      request.status = "expired"
      logger.info(`Approval request ${requestId} expired`)
    }
  }

  private async continueWorkflowAfterApproval(
    request: ApprovalRequest,
    response: "approved" | "rejected",
  ): Promise<void> {
    // Continue workflow execution based on approval response
    logger.info(`Continuing workflow ${request.workflowId} after approval: ${response}`)
  }

  // Analytics and Reporting
  async getWorkflowAnalytics(dateRange?: { start: string; end: string }) {
    return {
      totalTemplates: this.templates.length,
      templatesByCategory: this.getTemplatesByCategory(),
      templatesByDifficulty: this.getTemplatesByDifficulty(),
      businessProcesses: this.businessProcesses.length,
      pendingApprovals: this.approvalRequests.filter((r) => r.status === "pending").length,
      approvalMetrics: this.getApprovalMetrics(),
      integrationUsage: this.getIntegrationUsage(),
    }
  }

  private getTemplatesByCategory() {
    const categories = new Map<string, number>()
    this.templates.forEach((template) => {
      categories.set(template.category, (categories.get(template.category) || 0) + 1)
    })
    return Array.from(categories.entries()).map(([category, count]) => ({ category, count }))
  }

  private getTemplatesByDifficulty() {
    const difficulties = new Map<string, number>()
    this.templates.forEach((template) => {
      difficulties.set(template.difficulty, (difficulties.get(template.difficulty) || 0) + 1)
    })
    return Array.from(difficulties.entries()).map(([difficulty, count]) => ({ difficulty, count }))
  }

  private getApprovalMetrics() {
    const total = this.approvalRequests.length
    const approved = this.approvalRequests.filter((r) => r.status === "approved").length
    const rejected = this.approvalRequests.filter((r) => r.status === "rejected").length
    const pending = this.approvalRequests.filter((r) => r.status === "pending").length
    const expired = this.approvalRequests.filter((r) => r.status === "expired").length

    return {
      total,
      approved,
      rejected,
      pending,
      expired,
      approvalRate: total > 0 ? (approved / total) * 100 : 0,
    }
  }

  private getIntegrationUsage() {
    return Array.from(this.integrations.entries()).map(([key, integration]) => ({
      name: integration.name,
      type: integration.type,
      actionsCount: integration.actions.length,
    }))
  }
}

export const enhancedWorkflowEngine = new EnhancedWorkflowEngine()

