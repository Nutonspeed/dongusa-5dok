# Real-time Features Design & Implementation Plan

## WebSocket, Live Chat, and Real-time Communications

### 📋 Executive Summary

การออกแบบระบบ Real-time Features นี้มุ่งเน้นการสร้าง competitive advantage ผ่านการสื่อสารแบบ real-time ระหว่าง customers และ business เพื่อเพิ่มประสบการณ์ลูกค้าและเพิ่มอัตราการแปลงยอดขาย

### 🎯 Business Objectives

- **Customer Engagement**: เพิ่มอัตราการตอบสนอง 300%
- **Support Efficiency**: ลดเวลาการตอบสนอง < 2 นาที
- **Sales Conversion**: เพิ่มอัตราการแปลงยอดขาย 25%
- **Customer Satisfaction**: เพิ่มความพึงพอใจ > 4.5/5.0

---

## 🏗️ System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                      │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Web Browser   │   Mobile App    │    Admin Dashboard      │
│   (Next.js)     │ (React Native)  │     (Next.js)          │
└─────────┬───────┴─────────┬───────┴─────────┬───────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                           │
┌─────────────────────────▼─────────────────────────────────────┐
│                 Load Balancer (Nginx)                        │
└─────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│              WebSocket Gateway (Node.js)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐  │
│  │ Connection  │ │   Message   │ │    Room Management      │  │
│  │  Manager    │ │   Router    │ │     & Presence         │  │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘  │
└─────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│                   Message Queue (Redis)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐  │
│  │   Pub/Sub   │ │   Stream    │ │    Cache & Session     │  │
│  │  Channels   │ │  Processing │ │      Management        │  │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘  │
└─────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│                Business Logic Services                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐  │
│  │   Chat      │ │Notification │ │   Order Tracking &     │  │
│  │  Service    │ │  Service    │ │   Inventory Updates    │  │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘  │
└─────────────────────────┬─────────────────────────────────────┘
                         │
┌─────────────────────────▼─────────────────────────────────────┐
│                    Database Layer                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐  │
│  │  Supabase   │ │    Redis    │ │     MongoDB (Chat      │  │
│  │ (Main DB)   │ │   (Cache)   │ │     Messages & Logs)   │  │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💬 Live Chat System Design

### Chat Architecture Components

#### 1. Chat Server (Node.js + Socket.io)

```typescript
// Chat Server Configuration
interface ChatServerConfig {
  port: 3001;
  redis: {
    host: "localhost";
    port: 6379;
    adapter: "socket.io-redis";
  };
  database: {
    messages: "mongodb://localhost:27017/chat";
    sessions: "redis://localhost:6379/sessions";
  };
  authentication: {
    jwt_secret: process.env.JWT_SECRET;
    token_expiry: "24h";
  };
}

// Real-time Events
interface ChatEvents {
  // Connection Events
  "user:online": { userId: string; timestamp: number };
  "user:offline": { userId: string; timestamp: number };
  "user:typing": { userId: string; conversationId: string };

  // Message Events
  "message:send": MessagePayload;
  "message:receive": MessagePayload;
  "message:read": { messageId: string; userId: string };
  "message:delivered": { messageId: string; userId: string };

  // Conversation Events
  "conversation:join": { conversationId: string; userId: string };
  "conversation:leave": { conversationId: string; userId: string };
  "conversation:archived": { conversationId: string };

  // Agent Events
  "agent:assigned": { conversationId: string; agentId: string };
  "agent:transfer": {
    conversationId: string;
    fromAgent: string;
    toAgent: string;
  };
  "agent:available": { agentId: string; status: "online" | "busy" | "offline" };
}
```

#### 2. Message Management System

```typescript
interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: "customer" | "agent" | "system";
  content: {
    text?: string;
    attachments?: FileAttachment[];
    metadata?: MessageMetadata;
  };
  message_type: "text" | "image" | "file" | "system" | "quick_reply";
  status: "sent" | "delivered" | "read";
  created_at: Date;
  updated_at: Date;
}

interface Conversation {
  id: string;
  customer_id: string;
  agent_id?: string;
  status: "active" | "waiting" | "resolved" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  tags: string[];
  metadata: {
    source: "web" | "mobile" | "facebook" | "line";
    initial_url?: string;
    user_agent?: string;
    language: string;
  };
  created_at: Date;
  last_message_at: Date;
  resolved_at?: Date;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  status: "online" | "busy" | "offline";
  skills: string[];
  concurrent_limit: number;
  current_conversations: number;
  response_time_avg: number;
  satisfaction_rating: number;
}
```

