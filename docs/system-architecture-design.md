# System Architecture Design

## Phase 2 Implementation - Technical Architecture Blueprint

### Executive Summary

เอกสารนี้กำหนดสถาปัตยกรรมระบบสำหรับ Phase 2 ของ Premium Sofa Cover E-commerce Platform โดยมุ่งเน้นการขยายตัว ประสิทธิภาพ และการบูรณาการที่ไร้รอยต่อ

---

## Overall System Architecture

### High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CDN Layer (CloudFlare)                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                  Load Balancer (Nginx)                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Web App    │ │  Mobile App  │ │  Admin Panel │
│  (Next.js)   │ │(React Native)│ │   (Next.js)  │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └─────────────────┼─────────────────┘
                         │
┌─────────────────────────▼───────────────────────────────────────┐
│                   API Gateway (Kong/AWS)                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Core API   │ │  Mobile API  │ │  Admin API   │
│  (Next.js)   │ │  (Next.js)   │ │  (Next.js)   │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └─────────────────┼─────────────────┘
                         │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Service Layer                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │   CRM    │ │Analytics │ │Inventory │ │Marketing │          │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
└───────┼──────────────┼─────────────┼─────────────┼─────────────┘
        │              │             │             │
┌───────▼──────────────▼─────────────▼─────────────▼─────────────┐
│                    Data Layer                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Supabase │ │  Redis   │ │   S3     │ │ElasticDB │          │
│  │   (PG)   │ │ (Cache)  │ │ (Files)  │ │ (Search) │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Principles

#### 1. Microservices-Ready Design

- **Modular Architecture**: แยก business domains เป็น independent modules
- **API-First Approach**: ทุก service สื่อสารผ่าน well-defined APIs
- **Service Isolation**: แต่ละ service มี database และ deployment pipeline แยก

#### 2. Scalability & Performance

- **Horizontal Scaling**: Auto-scaling based on load metrics
- **Caching Strategy**: Multi-level caching (CDN, Application, Database)
- **Asynchronous Processing**: Event-driven architecture for heavy operations

#### 3. Security & Compliance

- **Zero-Trust Model**: Authentication และ authorization ทุก level
- **Data Encryption**: At-rest และ in-transit encryption
- **Audit Trail**: Comprehensive logging และ monitoring

---

## Frontend Architecture

### Web Application (Next.js 14+)

```typescript
// Architecture Structure
src/
├── app/                    # App Router (Next.js 14)
│   ├── (public)/          # Public pages
│   ├── (protected)/       # Authenticated pages
│   ├── admin/             # Admin interface
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI components
│   ├── features/          # Feature-specific components
│   └── layouts/           # Layout components
├── lib/
│   ├── services/          # API service layers
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript definitions
├── stores/                # Global state management
└── middleware.ts          # Next.js middleware
```

#### Key Features

- **Server-Side Rendering (SSR)**: ปรับปรุง SEO และ initial load performance
- **Static Site Generation (SSG)**: สำหรับ product catalogs และ marketing pages
- **Progressive Web App (PWA)**: Offline capability และ push notifications
- **Micro-Frontends Ready**: Architecture รองรับการแยก frontend modules

### Mobile Application (React Native)

```typescript
// Mobile App Structure
src/
├── screens/              # Screen components
├── navigation/           # Navigation setup
├── components/           # Reusable components
├── services/             # API services
├── hooks/                # Custom hooks
├── store/                # Redux/Zustand store
├── utils/                # Utility functions
└── types/                # TypeScript definitions
```

#### Mobile-Specific Features

- **Native Performance**: Platform-specific optimizations
- **Offline-First**: Local storage พร้อม sync capabilities
- **Push Notifications**: Real-time engagement
- **Biometric Authentication**: Touch/Face ID integration

---

## Backend Architecture

### API Layer Architecture

```typescript
// API Structure
app/api/
├── v1/                   # Version 1 APIs
│   ├── auth/             # Authentication endpoints
│   ├── products/         # Product management
│   ├── orders/           # Order processing
│   ├── customers/        # Customer management
│   └── analytics/        # Analytics endpoints
├── v2/                   # Version 2 APIs (new features)
├── mobile/               # Mobile-specific endpoints
├── admin/                # Admin-specific endpoints
└── webhooks/             # Third-party webhooks
```

#### API Design Principles

- **RESTful Design**: Consistent HTTP methods และ status codes
- **GraphQL Support**: สำหรับ complex data fetching
- **Rate Limiting**: Protection against abuse
- **API Versioning**: Backward compatibility maintenance

