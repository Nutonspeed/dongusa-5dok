import "server-only"
import { scalingService } from "../lib/scaling-service"
import fs from "fs"
import path from "path"

interface CapacityPlan {
  current_date: string
  planning_horizon: string
  current_metrics: any
  projected_metrics: any
  resource_requirements: any
  cost_projections: any
  recommendations: string[]
}

async function generateCapacityPlan(): Promise<CapacityPlan> {
  console.log("🔍 Generating capacity planning report...")

  // Get current system metrics
  const currentReport = await scalingService.generateCapacityReport()
  const healthCheck = await scalingService.performHealthChecks()

  // Calculate resource requirements
  const resourceRequirements = calculateResourceRequirements(currentReport)

  // Project costs
  const costProjections = calculateCostProjections(resourceRequirements)

  // Generate recommendations
  const recommendations = generateRecommendations(currentReport, healthCheck, resourceRequirements)

  const plan: CapacityPlan = {
    current_date: new Date().toISOString(),
    planning_horizon: "6 months",
    current_metrics: {
      capacity: currentReport.current_capacity,
      healthy_instances: healthCheck.healthy_instances,
      total_instances: healthCheck.total_instances,
      growth_rate: currentReport.growth_rate,
    },
    projected_metrics: {
      capacity: currentReport.projected_capacity,
      required_instances: Math.ceil(currentReport.projected_capacity / 1000),
      storage_requirements: resourceRequirements.storage,
      bandwidth_requirements: resourceRequirements.bandwidth,
    },
    resource_requirements: resourceRequirements,
    cost_projections: costProjections,
    recommendations: recommendations,
  }

  // Save report
  const reportPath = path.join(process.cwd(), "reports", `capacity-plan-${Date.now()}.json`)
  fs.writeFileSync(reportPath, JSON.stringify(plan, null, 2))

  console.log(`✅ Capacity plan saved to: ${reportPath}`)
  return plan
}

function calculateResourceRequirements(report: any) {
  const baseRequirements = {
    cpu_cores: 4,
    memory_gb: 8,
    storage_gb: 100,
    bandwidth_mbps: 100,
  }

  const scaleFactor = report.projected_capacity / report.current_capacity

  return {
    cpu_cores: Math.ceil(baseRequirements.cpu_cores * scaleFactor),
    memory_gb: Math.ceil(baseRequirements.memory_gb * scaleFactor),
    storage_gb: Math.ceil(baseRequirements.storage_gb * scaleFactor * 1.5), // Extra for growth
    bandwidth_mbps: Math.ceil(baseRequirements.bandwidth_mbps * scaleFactor),
    instances: Math.ceil(scaleFactor * 3), // Current 3 instances
    database_connections: Math.ceil(100 * scaleFactor),
    cache_memory_gb: Math.ceil(2 * scaleFactor),
  }
}

function calculateCostProjections(requirements: any) {
  // Cost per unit (monthly)
  const costs = {
    cpu_core: 50, // $50 per core
    memory_gb: 10, // $10 per GB
    storage_gb: 0.5, // $0.50 per GB
    bandwidth_mbps: 5, // $5 per Mbps
    database_connection: 1, // $1 per connection
    cache_gb: 15, // $15 per GB cache
  }

  return {
    compute: requirements.cpu_cores * costs.cpu_core + requirements.memory_gb * costs.memory_gb,
    storage: requirements.storage_gb * costs.storage_gb,
    bandwidth: requirements.bandwidth_mbps * costs.bandwidth_mbps,
    database: requirements.database_connections * costs.database_connection,
    cache: requirements.cache_memory_gb * costs.cache_gb,
    total:
      requirements.cpu_cores * costs.cpu_core +
      requirements.memory_gb * costs.memory_gb +
      requirements.storage_gb * costs.storage_gb +
      requirements.bandwidth_mbps * costs.bandwidth_mbps +
      requirements.database_connections * costs.database_connection +
      requirements.cache_memory_gb * costs.cache_gb,
  }
}

function generateRecommendations(report: any, health: any, requirements: any): string[] {
  const recommendations = []

  if (report.growth_rate > 0.3) {
    recommendations.push("High growth rate detected - consider aggressive scaling strategy")
  }

  if (health.unhealthy_instances > 0) {
    recommendations.push(`Replace ${health.unhealthy_instances} unhealthy instances`)
  }

  if (requirements.instances > health.total_instances * 2) {
    recommendations.push("Significant scaling required - plan infrastructure upgrade")
  }

  if (requirements.cache_memory_gb > 10) {
    recommendations.push("Consider Redis cluster for improved caching performance")
  }

  recommendations.push("Implement auto-scaling policies to handle traffic spikes")
  recommendations.push("Set up multi-region deployment for better availability")
  recommendations.push("Consider CDN optimization for static assets")

  return recommendations
}

// Run capacity planning
if (require.main === module) {
  generateCapacityPlan()
    .then((plan) => {
      console.log("📊 Capacity Planning Summary:")
      console.log(`Current Capacity: ${plan.current_metrics.capacity} requests`)
      console.log(`Projected Capacity: ${plan.projected_metrics.capacity} requests`)
      console.log(`Growth Rate: ${(plan.current_metrics.growth_rate * 100).toFixed(1)}%`)
      console.log(`Estimated Monthly Cost: $${plan.cost_projections.total}`)
      console.log(`\n📋 Key Recommendations:`)
      plan.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`)
      })
    })
    .catch(console.error)
}

export { generateCapacityPlan }
