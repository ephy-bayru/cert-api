import { GlobalRole } from "@common/enums/global-role.enum";

export interface JwtPayload {
  sub: string;
  roles: GlobalRole[];
  orgId?: string;
  iat?: number;
  exp?: number;
}
