import http from 'http'
import next from 'next'

async function startServer() {
  const app = next({ dev: false })
  const handle = app.getRequestHandler()
  await app.prepare()
  return new Promise<http.Server>((resolve) => {
    const server = http.createServer((req, res) => handle(req, res))
    server.listen(3000, () => resolve(server))
  })
}

async function run() {
  process.env.QA_BYPASS_AUTH = '1'
  process.env.NEXT_PUBLIC_USE_SUPABASE = 'false'
  process.env.MAINTENANCE = '1'

  const server = await startServer()
  try {
    let res = await fetch('http://localhost:3000/')
    if (res.status !== 200) throw new Error('GET / failed')

    res = await fetch('http://localhost:3000/admin')
    if (res.status !== 200) throw new Error('GET /admin failed')

    res = await fetch('http://localhost:3000/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        billNumber: `QA-${Date.now()}`,
        customerEmail: 'qa@example.com',
        customerName: 'Mock User',
        amount: 1234,
        status: 'draft',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        items: [],
      }),
    })
    if (res.status !== 200) throw new Error('Create bill failed')
    const bill = await res.json()
    const billId = bill.id
    if (!billId) throw new Error('Bill id missing')

    res = await fetch(`http://localhost:3000/bill/view/${billId}`)
    const html = await res.text()
    if (res.status !== 200) throw new Error('GET bill view failed')
    if (!html.includes('ยอดรวม') && !html.includes('฿')) throw new Error('Bill total missing')

    res = await fetch('http://localhost:3000/api/admin/orders/bulk-export')
    if (res.status !== 200) throw new Error('Bulk export failed')
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('text/csv')) throw new Error('Bulk export not csv')

    console.log('QA smoke passed')
  } finally {
    server.close()
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
