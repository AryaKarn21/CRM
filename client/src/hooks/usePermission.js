import { useAuthStore } from "@/store/auth.store";

export function usePermission() {
  const { user } = useAuthStore();

  const role = user?.role;

  // Permissions coming from Role.permissions JSON
  const permissions =
    user?.roleInfo?.permissions ||
    user?.permissions ||
    {};

  const hasPermission = (permission) => {
    // Super Admin bypass
    if (role === "super_admin") return true;

    const [module, action] = permission.split(".");

    return !!permissions?.[module]?.[action];
  };

  return {
    role,

    permissions,

    hasPermission,

    canCreate: hasPermission("common.create"),
    canEdit: hasPermission("common.edit"),
    canDelete: hasPermission("common.delete"),

    isAdmin:
      role === "super_admin" ||
      role === "admin",

    isSuperAdmin:
      role === "super_admin",
  };
}