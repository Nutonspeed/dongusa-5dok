"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  ShoppingCart,
  Truck,
  CreditCard,
  Share2,
  FolderSyncIcon as Sync,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

interface IntegrationStatus {
  shopee: boolean
  lazada: boolean
  stripe: boolean
  thailand_post: boolean
  kerry: boolean
  flash: boolean
  facebook: boolean
  instagram: boolean
}

export function IntegrationsManagement() {
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    shopee: false,
    lazada: false,
    stripe: false,
    thailand_post: false,
    kerry: false,
    flash: false,
    facebook: false,
    instagram: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [syncResults, setSyncResults] = useState<any>(null)

  useEffect(() => {
    fetchIntegrationStatus()
  }, [])

  const fetchIntegrationStatus = async () => {
    try {
      const response = await fetch("/api/integrations/sync?type=status")
      const data = await response.json()
      setIntegrationStatus(data.integrations)
    } catch (error) {
      console.error("Failed to fetch integration status:", error)
    }
  }

  const handleSync = async (platform: string, sellerId?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          action: "sync_products",
          sellerId: sellerId || "default",
        }),
      })
      const result = await response.json()
      setSyncResults(result)
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />
  }

  const getStatusBadge = (status: boolean) => {
    return <Badge variant={status ? "default" : "secondary"}>{status ? "Connected" : "Not Connected"}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Third-party Integrations</h2>
        <Button onClick={fetchIntegrationStatus} variant="outline">
          <Sync className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      <Tabs defaultValue="ecommerce" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <TabsContent value="ecommerce" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Shopee Integration
                </CardTitle>
                {getStatusIcon(integrationStatus.shopee)}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(integrationStatus.shopee)}
                  <div className="space-y-2">
                    <Label htmlFor="shopee-seller-id">Seller ID</Label>
                    <Input
                      id="shopee-seller-id"
                      placeholder="Enter Shopee Seller ID"
                      disabled={!integrationStatus.shopee}
                    />
                  </div>
                  <Button
                    onClick={() => handleSync("shopee")}
                    disabled={!integrationStatus.shopee || isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Syncing..." : "Sync Products"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Lazada Integration
                </CardTitle>
                {getStatusIcon(integrationStatus.lazada)}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(integrationStatus.lazada)}
                  <div className="space-y-2">
                    <Label htmlFor="lazada-seller-id">Seller ID</Label>
                    <Input
                      id="lazada-seller-id"
                      placeholder="Enter Lazada Seller ID"
                      disabled={!integrationStatus.lazada}
                    />
                  </div>
                  <Button
                    onClick={() => handleSync("lazada")}
                    disabled={!integrationStatus.lazada || isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Syncing..." : "Sync Products"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {syncResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Sync Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Success:</strong> {syncResults.success ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Products Synced:</strong> {syncResults.synced}
                  </p>
                  {syncResults.errors.length > 0 && (
                    <div>
                      <p>
                        <strong>Errors:</strong>
                      </p>
                      <ul className="list-disc list-inside text-sm text-red-600">
                        {syncResults.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  Thailand Post
                </CardTitle>
                {getStatusIcon(integrationStatus.thailand_post)}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(integrationStatus.thailand_post)}
                  <div className="flex items-center space-x-2">
                    <Switch checked={integrationStatus.thailand_post} disabled />
                    <Label>Auto Label Creation</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  Kerry Express
                </CardTitle>
                {getStatusIcon(integrationStatus.kerry)}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(integrationStatus.kerry)}
                  <div className="flex items-center space-x-2">
                    <Switch checked={integrationStatus.kerry} disabled />
                    <Label>Auto Booking</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  Flash Express
                </CardTitle>
                {getStatusIcon(integrationStatus.flash)}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(integrationStatus.flash)}
                  <div className="flex items-center space-x-2">
                    <Switch checked={integrationStatus.flash} disabled />
                    <Label>Auto Shipment</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Stripe Payment Gateway
                </CardTitle>
                {getStatusIcon(integrationStatus.stripe)}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(integrationStatus.stripe)}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch checked={integrationStatus.stripe} disabled />
                      <Label>Accept Credit Cards</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={integrationStatus.stripe} disabled />
                      <Label>Webhook Notifications</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Payment Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Input value="THB" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Test Mode</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Share2 className="w-4 h-4 mr-2" />
                  Facebook Integration
                </CardTitle>
                {getStatusIcon(integrationStatus.facebook)}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(integrationStatus.facebook)}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch checked={integrationStatus.facebook} disabled />
                      <Label>Auto Post Products</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={integrationStatus.facebook} disabled />
                      <Label>Messenger Integration</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Share2 className="w-4 h-4 mr-2" />
                  Instagram Integration
                </CardTitle>
                {getStatusIcon(integrationStatus.instagram)}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(integrationStatus.instagram)}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch checked={integrationStatus.instagram} disabled />
                      <Label>Auto Post Products</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={integrationStatus.instagram} disabled />
                      <Label>Story Integration</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
