# 📚 Knowledge Base - SofaCover Pro

ฐานความรู้รวบรวมข้อมูลสำคัญ คำถามที่พบบ่อย และแนวทางปฏิบัติที่ดีที่สุด

## 🎯 Quick Navigation

- [Architecture Overview](#architecture-overview)
- [Development Guidelines](#development-guidelines)
- [Deployment Process](#deployment-process)
- [Troubleshooting](#troubleshooting)
- [FAQ](#frequently-asked-questions)
- [Best Practices](#best-practices)

## 🏗️ Architecture Overview

### System Architecture
\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (Supabase)    │
│   - React       │    │   - Node.js     │    │   - PostgreSQL  │
│   - TypeScript  │    │   - Supabase    │    │   - Auth        │
│   - Tailwind    │    │   - Redis       │    │   - Storage     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Cache     │    │   Monitoring    │    │   External      │
│   - Vercel      │    │   - Custom      │    │   - Payment     │
│   - Cloudflare  │    │   - Alerts      │    │   - Email       │
│   - Redis       │    │   - Metrics     │    │   - Analytics   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

### Data Flow
1. **User Request** → Frontend (Next.js)
2. **API Call** → Backend (API Routes)
3. **Database Query** → Supabase (PostgreSQL)
4. **Cache Check** → Redis (if applicable)
5. **Response** → Frontend → User

### Key Components
- **Authentication**: Supabase Auth + Custom middleware
- **Database**: PostgreSQL with RLS policies
- **Caching**: Multi-level (Memory, Redis, CDN)
- **Monitoring**: Custom monitoring service
- **Security**: Input validation, rate limiting, HTTPS

## 💻 Development Guidelines

### Code Style
\`\`\`typescript
// ✅ Good: Clear, typed, documented
interface ProductProps {
  id: string
  name: string
  price: number
  onAddToCart: (productId: string) => void
}

/**
 * Product card component for displaying product information
 */
export function ProductCard({ id, name, price, onAddToCart }: ProductProps) {
  const handleAddToCart = useCallback(() => {
    onAddToCart(id)
  }, [id, onAddToCart])

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-gray-600">฿{price.toLocaleString()}</p>
      <button 
        onClick={handleAddToCart}
        className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        เพิ่มลงตะกร้า
      </button>
    </div>
  )
}

// ❌ Bad: No types, unclear naming, no documentation
export function Card({ data, onClick }) {
  return (
    <div onClick={() => onClick(data.id)}>
      <h3>{data.n}</h3>
      <p>{data.p}</p>
