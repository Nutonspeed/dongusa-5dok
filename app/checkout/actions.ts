'use server'

import { redirect } from 'next/navigation'
import { getMockProductById } from '@/lib/mock-database'
import { sendOrderConfirmationEmail } from '@/lib/email' // Assuming this function exists
// import { toast } from '@/hooks/use-toast' // Server actions can't use client toasts directly, but this is a mock.

interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  color?: string
  size?: string
  quantity: number
  stock: number
}

interface OrderData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  zipCode: string
  cartItems: CartItem[]
  totalPrice: number
}

export async function submitOrder(orderData: OrderData) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Basic validation (more robust validation would be needed in a real app)
  if (!orderData.firstName || !orderData.lastName || !orderData.email || !orderData.address || !orderData.cartItems || orderData.cartItems.length === 0) {
    return { success: false, message: 'ข้อมูลไม่ครบถ้วน โปรดกรอกข้อมูลให้ครบถ้วน' }
  }

  // Simulate saving order to a database
  console.log('Order received:', orderData)

  // Simulate stock deduction (in a real app, this would interact with a database)
  for (const item of orderData.cartItems) {
    const product = await getMockProductById(item.id);
    if (product && product.stock < item.quantity) {
      return { success: false, message: `สินค้า ${item.name} มีจำนวนไม่พอในสต็อก` };
    }
    // In a real scenario, you'd update the product stock in your database here.
    // For mock, we just log it.
    console.log(`Deducting ${item.quantity} from stock for ${item.name}`);
  }

  // Simulate sending confirmation email
  try {
    // This is a mock email function. In a real app, you'd use a service like Resend or Nodemailer.
    await sendOrderConfirmationEmail({
      to: orderData.email,
      orderId: `ORDER-${Date.now()}`, // Mock order ID
      customerName: `${orderData.firstName} ${orderData.lastName}`,
      items: orderData.cartItems,
      total: orderData.totalPrice,
    });
    console.log(`Order confirmation email sent to ${orderData.email}`);
  } catch (emailError) {
    console.error('Failed to send order confirmation email:', emailError);
    // Decide if you want to fail the order or just log the email error
  }

  // In a real application, you would store this order in your database
  // and return a unique order ID. For this mock, we'll just redirect.

  // Redirect to order confirmation page with a success message or order ID
  redirect(`/order-confirmation?orderId=MOCK-${Date.now()}&total=${orderData.totalPrice}`);
}