#### 3. Smart Routing & Assignment

```typescript
class SmartChatRouter {
  async assignAgent(conversation: Conversation): Promise<Agent | null> {
    const availableAgents = await this.getAvailableAgents();

    // Priority-based assignment
    const priorityScore = this.calculatePriorityScore(conversation);
    const skillMatch = this.findSkillMatch(conversation, availableAgents);
    const workloadBalance = this.balanceWorkload(availableAgents);

    return this.selectOptimalAgent(priorityScore, skillMatch, workloadBalance);
  }

  private calculatePriorityScore(conversation: Conversation): number {
    let score = 0;

    // VIP customer check
    if (
      conversation.customer_id &&
      (await this.isVIPCustomer(conversation.customer_id))
    ) {
      score += 100;
    }

    // Waiting time penalty
    const waitTime = Date.now() - conversation.created_at.getTime();
    score += Math.min(waitTime / 1000 / 60, 50); // Max 50 points for wait time

    // Previous purchase history
    const purchaseHistory = await this.getCustomerValue(
      conversation.customer_id,
    );
    score += Math.min(purchaseHistory / 1000, 30); // Max 30 points for purchase value

    return score;
  }
}
```

---

## 🔔 Real-time Notification System

### Push Notification Architecture

```typescript
interface NotificationService {
  // Push notification providers
  providers: {
    firebase: FirebaseAdmin;
    apn: ApplePushNotification;
    web_push: WebPushService;
  };

  // Notification types
  types: {
    order_status_update: OrderNotification;
    payment_confirmation: PaymentNotification;
    inventory_alert: InventoryNotification;
    chat_message: ChatNotification;
    promotion_alert: PromotionNotification;
  };
}

interface NotificationTemplate {
  id: string;
  type: string;
  title_template: string;
  body_template: string;
  action_url?: string;
  icon_url?: string;
  badge_count?: number;
  sound?: string;
  priority: "low" | "normal" | "high";
  ttl: number; // Time to live in seconds
}

class RealTimeNotificationService {
  async sendNotification(
    userId: string,
    type: string,
    data: any,
    channels: ("push" | "email" | "sms" | "websocket")[] = [
      "push",
      "websocket",
    ],
  ): Promise<void> {
    const user = await this.getUserPreferences(userId);
    const template = await this.getNotificationTemplate(type);

    const notification = this.renderNotification(template, data);

    // Send through multiple channels
    const promises = channels
      .map((channel) => {
        if (user.preferences[channel]?.enabled) {
          return this.sendViaChannel(channel, userId, notification);
        }
      })
      .filter(Boolean);

    await Promise.allSettled(promises);

    // Log notification for analytics
    await this.logNotificationSent(userId, type, channels, data);
  }

  async sendBulkNotifications(
    notifications: Array<{
      userId: string;
      type: string;
      data: any;
    }>,
  ): Promise<void> {
    // Batch processing for efficiency
    const batches = this.createBatches(notifications, 100);

    for (const batch of batches) {
      await Promise.allSettled(
        batch.map((notification) =>
          this.sendNotification(
            notification.userId,
            notification.type,
            notification.data,
          ),
        ),
      );
    }
  }
}
```

---

## 📦 Real-time Order Tracking

### Order Status Broadcasting