### Service Layer Architecture

```typescript
// Service Layer Structure
lib/services/
├── auth-service.ts         # Authentication & Authorization
├── product-service.ts      # Product management
├── order-service.ts        # Order processing
├── customer-service.ts     # Customer management
├── inventory-service.ts    # Inventory management
├── payment-service.ts      # Payment processing
├── notification-service.ts # Notification system
├── analytics-service.ts    # Analytics & reporting
└── integration-service.ts  # Third-party integrations
```

---

## Database Architecture

### Primary Database (Supabase PostgreSQL)

```sql
-- Core Tables Structure
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     users       │    │    profiles     │    │   addresses     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (UUID)       │────│ user_id (FK)    │    │ user_id (FK)    │
│ email           │    │ full_name       │    │ street          │
│ created_at      │    │ phone           │    │ city            │
│ updated_at      │    │ avatar_url      │    │ country         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    products     │    │   categories    │    │ product_variants│
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (UUID)       │    │ id (UUID)       │    │ product_id (FK) │
│ name            │    │ name            │    │ size            │
│ description     │    │ slug            │    │ color           │
│ category_id(FK) │────│ parent_id       │    │ price           │
│ price           │    │ image_url       │    │ stock_quantity  │
│ images          │    │ created_at      │    │ sku             │
│ created_at      │    └─────────────────┘    └─────────────────┘
└─────────────────┘
```

### Caching Layer (Redis)

```typescript
// Cache Strategy
interface CacheConfig {
  // Session Cache
  "session:*": { ttl: "30m"; type: "user_session" };

  // Product Cache
  "product:*": { ttl: "1h"; type: "product_data" };
  "category:*": { ttl: "2h"; type: "category_data" };

  // Cart Cache
  "cart:*": { ttl: "24h"; type: "user_cart" };

  // Analytics Cache
  "analytics:*": { ttl: "5m"; type: "real_time_data" };
}
```

### Search Engine (Elasticsearch)

```json
{
  "products_index": {
    "mappings": {
      "properties": {
        "name": { "type": "text", "analyzer": "standard" },
        "description": { "type": "text", "analyzer": "standard" },
        "category": { "type": "keyword" },
        "price": { "type": "float" },
        "tags": { "type": "keyword" },
        "availability": { "type": "boolean" },
        "created_at": { "type": "date" }
      }
    }
  }
}
```

---

## Integration Architecture

### Third-Party Integrations

```typescript
// Integration Layer
interface IntegrationConfig {
  payment: {
    stripe: { primary: true; regions: ["global"] };
    promptpay: { regions: ["TH"] };
    grabpay: { regions: ["TH", "SG", "MY"] };
  };

  shipping: {
    thailand_post: { regions: ["TH"] };
    kerry_express: { regions: ["TH"] };
    dhl: { regions: ["global"] };
  };

  marketing: {
    facebook_pixel: { enabled: true };
    google_analytics: { enabled: true };
    line_notify: { regions: ["TH"] };
  };

  communication: {
    twilio: { sms: true; voice: true };
    sendgrid: { email: true };
    line_messaging: { regions: ["TH"] };
  };
}
```

### Event-Driven Architecture

```typescript
// Event System
interface EventBus {
  // Order Events
  "order.created": OrderCreatedEvent;
  "order.paid": OrderPaidEvent;
  "order.shipped": OrderShippedEvent;
  "order.delivered": OrderDeliveredEvent;

  // Inventory Events
  "inventory.low_stock": LowStockEvent;
  "inventory.out_of_stock": OutOfStockEvent;
  "inventory.restocked": RestockedEvent;

  // User Events
  "user.registered": UserRegisteredEvent;
  "user.login": UserLoginEvent;
  "user.purchase": UserPurchaseEvent;
}
```

---

## Security Architecture

### Authentication & Authorization

```typescript
// Security Layer
interface SecurityConfig {
  authentication: {
    jwt: {
      access_token_ttl: "15m";
      refresh_token_ttl: "7d";
      algorithm: "RS256";
    };
    oauth: {
      google: { enabled: true };
      facebook: { enabled: true };
      line: { enabled: true; regions: ["TH"] };
    };
    mfa: {
      totp: { enabled: true };
      sms: { enabled: true; provider: "twilio" };
    };
  };

  authorization: {
    rbac: {
      roles: ["customer", "admin", "super_admin"];
      permissions: ["read", "write", "delete", "admin"];
    };
    api_rate_limiting: {
      anonymous: "100/hour";
      authenticated: "1000/hour";
      admin: "10000/hour";
    };
  };
}
```

