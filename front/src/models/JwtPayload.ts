// models/JwtPayload.ts
export interface JwtPayload {
  sub: string // username
  role?: string // Rôle unique (string)
  roles?: string | string[] // String "ROLE_ADMIN,ROLE_USER" OU tableau
  authorities?: string | string[] // Ou authorities (Spring Security)
  exp: number // Expiration timestamp
  iat?: number // Issued at timestamp
}
