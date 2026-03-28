import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/finance-hub'
  }
})

export const config = {
  matcher: ['/app/:path*', '/api/data/:path*']
}
