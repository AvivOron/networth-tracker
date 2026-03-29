import { withAuth } from 'next-auth/middleware'

const authMiddleware = withAuth({
  pages: { signIn: '/' },
  secret: process.env.NEXTAUTH_SECRET
})

export default authMiddleware

export const config = {
  matcher: ['/finance-hub/app/:path*', '/finance-hub/api/data/:path*']
}
