import type { NextRequest } from "next/server"
import { advancedReportingService } from "@/lib/advanced-reporting-service"
import PDFDocument from "pdfkit"
import XLSX from "xlsx"

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
      try {
        const doc = new PDFDocument()
        const buffers: Buffer[] = []
        doc.on("data", (chunk) => buffers.push(chunk))

        doc.fontSize(18).text(template.name, { align: "center" })
        doc.moveDown()
        const headers = template.visualization.columns.map((col) => col.label).join(" | ")
        doc.fontSize(12).text(headers)
        execution.data.forEach((row) => {
          const line = template.visualization.columns
            .map((col) => String(row[col.key]))
            .join(" | ")
          doc.text(line)
        })
        doc.end()

        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
          doc.on("end", () => resolve(Buffer.concat(buffers)))
          doc.on("error", reject)
        })

        return new Response(pdfBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename.replace(`.${format}`, ".pdf")}"`,
          },
        })
      } catch (err) {
        console.error("PDF generation error:", err)
        return new Response("Failed to generate PDF", { status: 500 })
      }
    } else if (format === "xlsx" || format === "excel") {
      try {
        const sheetData = [
          template.visualization.columns.map((col) => col.label),
          ...execution.data.map((row) =>
            template.visualization.columns.map((col) => row[col.key]),
          ),
        ]
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report")
        const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

        return new Response(excelBuffer, {
          status: 200,
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${filename.replace(`.${format}`, ".xlsx")}"`,
          },
        })
      } catch (err) {
        console.error("Excel generation error:", err)
        return new Response("Failed to generate Excel file", { status: 500 })
      }
    }

    // Unsupported format
    return new Response("Export format not implemented yet", { status: 501 })
  } catch (error) {
    console.error("Export error:", error)
    return new Response("Export failed", { status: 500 })
  }
}
