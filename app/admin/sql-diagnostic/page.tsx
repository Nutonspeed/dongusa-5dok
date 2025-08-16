import SQLExecutionDiagnostic from "@/components/admin/SQLExecutionDiagnostic"

export default function SQLDiagnosticPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">SQL Execution Diagnostic</h1>
        <p className="text-muted-foreground">Diagnose and resolve SQL execution issues</p>
      </div>

      <SQLExecutionDiagnostic />
    </div>
  )
}
