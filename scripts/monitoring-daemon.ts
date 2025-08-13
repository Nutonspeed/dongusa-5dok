import { monitoringService } from "../lib/monitoring-service"
import cron from "node-cron"

class MonitoringDaemon {
  private isRunning = false

  start(): void {
    if (this.isRunning) {
      console.log("Monitoring daemon is already running")
      return
    }

    this.isRunning = true
    console.log("🚀 Starting monitoring daemon...")

    // Collect metrics every minute
    cron.schedule("* * * * *", async () => {
      try {
        await monitoringService.collectMetrics()
      } catch (error) {
        console.error("Error collecting metrics:", error)
      }
    })

    // Run maintenance tasks every hour
    cron.schedule("0 * * * *", async () => {
      try {
        await monitoringService.runMaintenanceTasks()
      } catch (error) {
        console.error("Error running maintenance tasks:", error)
      }
    })

    // Health check every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
      try {
        const health = await monitoringService.performHealthCheck()
        if (health.status !== "healthy") {
          console.warn(`⚠️ System health: ${health.status}`)
        }
      } catch (error) {
        console.error("Error performing health check:", error)
      }
    })

    // Log aggregation every 15 minutes
    cron.schedule("*/15 * * * *", async () => {
      try {
        const logs = await monitoringService.aggregateLogs("1h")
        if (logs.error_count > 10) {
          console.warn(`⚠️ High error rate detected: ${logs.error_count} errors in the last hour`)
        }
      } catch (error) {
        console.error("Error aggregating logs:", error)
      }
    })

    console.log("✅ Monitoring daemon started successfully")
  }

  stop(): void {
    this.isRunning = false
    console.log("🛑 Monitoring daemon stopped")
  }
}

// Start daemon if this script is run directly
if (require.main === module) {
  const daemon = new MonitoringDaemon()
  daemon.start()

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Received SIGINT, shutting down gracefully...")
    daemon.stop()
    process.exit(0)
  })

  process.on("SIGTERM", () => {
    console.log("\n🛑 Received SIGTERM, shutting down gracefully...")
    daemon.stop()
    process.exit(0)
  })
}

export { MonitoringDaemon }
