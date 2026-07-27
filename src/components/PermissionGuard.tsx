import { ReactNode } from "react";
import { User } from "../types";
import { usePermissions } from "../hooks/usePermissions";
import { PermissionAction } from "../utils/permissions";

interface PermissionGuardProps {
  user: User;
  action?: PermissionAction;
  menu?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  user,
  action,
  menu,
  fallback = null,
  children
}: PermissionGuardProps) {
  const { can, canAccess } = usePermissions(user);

  let allowed = true;

  if (action) {
    allowed = allowed && can(action);
  }

  if (menu) {
    allowed = allowed && canAccess(menu);
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