```typescript
interface OrderStatusUpdate {
  order_id: string;
  customer_id: string;
  previous_status: OrderStatus;
  current_status: OrderStatus;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  estimated_delivery?: Date;
  tracking_number?: string;
  notes?: string;
}

class OrderTrackingService {
  async broadcastOrderUpdate(update: OrderStatusUpdate): Promise<void> {
    // Send to customer via WebSocket
    await this.sendToCustomer(update.customer_id, {
      type: "order_status_update",
      data: update,
    });

    // Send push notification
    await this.notificationService.sendNotification(
      update.customer_id,
      "order_status_update",
      update,
    );

    // Update admin dashboard
    await this.sendToAdminDashboard({
      type: "order_tracking_update",
      data: update,
    });

    // Log for analytics
    await this.analytics.trackEvent("order_status_change", {
      order_id: update.order_id,
      status: update.current_status,
      customer_id: update.customer_id,
    });
  }

  async startRealTimeTracking(orderId: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order.tracking_number) return;

    // Set up periodic tracking updates
    const trackingInterval = setInterval(async () => {
      const trackingData = await this.getTrackingData(order.tracking_number);

      if (this.hasStatusChanged(order, trackingData)) {
        await this.broadcastOrderUpdate({
          order_id: orderId,
          customer_id: order.customer_id,
          previous_status: order.status,
          current_status: trackingData.status,
          timestamp: new Date(),
          location: trackingData.location,
          estimated_delivery: trackingData.estimated_delivery,
        });
      }
    }, 300000); // Check every 5 minutes

    // Clean up interval when order is delivered
    setTimeout(
      () => {
        clearInterval(trackingInterval);
      },
      7 * 24 * 60 * 60 * 1000,
    ); // 7 days
  }
}
```

---

## 🏪 Real-time Inventory Management

### Live Stock Updates

```typescript
interface InventoryUpdate {
  product_id: string;
  variant_id?: string;
  previous_quantity: number;
  current_quantity: number;
  change_type: "sale" | "restock" | "adjustment" | "reservation";
  location: string;
  timestamp: Date;
}

class RealTimeInventoryService {
  async broadcastInventoryUpdate(update: InventoryUpdate): Promise<void> {
    // Notify all connected clients viewing this product
    await this.broadcastToProductViewers(update.product_id, {
      type: "inventory_update",
      data: {
        product_id: update.product_id,
        variant_id: update.variant_id,
        available_quantity: update.current_quantity,
        is_in_stock: update.current_quantity > 0,
      },
    });

    // Update admin dashboard
    await this.sendToAdminDashboard({
      type: "inventory_alert",
      data: update,
    });

    // Send low stock alerts if needed
    if (
      update.current_quantity <= this.getLowStockThreshold(update.product_id)
    ) {
      await this.sendLowStockAlert(update);
    }
  }

  async reserveInventory(
    productId: string,
    variantId: string,
    quantity: number,
    customerId: string,
  ): Promise<{ success: boolean; reservation_id?: string }> {
    const currentStock = await this.getCurrentStock(productId, variantId);

    if (currentStock < quantity) {
      // Real-time out of stock notification
      await this.broadcastToProductViewers(productId, {
        type: "out_of_stock",
        data: { product_id: productId, variant_id: variantId },
      });

      return { success: false };
    }

    // Create temporary reservation
    const reservationId = await this.createReservation({
      product_id: productId,
      variant_id: variantId,
      quantity,
      customer_id: customerId,
      expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    // Broadcast updated availability
    await this.broadcastInventoryUpdate({
      product_id: productId,
      variant_id: variantId,
      previous_quantity: currentStock,
      current_quantity: currentStock - quantity,
      change_type: "reservation",
      location: "online",
      timestamp: new Date(),
    });

    return { success: true, reservation_id: reservationId };
  }
}
```

---

## 🛠️ Technical Implementation

### WebSocket Server Setup

```typescript
// server/websocket-server.ts
import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL);
const redisPub = redisClient.duplicate();

const io = new SocketServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Use Redis adapter for horizontal scaling
io.adapter(createAdapter(redisPub, redisClient));

// Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const user = await verifyJWTToken(token);
    socket.userId = user.id;
    socket.userType = user.type; // "customer" | "agent" | "admin"
    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
});

// Connection handling
io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Join user to personal room
  socket.join(`user:${socket.userId}`);

  // Handle chat events
  socket.on("chat:join_conversation", async (conversationId) => {
    await handleChatJoin(socket, conversationId);
  });

  socket.on("chat:send_message", async (messageData) => {
    await handleChatMessage(socket, messageData);
  });

  // Handle product tracking
  socket.on("product:track", (productId) => {
    socket.join(`product:${productId}`);
  });

  socket.on("product:untrack", (productId) => {
    socket.leave(`product:${productId}`);
  });

  // Handle order tracking
  socket.on("order:track", (orderId) => {
    socket.join(`order:${orderId}`);
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);
    // Update user status to offline
    updateUserStatus(socket.userId, "offline");
  });
});
```

