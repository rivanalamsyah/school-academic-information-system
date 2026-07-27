export type Role = "super_admin" | "admin" | "guru" | "siswa";

export type PermissionAction =
  | "view_dashboard"
  | "manage_settings"
  | "manage_academicyear"
  | "manage_classroom"
  | "manage_subject"
  | "manage_teacher"
  | "manage_student"
  | "manage_schedule"
  | "manage_ppdb"
  | "view_logs"
  | "manage_backups"
  | "manage_attendance"
  | "manage_grades"
  | "view_grades"
  | "view_schedule"
  | "view_profile"
  | "view_reports";

// Detailed mapping of what each role can execute (Permissions RBAC)
export const ROLE_PERMISSIONS: Record<Role, PermissionAction[]> = {
  super_admin: [
    "view_dashboard",
    "manage_settings",
    "manage_academicyear",
    "manage_classroom",
    "manage_subject",
    "manage_teacher",
    "manage_student",
    "manage_schedule",
    "manage_ppdb",
    "view_logs",
    "manage_backups",
    "manage_attendance",
    "manage_grades",
    "view_grades",
    "view_schedule",
    "view_profile",
    "view_reports",
  ],
  admin: [
    "view_dashboard",
    "manage_settings",
    "manage_academicyear",
    "manage_classroom",
    "manage_subject",
    "manage_teacher",
    "manage_student",
    "manage_schedule",
    "manage_ppdb",
    // "view_logs", // Excluded for admin (Super Admin only for audit trails)
    // "manage_backups", // Excluded for admin (Super Admin only for database backups)
    "manage_attendance",
    "manage_grades",
    "view_grades",
    "view_schedule",
    "view_profile",
    "view_reports",
  ],
  guru: [
    "view_dashboard",
    "view_profile",
    "manage_attendance",
    "manage_grades",
    "view_grades",
    "view_schedule",
    "view_reports",
  ],
  siswa: [
    "view_dashboard",
    "view_profile",
    "view_grades",
    "view_schedule",
  ],
};

// Map of accessible menus for each role in the dashboard sidebar/tabs
export const ROLE_MENUS: Record<Role, string[]> = {
  super_admin: [
    "home",
    "calendar",
    "messages",
    "settings",
    "academicyear",
    "classroom",
    "subject",
    "teacher",
    "student",
    "schedule",
    "reports",
    "ppdb",
    "logs",
    "backups",
    "forum",
  ],
  admin: [
    "home",
    "calendar",
    "messages",
    "settings",
    "academicyear",
    "classroom",
    "subject",
    "teacher",
    "student",
    "schedule",
    "reports",
    "ppdb",
    "forum",
  ],
  guru: [
    "home",
    "calendar",
    "messages",
    "checkin",
    "attendance",
    "grades",
    "reports",
    "forum",
  ],
  siswa: [
    "home",
    "calendar",
    "checkin",
    "grades",
    "schedule",
    "forum",
  ],
};

/**
 * Checks if a user role is permitted to perform a specific action
 */
export function hasPermission(role: Role, action: PermissionAction): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) || false;
}

/**
 * Checks if a user role can access a specific menu view
 */
export function canAccessMenu(role: Role, menu: string): boolean {
  return ROLE_MENUS[role]?.includes(menu) || false;
}