### Data Protection

```typescript
// Encryption Configuration
interface DataProtection {
  encryption: {
    at_rest: {
      algorithm: "AES-256-GCM";
      key_rotation: "90d";
    };
    in_transit: {
      tls_version: "1.3";
      cipher_suites: ["TLS_AES_256_GCM_SHA384"];
    };
  };

  privacy: {
    pii_encryption: true;
    data_retention: {
      customer_data: "7_years";
      analytics_data: "2_years";
      logs: "30_days";
    };
    gdpr_compliance: true;
    pdpa_compliance: true;
  };
}
```

---

## Deployment Architecture

### Cloud Infrastructure (AWS)

```yaml
# Infrastructure Configuration
environments:
  production:
    compute:
      - service: ECS Fargate
        instances: 3
        auto_scaling:
          min: 3
          max: 10
          target_cpu: 70%

    database:
      - service: RDS PostgreSQL
        instance_type: db.r6g.xlarge
        multi_az: true
        backup_retention: 30_days

    cache:
      - service: ElastiCache Redis
        instance_type: cache.r6g.large
        cluster_mode: enabled

    storage:
      - service: S3
        storage_class: Standard-IA
        lifecycle_policy: enabled

    cdn:
      - service: CloudFront
        edge_locations: global
        compression: enabled

  staging:
    # Similar configuration with smaller instances

  development:
    # Minimal configuration for development
```

### Container Strategy (Docker + Kubernetes)

```dockerfile
# Multi-stage Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# Kubernetes Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sofa-cover-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sofa-cover
  template:
    metadata:
      labels:
        app: sofa-cover
    spec:
      containers:
        - name: app
          image: sofa-cover:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
```

---

## Performance Architecture

### Caching Strategy

```typescript
// Multi-Level Caching
interface CachingStrategy {
  level1_cdn: {
    provider: "cloudflare";
    cache_static_assets: "1year";
    cache_api_responses: "5min";
    edge_locations: "global";
  };

  level2_application: {
    provider: "redis";
    cache_database_queries: "1hour";
    cache_computed_results: "30min";
    cache_session_data: "30min";
  };

  level3_database: {
    query_cache: "enabled";
    result_cache: "15min";
    index_optimization: "automatic";
  };
}
```

### Load Balancing & Auto-Scaling

```typescript
// Scaling Configuration
interface ScalingConfig {
  load_balancer: {
    algorithm: "least_connections";
    health_checks: {
      interval: "30s";
      timeout: "5s";
      healthy_threshold: 2;
      unhealthy_threshold: 3;
    };
  };

  auto_scaling: {
    metrics: ["cpu_utilization", "memory_utilization", "request_count"];
    cpu_threshold: 70;
    memory_threshold: 80;
    request_threshold: 1000;
    cooldown_period: "5min";
  };
}
```

---

## Monitoring & Observability

### Application Monitoring

```typescript
// Monitoring Stack
interface MonitoringConfig {
  metrics: {
    provider: "prometheus";
    exporters: ["node_exporter", "postgres_exporter"];
    retention: "30d";
  };

  logging: {
    provider: "elasticsearch";
    log_levels: ["error", "warn", "info", "debug"];
    retention: "30d";
    structured_logging: true;
  };

  tracing: {
    provider: "jaeger";
    sampling_rate: 0.1;
    retention: "7d";
  };

  alerting: {
    provider: "alertmanager";
    channels: ["slack", "email", "pagerduty"];
    sla_targets: {
      availability: "99.9%";
      response_time: "2s";
      error_rate: "<1%";
    };
  };
}
```

---

## Migration & Integration Plan

### Phase 2 Integration Timeline

#### Month 1: Foundation

- **Week 1-2**: Infrastructure setup (AWS, Kubernetes)
- **Week 3-4**: Database migrations และ API versioning

#### Month 2: Core Services

- **Week 1-2**: Authentication service upgrade
- **Week 3-4**: Product และ order services enhancement

#### Month 3: Advanced Features

- **Week 1-2**: Real-time features implementation
- **Week 3-4**: Analytics และ reporting services

#### Month 4: Mobile & Global

- **Week 1-2**: Mobile API development
- **Week 3-4**: Multi-language และ multi-currency support

---

**Document Version**: 1.0
**Last Updated**: 2025-08-20
**Next Review Date**: 2025-09-20
**Owner**: Technical Architect
**Reviewers**: CTO, Lead Developer, DevOps Engineer
