export interface JwtPayload {
  sub: string;              // User ID
  email: string;            // Email address
  unique_name: string;      // Username (maps to JwtRegisteredClaimNames.UniqueName)
  jti: string;              // Session ID
  role: string | string[];  // Single role or array of roles
  exp: number;              // Expiry (seconds since epoch)
  nbf?: number;
  iat?: number;
  iss?: string;
  aud?: string | string[];
}