// NOTE: Boundary fix only. Do NOT restructure or remove existing UI.

import type {
  Workflow,
  WorkflowExecution,
} from "./comprehensive-workflow-automation";

const API = "/api/admin/workflow";

export const workflowAutomation = {
  async getWorkflows(): Promise<Workflow[]> {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "workflows" }),
    });
    return res.json();
  },
  async getExecutions(): Promise<WorkflowExecution[]> {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "executions" }),
    });
    return res.json();
  },
  async getWorkflowAnalytics(workflowId: string) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "analytics", workflowId }),
    });
    return res.json();
  },
} as const;

export type { Workflow, WorkflowExecution };

