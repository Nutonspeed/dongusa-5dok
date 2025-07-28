"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { DollarSign, FileText, Clock, AlertTriangle, TrendingUp, Users, Package } from "lucide-react"
import type { DashboardKPI, Bill } from "@/lib/types/bill"
import { billDatabase } from "@/lib/enhanced-bill-database"
import { formatCurrency, formatNumber } from "@/lib/utils"
import Link from "next/link"

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<DashboardKPI | null>(null)
  const [recentBills, setRecentBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  const loadDashboardData = async () => {
    try {
      const [kpiData, billsData] = await Promise.all([billDatabase.getDashboardKPIs(), billDatabase.getBills()])

      setKpis(kpiData)
      setRecentBills(billsData.slice(0, 10))
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  // Sample chart data (in a real app, this would come from the database)
  const monthlyRevenueData = [
    { month: "Jan", revenue: 45000, bills: 12 },
    { month: "Feb", revenue: 52000, bills: 15 },
    { month: "Mar", revenue: 48000, bills: 13 },
    { month: "Apr", revenue: 61000, bills: 18 },
    { month: "May", revenue: 55000, bills: 16 },
    { month: "Jun", revenue: 67000, bills: 20 },
  ]

  const statusDistribution = [
    { name: "Paid", value: kpis?.completedBills || 0, color: "#10B981" },
    { name: "Pending", value: kpis?.pendingBills || 0, color: "#3B82F6" },
    { name: "Overdue", value: kpis?.overdueBills || 0, color: "#EF4444" },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-lg"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant={timeRange === "7d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("7d")}>
            7 Days
          </Button>
          <Button variant={timeRange === "30d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("30d")}>
            30 Days
          </Button>
          <Button variant={timeRange === "90d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("90d")}>
            90 Days
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis?.totalRevenue || 0)}</p>
                <p className="text-xs text-green-600 mt-1">+{kpis?.monthlyGrowth.toFixed(1) || 0}% from last month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bills</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(kpis?.totalBills || 0)}</p>
                <p className="text-xs text-blue-600 mt-1">{kpis?.pendingBills || 0} pending</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Bills</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(kpis?.pendingBills || 0)}</p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting payment</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Bills</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(kpis?.overdueBills || 0)}</p>
                <p className="text-xs text-red-600 mt-1">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Bill Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bills and Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Recent Bills
              </span>
              <Link href="/admin/bills">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{bill.billNumber}</p>
                      <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{bill.customer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(bill.total)}</p>
                    <p className="text-sm text-gray-500">{new Date(bill.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis?.topCustomers.map((customer, index) => (
                <div key={customer.customerId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-pink-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.customerName}</p>
                      <p className="text-sm text-gray-600">{customer.billCount} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
