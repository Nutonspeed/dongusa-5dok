"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Save,
  Play,
  Settings,
  Trash2,
  Copy,
  Zap,
  GitBranch,
  Activity,
  Users,
  Timer,
  Mail,
  MessageSquare,
  Database,
  Webhook,
  Package,
} from "lucide-react"
import type { WorkflowTemplate, WorkflowNode } from "@/lib/enhanced-workflow-engine"

interface NodeType {
  type: string
  name: string
  icon: any
  color: string
  description: string
  category: "triggers" | "actions" | "logic" | "integrations"
}

const NODE_TYPES: NodeType[] = [
  // Triggers
  { type: "trigger", name: "Trigger", icon: Zap, color: "purple", description: "Start workflow", category: "triggers" },
  {
    type: "webhook",
    name: "Webhook",
    icon: Webhook,
    color: "indigo",
    description: "HTTP webhook",
    category: "triggers",
  },

  // Logic
  {
    type: "condition",
    name: "Condition",
    icon: GitBranch,
    color: "blue",
    description: "If/then logic",
    category: "logic",
  },
  { type: "delay", name: "Delay", icon: Timer, color: "gray", description: "Wait period", category: "logic" },
  {
    type: "approval",
    name: "Approval",
    icon: Users,
    color: "orange",
    description: "Human approval",
    category: "logic",
  },

  // Actions
  {
    type: "action",
    name: "Action",
    icon: Activity,
    color: "green",
    description: "Execute action",
    category: "actions",
  },
  { type: "email", name: "Email", icon: Mail, color: "red", description: "Send email", category: "actions" },
  { type: "sms", name: "SMS", icon: MessageSquare, color: "green", description: "Send SMS", category: "actions" },

  // Integrations
  {
    type: "database",
    name: "Database",
    icon: Database,
    color: "blue",
    description: "Database query",
    category: "integrations",
  },
  {
    type: "integration",
    name: "Integration",
    icon: Package,
    color: "purple",
    description: "External API",
    category: "integrations",
  },
]