### Client Integration (React/React Native)

```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface WebSocketHook {
  socket: Socket | null;
  connected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string) => void;
}

export const useWebSocket = (): WebSocketHook => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = (token: string) => {
    if (socketRef.current?.connected) {
      return;
    }

    socketRef.current = io(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3001",
      {
        auth: { token },
        transports: ["websocket", "polling"],
      },
    );

    socketRef.current.on("connect", () => {
      setConnected(true);
      console.log("WebSocket connected");
    });

    socketRef.current.on("disconnect", () => {
      setConnected(false);
      console.log("WebSocket disconnected");
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  };

  const emit = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string) => {
    socketRef.current?.off(event);
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    connected,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
};
```

---

## 📊 Performance & Scalability

### Horizontal Scaling Strategy

```typescript
// Load Balancing Configuration
interface ScalingConfig {
  websocket_servers: {
    instances: 3;
    sticky_sessions: true;
    load_balancer: "nginx";
  };

  redis_cluster: {
    nodes: 3;
    replication: true;
    sharding: "consistent_hashing";
  };

  message_queue: {
    provider: "redis_streams";
    consumer_groups: ["chat", "notifications", "inventory"];
    batch_size: 100;
  };

  auto_scaling: {
    cpu_threshold: 70;
    memory_threshold: 80;
    connection_threshold: 1000;
    scale_up_cooldown: 300; // seconds
    scale_down_cooldown: 600; // seconds
  };
}
```

### Performance Optimizations

- **Connection Pooling**: Efficient WebSocket connection management
- **Message Batching**: Batch multiple messages for efficiency
- **Compression**: gzip compression for message payloads
- **Caching**: Redis caching for frequently accessed data
- **Rate Limiting**: Prevent abuse and ensure fair usage
- **Health Checks**: Automatic failover and recovery

---

## 💰 Implementation Budget

### Development Resources (2 months)

```
Backend Developer (1 FTE): $60,000
Frontend Developer (0.5 FTE): $25,000
Mobile Developer (0.5 FTE): $30,000
DevOps Engineer (0.5 FTE): $30,000
QA Engineer (0.5 FTE): $20,000

Total Team Cost: $165,000
```

### Infrastructure Costs (Annual)

```
WebSocket Servers (3 instances): $3,600
Redis Cluster: $2,400
MongoDB (Chat storage): $1,200
Push Notification Services: $1,800
Load Balancer: $1,200
Monitoring & Logging: $2,400

Total Infrastructure: $12,600/year
```

### **Total Project Budget: $177,600**

---

## ⚠️ Risk Management

### Technical Risks

1. **WebSocket Connection Stability**
   - _Mitigation_: Automatic reconnection with exponential backoff
   - _Contingency_: Fallback to HTTP polling

2. **Message Delivery Guarantee**
   - _Mitigation_: Message acknowledgment and retry mechanisms
   - _Contingency_: Persistent queue with manual retry

3. **Scaling Bottlenecks**
   - _Mitigation_: Horizontal scaling with load balancing
   - _Contingency_: Message queue overflow protection

---

## 📋 Success Criteria

### Technical Metrics

- [ ] Message delivery rate: >99.5%
- [ ] Average response time: <100ms
- [ ] Concurrent connections: >10,000
- [ ] System uptime: >99.9%

### Business Metrics

- [ ] Customer engagement: +300%
- [ ] Support response time: <2 minutes
- [ ] Sales conversion: +25%
- [ ] Customer satisfaction: >4.5/5.0

---

**🔔 Real-time Features จะเป็นตัวเปลี่ยนเกมสำคัญในการสร้าง competitive advantage และเพิ่มประสบการณ์ลูกค้าให้เหนือกว่าคู่แข่ง**

---

_Document Version: 1.0_
_Last Updated: 2025-08-20_
_Next Review: Weekly during development_
_Owner: Backend Development Team Lead_
