import { jsPDF } from "jspdf"
import * as XLSX from "xlsx"

interface ExportData {
  headers: string[]
  rows: any[][]
  title: string
  metadata?: any
}

class ExportService {
  async exportToPDF(data: ExportData): Promise<Blob> {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(16)
    doc.text(data.title, 20, 20)

    // Add metadata if available
    if (data.metadata) {
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleDateString("th-TH")}`, 20, 30)
    }

    // Add table headers
    let yPosition = 50
    doc.setFontSize(12)
    data.headers.forEach((header, index) => {
      doc.text(header, 20 + index * 40, yPosition)
    })

    // Add table rows
    yPosition += 10
    data.rows.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        doc.text(String(cell), 20 + cellIndex * 40, yPosition + rowIndex * 10)
      })
    })

    return new Blob([doc.output("blob")], { type: "application/pdf" })
  }

  async exportToExcel(data: ExportData): Promise<Blob> {
    const workbook = XLSX.utils.book_new()

    // Create worksheet data
    const worksheetData = [data.headers, ...data.rows]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

    return new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  }
}

export const exportService = new ExportService()