export default function VisualWorkflowBuilder() {
  const [workflow, setWorkflow] = useState<WorkflowTemplate | null>(null)
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string; portId: string } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const createNewWorkflow = () => {
    const newWorkflow: WorkflowTemplate = {
      id: `workflow_${Date.now()}`,
      name: "New Workflow",
      description: "A new workflow",
      category: "operations",
      icon: "Activity",
      difficulty: "beginner",
      estimatedSetupTime: 15,
      isTemplate: false,
      tags: [],
      variables: [],
      nodes: [],
      connections: [],
    }
    setWorkflow(newWorkflow)
  }

  const addNode = useCallback(
    (nodeType: string, position: { x: number; y: number }) => {
      if (!workflow) return

      const nodeTypeConfig = NODE_TYPES.find((nt) => nt.type === nodeType)
      if (!nodeTypeConfig) return

      const newNode: WorkflowNode = {
        id: `node_${Date.now()}`,
        type: nodeType as any,
        name: nodeTypeConfig.name,
        description: nodeTypeConfig.description,
        position,
        config: {},
        inputs:
          nodeType === "trigger" ? [] : [{ id: "in_1", name: "Input", type: "input", dataType: "any", required: true }],
        outputs: [{ id: "out_1", name: "Output", type: "output", dataType: "any", required: true }],
      }

      setWorkflow((prev) =>
        prev
          ? {
              ...prev,
              nodes: [...prev.nodes, newNode],
            }
          : null,
      )
    },
    [workflow],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!draggedNodeType || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }

      addNode(draggedNodeType, position)
      setDraggedNodeType(null)
    },
    [draggedNodeType, addNode],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const getNodeIcon = (type: string) => {
    const nodeType = NODE_TYPES.find((nt) => nt.type === type)
    return nodeType?.icon || Activity
  }

  const getNodeColor = (type: string) => {
    const nodeType = NODE_TYPES.find((nt) => nt.type === type)
    return nodeType?.color || "gray"
  }

  const deleteNode = (nodeId: string) => {
    if (!workflow) return

    setWorkflow((prev) =>
      prev
        ? {
            ...prev,
            nodes: prev.nodes.filter((n) => n.id !== nodeId),
            connections: prev.connections.filter((c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId),
          }
        : null,
    )
  }

  const saveWorkflow = async () => {
    if (!workflow) return

    // In real implementation, save to backend
  // console.log("Saving workflow:", workflow)
    alert("Workflow saved successfully!")
  }

  const testWorkflow = async () => {
    if (!workflow) return

    // In real implementation, execute workflow
  // console.log("Testing workflow:", workflow)
    alert("Workflow test started!")
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar - Node Palette */}
      <div className="w-80 border-r bg-gray-50">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Workflow Builder</h3>
          <p className="text-sm text-gray-600">Drag nodes to canvas</p>
        </div>

        <Tabs defaultValue="nodes" className="h-full">
          <TabsList className="grid w-full grid-cols-2 m-4">
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="px-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {["triggers", "logic", "actions", "integrations"].map((category) => (
                <div key={category} className="mb-6">
                  <h4 className="font-medium text-sm text-gray-700 mb-3 capitalize">{category}</h4>
                  <div className="space-y-2">
                    {NODE_TYPES.filter((nt) => nt.category === category).map((nodeType) => {
                      const Icon = nodeType.icon
                      return (
                        <div
                          key={nodeType.type}
                          draggable
                          onDragStart={() => setDraggedNodeType(nodeType.type)}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-white hover:shadow-sm transition-all"
                        >
                          <Icon className={`w-5 h-5 text-${nodeType.color}-600`} />
                          <div>
                            <div className="font-medium text-sm">{nodeType.name}</div>
                            <div className="text-xs text-gray-600">{nodeType.description}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="properties" className="px-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Node Name</label>
                  <Input
                    value={selectedNode.name}
                    onChange={(e) => {
                      const updatedNode = { ...selectedNode, name: e.target.value }
                      setSelectedNode(updatedNode)
                      // Update in workflow
                      if (workflow) {
                        setWorkflow((prev) =>
                          prev
                            ? {
                                ...prev,
                                nodes: prev.nodes.map((n) => (n.id === selectedNode.id ? updatedNode : n)),
                              }
                            : null,
                        )
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={selectedNode.description}
                    onChange={(e) => {
                      const updatedNode = { ...selectedNode, description: e.target.value }
                      setSelectedNode(updatedNode)
                      // Update in workflow
                      if (workflow) {
                        setWorkflow((prev) =>
                          prev
                            ? {
                                ...prev,
                                nodes: prev.nodes.map((n) => (n.id === selectedNode.id ? updatedNode : n)),
                              }
                            : null,
                        )
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Badge variant="outline">{selectedNode.type}</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Select a node to edit properties</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Workflow Name"
              value={workflow?.name || ""}
              onChange={(e) => setWorkflow((prev) => (prev ? { ...prev, name: e.target.value } : null))}
              className="w-64"
            />
            <Badge variant="outline">{workflow?.category}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={createNewWorkflow} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
            <Button onClick={saveWorkflow} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={testWorkflow}>
              <Play className="w-4 h-4 mr-2" />
              Test
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 bg-gray-100 relative overflow-auto"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {!workflow ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your First Workflow</h3>
                <p className="text-gray-600 mb-4">Start by creating a new workflow or selecting a template</p>
                <Button onClick={createNewWorkflow}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Workflow
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {/* Grid Background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Workflow Nodes */}
              {workflow.nodes.map((node) => {
                const Icon = getNodeIcon(node.type)
                const color = getNodeColor(node.type)

                return (
                  <div
                    key={node.id}
                    className={`absolute bg-white border-2 rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md ${
                      selectedNode?.id === node.id ? "border-blue-500" : "border-gray-200"
                    }`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      width: 200,
                      minHeight: 80,
                    }}
                    onClick={() => setSelectedNode(node)}
                  >
                    <div className={`p-3 border-b bg-${color}-50`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 text-${color}-600`} />
                          <span className="font-medium text-sm">{node.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Copy node
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNode(node.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-600">{node.description}</p>

                      {/* Input/Output Ports */}
                      <div className="flex justify-between mt-2">
                        <div className="flex flex-col gap-1">
                          {node.inputs.map((input) => (
                            <div
                              key={input.id}
                              className="w-3 h-3 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600"
                              title={input.name}
                            />
                          ))}
                        </div>
                        <div className="flex flex-col gap-1">
                          {node.outputs.map((output) => (
                            <div
                              key={output.id}
                              className="w-3 h-3 bg-green-500 rounded-full cursor-pointer hover:bg-green-600"
                              title={output.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Connections */}
              <svg className="absolute inset-0 pointer-events-none">
                {workflow.connections.map((connection) => {
                  const sourceNode = workflow.nodes.find((n) => n.id === connection.sourceNodeId)
                  const targetNode = workflow.nodes.find((n) => n.id === connection.targetNodeId)

                  if (!sourceNode || !targetNode) return null

                  const startX = sourceNode.position.x + 200
                  const startY = sourceNode.position.y + 40
                  const endX = targetNode.position.x
                  const endY = targetNode.position.y + 40

                  return (
                    <line
                      key={connection.id}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="#6b7280"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  )
                })}

                {/* Arrow marker definition */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                  </marker>
                </defs>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
