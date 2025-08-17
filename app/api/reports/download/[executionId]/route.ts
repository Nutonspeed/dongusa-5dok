import type { NextRequest } from "next/server"
import { advancedReportingService } from "@/lib/advanced-reporting-service"
import { exportService } from "@/lib/export-service"

export async function GET(request: NextRequest, { params }: { params: { executionId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const executionId = params.executionId

    // Get execution data
    const executions = await advancedReportingService.getExecutions()
    const execution = executions.find((e) => e.id === executionId)

    if (!execution || execution.status !== "completed" || !execution.data) {
      return new Response("Report not found or not completed", { status: 404 })
    }

    const template = await advancedReportingService.getTemplate(execution.templateId)
    if (!template) {
      return new Response("Template not found", { status: 404 })
    }

    const filename = `${template.name}_${new Date().toISOString().split("T")[0]}.${format}`

    if (format === "csv") {
      // Generate CSV
      const headers = template.visualization.columns.map((col) => col.label).join(",")
      const rows = execution.data
        .map((row) =>
          template.visualization.columns
            .map((col) => {
              const value = row[col.key]
              if (col.type === "currency") {
                return `"${new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(value)}"`
              }
              return `"${value}"`
            })
            .join(","),
        )
        .join("\n")

      const csvContent = `${headers}\n${rows}`

      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    } else if (format === "json") {
      // Generate JSON
      const jsonContent = JSON.stringify(
        {
          template: {
            name: template.name,
            description: template.description,
            generatedAt: execution.metadata?.generatedAt,
          },
          data: execution.data,
          metadata: execution.metadata,
        },
        null,
        2,
      )

      return new Response(jsonContent, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename.replace(".json", ".json")}"`,
        },
      })
    } else if (format === "pdf") {
      const exportData = {
        title: template.name,
        headers: template.visualization.columns.map((col) => col.label),
        rows: execution.data.map((row) =>
          template.visualization.columns.map((col) => {
            const value = row[col.key]
            if (col.type === "currency") {
              return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(value)
            }
            return String(value)
          }),
        ),
        metadata: execution.metadata,
      }

      const pdfBlob = await exportService.exportToPDF(exportData)
      const buffer = await pdfBlob.arrayBuffer()

      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename.replace(/\.[^/.]+$/, ".pdf")}"`,
        },
      })
    } else if (format === "excel") {
      const exportData = {
        title: template.name,
        headers: template.visualization.columns.map((col) => col.label),
        rows: execution.data.map((row) =>
          template.visualization.columns.map((col) => {
            const value = row[col.key]
            if (col.type === "currency") {
              return Number(value)
            }
            return value
          }),
        ),
        metadata: execution.metadata,
      }

      const excelBlob = await exportService.exportToExcel(exportData)
      const buffer = await excelBlob.arrayBuffer()

      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename.replace(/\.[^/.]+$/, ".xlsx")}"`,
        },
      })
    }

    // For PDF and Excel, return a placeholder response
    return new Response("Export format not implemented yet", { status: 501 })
  } catch (error) {
    console.error("Export error:", error)
    return new Response("Export failed", { status: 500 })
  }
}
