export const isSecureAuthCookie = process.env.NODE_ENV === 'production'

export const sessionCookieName = isSecureAuthCookie
  ? '__Secure-finance.session-token'
  : 'finance.session-token'

export const callbackCookieName = isSecureAuthCookie
  ? '__Secure-finance.callback-url'
  : 'finance.callback-url'

export const csrfCookieName = isSecureAuthCookie
  ? '__Host-finance.csrf-token'
  : 'finance.csrf-token'

export const pkceCookieName = isSecureAuthCookie
  ? '__Secure-finance.pkce.code_verifier'
  : 'finance.pkce.code_verifier'

export const stateCookieName = isSecureAuthCookie
  ? '__Secure-finance.state'
  : 'finance.state'
