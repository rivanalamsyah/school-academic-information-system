import { User } from "../types";
import { Role, PermissionAction, hasPermission, canAccessMenu, ROLE_PERMISSIONS, ROLE_MENUS } from "../utils/permissions";

const VALID_ROLES: readonly Role[] = ["super_admin", "admin", "guru", "siswa"];

export function usePermissions(user: User | null) {
  // Validate role at runtime to ensure type safety (guard against invalid DB values)
  const rawRole = user?.role;
  const role: Role | undefined = rawRole && (VALID_ROLES as readonly string[]).includes(rawRole) 
    ? (rawRole as Role) 
    : undefined;

  /**
   * Checks if the current user is permitted to perform a specific action
   */
  const can = (action: PermissionAction): boolean => {
    if (!role) return false;
    return hasPermission(role, action);
  };

  /**
   * Checks if the current user is permitted to view a specific menu in the panel
   */
  const canAccess = (menu: string): boolean => {
    if (!role) return false;
    return canAccessMenu(role, menu);
  };

  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin";
  const isGuru = role === "guru";
  const isSiswa = role === "siswa";
  const isAnyAdmin = isSuperAdmin || isAdmin;

  return {
    role,
    isSuperAdmin,
    isAdmin,
    isGuru,
    isSiswa,
    isAnyAdmin,
    can,
    canAccess,
    allowedMenus: role ? (ROLE_MENUS[role] || []) : [],
    allowedPermissions: role ? (ROLE_PERMISSIONS[role] || []) : [],
  };
}
