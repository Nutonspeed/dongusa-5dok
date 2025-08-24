import { supabase } from "./supabase"
import { USE_SUPABASE } from "./runtime"

export interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "review" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  category: "sales" | "marketing" | "inventory" | "customer_service" | "finance" | "operations"
  assigned_to?: string
  assigned_by: string
  due_date?: string
  created_at: string
  updated_at: string
  completed_at?: string
  workflow_id?: string
  workflow_execution_id?: string
  dependencies: string[]
  tags: string[]
  attachments: TaskAttachment[]
  comments: TaskComment[]
  time_tracking: TaskTimeEntry[]
  estimated_hours?: number
  actual_hours?: number
}

export interface TaskAttachment {
  id: string
  task_id: string
  filename: string
  file_url: string
  file_size: number
  mime_type: string
  uploaded_by: string
  uploaded_at: string
}

export interface TaskComment {
  id: string
  task_id: string
  content: string
  author: string
  created_at: string
  updated_at?: string
  parent_comment_id?: string
}

export interface TaskTimeEntry {
  id: string
  task_id: string
  user_id: string
  start_time: string
  end_time?: string
  duration_minutes?: number
  description?: string
  created_at: string
}

export interface TaskBoard {
  id: string
  name: string
  description?: string
  columns: TaskColumn[]
  members: string[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface TaskColumn {
  id: string
  name: string
  status: Task["status"]
  order: number
  color: string
  limit?: number
}

export interface TaskFilter {
  status?: Task["status"][]
  priority?: Task["priority"][]
  category?: Task["category"][]
  assigned_to?: string[]
  due_date_from?: string
  due_date_to?: string
  search?: string
  tags?: string[]
}

class TaskManagementSystem {
  private tasks: Map<string, Task> = new Map()
  private boards: Map<string, TaskBoard> = new Map()

  // Task CRUD Operations
  async createTask(taskData: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task> {
    const task: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attachments: [],
      comments: [],
      time_tracking: [],
    }

    this.tasks.set(task.id, task)

    if (USE_SUPABASE) {
      await supabase.from("tasks").insert([task])
    }

    // Send notification to assigned user
    if (task.assigned_to) {
      await this.sendTaskNotification(task, "assigned")
    }

    return task
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(taskId)
    if (!task) throw new Error("Task not found")

    const updatedTask: Task = {
      ...task,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    // Handle status changes
    if (updates.status && updates.status !== task.status) {
      if (updates.status === "completed") {
        updatedTask.completed_at = new Date().toISOString()
      }
      await this.sendTaskNotification(updatedTask, "status_changed")
    }

    this.tasks.set(taskId, updatedTask)

    if (USE_SUPABASE) {
      await supabase.from("tasks").update(updatedTask).eq("id", taskId)
    }

    return updatedTask
  }

  async deleteTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) throw new Error("Task not found")

    this.tasks.delete(taskId)

    if (USE_SUPABASE) {
      await supabase.from("tasks").delete().eq("id", taskId)
    }
  }

  async getTasks(filter?: TaskFilter): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values())

