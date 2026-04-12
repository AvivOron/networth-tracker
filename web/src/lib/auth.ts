import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import {
  callbackCookieName,
  csrfCookieName,
  isSecureAuthCookie,
  pkceCookieName,
  sessionCookieName,
  stateCookieName,
} from './auth-cookies'

export const DEMO_USER_EMAIL = 'tour-demo@finance-hub.local'

export const authOptions: NextAuthOptions = {
  cookies: {
    sessionToken: { name: sessionCookieName, options: { httpOnly: true, sameSite: 'lax', path: '/', secure: isSecureAuthCookie } },
    callbackUrl: { name: callbackCookieName, options: { httpOnly: true, sameSite: 'lax', path: '/', secure: isSecureAuthCookie } },
    csrfToken: { name: csrfCookieName, options: { httpOnly: true, sameSite: 'lax', path: '/', secure: isSecureAuthCookie } },
    pkceCodeVerifier: { name: pkceCookieName, options: { httpOnly: true, sameSite: 'lax', path: '/', secure: isSecureAuthCookie } },
    state: { name: stateCookieName, options: { httpOnly: true, sameSite: 'lax', path: '/', secure: isSecureAuthCookie } },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.isDemo = user.email === DEMO_USER_EMAIL
      }
      return token
    },
    // Expose the user id and demo status in the session object
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        isDemo: token.isDemo as boolean
      }
    })
  },
  pages: {
    signIn: '/',
    error: '/auth/error'
  }
}
