// NOTE: Boundary fix only. Do NOT restructure or remove existing UI.

import { NextResponse } from "next/server";
import { workflowAutomation } from "@/lib/comprehensive-workflow-automation";

export async function POST(req: Request) {
  const { action, workflowId } = await req.json();
  if (action === "workflows") {
    const data = await workflowAutomation.getWorkflows();
    return NextResponse.json(data);
  }
  if (action === "executions") {
    const data = await workflowAutomation.getExecutions();
    return NextResponse.json(data);
  }
  if (action === "analytics") {
    const data = await workflowAutomation.getWorkflowAnalytics(workflowId);
    return NextResponse.json(data);
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}