    if (filter) {
      if (filter.status) {
        tasks = tasks.filter((task) => filter.status!.includes(task.status))
      }
      if (filter.priority) {
        tasks = tasks.filter((task) => filter.priority!.includes(task.priority))
      }
      if (filter.category) {
        tasks = tasks.filter((task) => filter.category!.includes(task.category))
      }
      if (filter.assigned_to) {
        tasks = tasks.filter((task) => task.assigned_to && filter.assigned_to!.includes(task.assigned_to))
      }
      if (filter.due_date_from) {
        tasks = tasks.filter((task) => task.due_date && task.due_date >= filter.due_date_from!)
      }
      if (filter.due_date_to) {
        tasks = tasks.filter((task) => task.due_date && task.due_date <= filter.due_date_to!)
      }
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase()
        tasks = tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(searchTerm) || task.description?.toLowerCase().includes(searchTerm),
        )
      }
      if (filter.tags && filter.tags.length > 0) {
        tasks = tasks.filter((task) => filter.tags!.some((tag) => task.tags.includes(tag)))
      }
    }

    return tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async getTask(taskId: string): Promise<Task | null> {
    return this.tasks.get(taskId) || null
  }

  // Task Board Management
  async createBoard(boardData: Omit<TaskBoard, "id" | "created_at" | "updated_at">): Promise<TaskBoard> {
    const board: TaskBoard = {
      ...boardData,
      id: `board_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    this.boards.set(board.id, board)

    if (USE_SUPABASE) {
      await supabase.from("task_boards").insert([board])
    }

    return board
  }

  async getBoards(): Promise<TaskBoard[]> {
    return Array.from(this.boards.values())
  }

  async getBoard(boardId: string): Promise<TaskBoard | null> {
    return this.boards.get(boardId) || null
  }

  // Task Comments
  async addComment(taskId: string, content: string, author: string): Promise<TaskComment> {
    const task = this.tasks.get(taskId)
    if (!task) throw new Error("Task not found")

    const comment: TaskComment = {
      id: `comment_${Date.now()}`,
      task_id: taskId,
      content,
      author,
      created_at: new Date().toISOString(),
    }

    task.comments.push(comment)
    await this.updateTask(taskId, { comments: task.comments })

    if (USE_SUPABASE) {
      await supabase.from("task_comments").insert([comment])
    }

    return comment
  }

  // Task Attachments
  async addAttachment(taskId: string, attachment: Omit<TaskAttachment, "id" | "task_id">): Promise<TaskAttachment> {
    const task = this.tasks.get(taskId)
    if (!task) throw new Error("Task not found")

    const taskAttachment: TaskAttachment = {
      ...attachment,
      id: `attachment_${Date.now()}`,
      task_id: taskId,
    }

    task.attachments.push(taskAttachment)
    await this.updateTask(taskId, { attachments: task.attachments })

    if (USE_SUPABASE) {
      await supabase.from("task_attachments").insert([taskAttachment])
    }

    return taskAttachment
  }

  // Time Tracking
  async startTimeTracking(taskId: string, userId: string, description?: string): Promise<TaskTimeEntry> {
    const task = this.tasks.get(taskId)
    if (!task) throw new Error("Task not found")

    // Stop any existing time tracking for this user
    await this.stopTimeTracking(taskId, userId)

    const timeEntry: TaskTimeEntry = {
      id: `time_${Date.now()}`,
      task_id: taskId,
      user_id: userId,
      start_time: new Date().toISOString(),
      description,
      created_at: new Date().toISOString(),
    }

    task.time_tracking.push(timeEntry)
    await this.updateTask(taskId, { time_tracking: task.time_tracking })

    if (USE_SUPABASE) {
      await supabase.from("task_time_entries").insert([timeEntry])
    }

    return timeEntry
  }

  async stopTimeTracking(taskId: string, userId: string): Promise<TaskTimeEntry | null> {
    const task = this.tasks.get(taskId)
    if (!task) throw new Error("Task not found")

    const activeEntry = task.time_tracking.find((entry) => entry.user_id === userId && !entry.end_time)

    if (!activeEntry) return null

    const endTime = new Date().toISOString()
    const durationMinutes = Math.floor(
      (new Date(endTime).getTime() - new Date(activeEntry.start_time).getTime()) / (1000 * 60),
    )

    activeEntry.end_time = endTime
    activeEntry.duration_minutes = durationMinutes

    // Update actual hours
    const totalMinutes = task.time_tracking.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)
    task.actual_hours = Math.round((totalMinutes / 60) * 100) / 100

    await this.updateTask(taskId, {
      time_tracking: task.time_tracking,
      actual_hours: task.actual_hours,
    })

    if (USE_SUPABASE) {
      await supabase.from("task_time_entries").update(activeEntry).eq("id", activeEntry.id)
    }

    return activeEntry
  }

  // Task Dependencies
  async addDependency(taskId: string, dependsOnTaskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    const dependsOnTask = this.tasks.get(dependsOnTaskId)

    if (!task || !dependsOnTask) throw new Error("Task not found")

    if (!task.dependencies.includes(dependsOnTaskId)) {
      task.dependencies.push(dependsOnTaskId)
      await this.updateTask(taskId, { dependencies: task.dependencies })
    }
  }

  async removeDependency(taskId: string, dependsOnTaskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) throw new Error("Task not found")

    task.dependencies = task.dependencies.filter((id) => id !== dependsOnTaskId)
    await this.updateTask(taskId, { dependencies: task.dependencies })
  }

  async canStartTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId)
    if (!task) return false

    // Check if all dependencies are completed
    for (const depId of task.dependencies) {
      const depTask = this.tasks.get(depId)
      if (!depTask || depTask.status !== "completed") {
        return false
      }
    }

    return true
  }

  // Analytics and Reporting
  async getTaskAnalytics(dateRange?: { start: string; end: string }) {
    let tasks = Array.from(this.tasks.values())

    if (dateRange) {
      tasks = tasks.filter((task) => task.created_at >= dateRange.start && task.created_at <= dateRange.end)
    }

    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.status === "completed").length
    const overdueTasks = tasks.filter(
      (task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed",
    ).length

    const tasksByStatus = tasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const tasksByPriority = tasks.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const tasksByCategory = tasks.reduce(
      (acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const averageCompletionTime = this.calculateAverageCompletionTime(tasks)
    const productivityTrend = this.getProductivityTrend(tasks)

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      tasksByStatus,
      tasksByPriority,
      tasksByCategory,
      averageCompletionTime,
      productivityTrend,
    }
  }

  private calculateAverageCompletionTime(tasks: Task[]): number {
    const completedTasks = tasks.filter((task) => task.completed_at)
    if (completedTasks.length === 0) return 0

    const totalTime = completedTasks.reduce((sum, task) => {
      const created = new Date(task.created_at).getTime()
      const completed = new Date(task.completed_at!).getTime()
      return sum + (completed - created)
    }, 0)

    return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60 * 24)) // days
  }

  private getProductivityTrend(tasks: Task[]) {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last30Days.map((date) => {
      const dayTasks = tasks.filter((task) => task.created_at.startsWith(date))
      const dayCompleted = tasks.filter((task) => task.completed_at?.startsWith(date))

      return {
        date,
        created: dayTasks.length,
        completed: dayCompleted.length,
      }
    })
  }

  // Notifications
  private async sendTaskNotification(task: Task, type: "assigned" | "status_changed" | "due_soon"): Promise<void> {
    // Use existing email service for notifications
    try {
      const { emailService } = await import("@/lib/email")

      let subject = ""
      let content = ""

      switch (type) {
        case "assigned":
          subject = `งานใหม่ถูกมอบหมายให้คุณ: ${task.title}`
          content = `คุณได้รับมอบหมายงานใหม่: ${task.title}\n\nรายละเอียด: ${task.description || "ไม่มี"}\n\nกำหนดส่ง: ${task.due_date ? new Date(task.due_date).toLocaleDateString("th-TH") : "ไม่กำหนด"}`
          break
        case "status_changed":
          subject = `สถานะงานเปลี่ยนแปลง: ${task.title}`
          content = `สถานะงาน "${task.title}" เปลี่ยนเป็น: ${task.status}`
          break
        case "due_soon":
          subject = `งานใกล้ครบกำหนด: ${task.title}`
          content = `งาน "${task.title}" จะครบกำหนดในอีก 24 ชั่วโมง`
          break
      }

      if (task.assigned_to) {
        await emailService.sendBulkEmail([task.assigned_to], subject, content)
      }
    } catch (error) {
  // console.error("Failed to send task notification:", error)
    }
  }

  // Workflow Integration
  async createTaskFromWorkflow(
    workflowExecutionId: string,
    taskData: Omit<Task, "id" | "created_at" | "updated_at" | "workflow_execution_id">,
  ): Promise<Task> {
    return await this.createTask({
      ...taskData,
      workflow_execution_id: workflowExecutionId,
    })
  }

  async getTasksByWorkflowExecution(workflowExecutionId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter((task) => task.workflow_execution_id === workflowExecutionId)
  }

  // Bulk Operations
  async bulkUpdateTasks(taskIds: string[], updates: Partial<Task>): Promise<Task[]> {
    const updatedTasks: Task[] = []

    for (const taskId of taskIds) {
      try {
        const updatedTask = await this.updateTask(taskId, updates)
        updatedTasks.push(updatedTask)
      } catch (error) {
  // console.error(`Failed to update task ${taskId}:`, error)
      }
    }

    return updatedTasks
  }

  async bulkDeleteTasks(taskIds: string[]): Promise<void> {
    for (const taskId of taskIds) {
      try {
        await this.deleteTask(taskId)
      } catch (error) {
  // console.error(`Failed to delete task ${taskId}:`, error)
      }
    }
  }
}

export const taskManagement = new TaskManagementSystem()
