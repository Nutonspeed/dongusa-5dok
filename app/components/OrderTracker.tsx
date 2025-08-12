"use client"
import { logger } from '@/lib/logger';

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail } from "lucide-react"

interface OrderStatus {
  id: string
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  created_at: string
  updated_at: string
  tracking_number?: string
  estimated_delivery?: string
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image_url: string
  }>
  shipping_address: {
    name: string
    address: string
    city: string
    postal_code: string
    phone: string
  }
  total: number
}

interface OrderTrackerProps {
  orderId: string
}

export default function OrderTracker({ orderId }: OrderTrackerProps) {
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderStatus()
  }, [orderId])

  const fetchOrderStatus = async () => {
    try {
      // Replace with real API call
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      logger.error("Failed to fetch order:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case "processing":
        return <Package className="h-5 w-5 text-orange-500" />
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-orange-100 text-orange-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Order not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              Order #{order.id}
            </CardTitle>
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            {order.tracking_number && (
              <div>
                <p className="text-sm text-gray-500">Tracking Number</p>
                <p className="font-medium">{order.tracking_number}</p>
              </div>
            )}
            {order.estimated_delivery && (
              <div>
                <p className="text-sm text-gray-500">Estimated Delivery</p>
                <p className="font-medium">{new Date(order.estimated_delivery).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <img
                  src={item.image_url || `/placeholder.svg?height=60&width=60&query=${encodeURIComponent(item.name)}`}
                  alt={item.name}
                  className="w-15 h-15 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">฿{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center font-bold">
              <span>Total</span>
              <span>฿{order.total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">{order.shipping_address.name}</p>
            <p className="text-gray-600">{order.shipping_address.address}</p>
            <p className="text-gray-600">
              {order.shipping_address.city} {order.shipping_address.postal_code}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{order.shipping_address.phone}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="font-medium">Need Help?</h3>
            <p className="text-sm text-gray-600">
              Contact our customer support team for any questions about your order.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
