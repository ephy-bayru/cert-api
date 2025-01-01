export interface JwtPayload {
  sub: string;
  role: string;
  orgId?: string;
  iat?: number;
  exp?: number;
}
