import FormModal from "@/components/shared/FormModal";
import PermissionGroup from "./PermissionGroup";

import {
  LayoutDashboard,
  Briefcase,
  Users,
  Wallet,
  Package,
  FolderKanban,
  LifeBuoy,
  Settings,
} from "lucide-react";

const permissionGroups = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    permissions: ["dashboard"],
  },
  {
    title: "CRM",
    icon: <Briefcase size={18} />,
    permissions: [
      "leads",
      "accounts",
      "contacts",
      "opportunities",
    ],
  },
  {
    title: "HR",
    icon: <Users size={18} />,
    permissions: [
      "employees",
      "attendance",
      "leave",
      "payroll",
    ],
  },
  {
    title: "Finance",
    icon: <Wallet size={18} />,
    permissions: [
      "expenses",
      "ledger",
      "reports",
    ],
  },
  {
    title: "Inventory",
    icon: <Package size={18} />,
    permissions: [
      "warehouse",
      "inventory",
      "assets",
    ],
  },
  {
    title: "Projects",
    icon: <FolderKanban size={18} />,
    permissions: [
      "projects",
      "tasks",
    ],
  },
  {
    title: "Support",
    icon: <LifeBuoy size={18} />,
    permissions: ["tickets"],
  },
  {
    title: "Settings",
    icon: <Settings size={18} />,
    permissions: [
      "company",
      "users",
      "roles",
      "auditlog",
    ],
  },
];

export default function RoleFormModal({
  open,
  onClose,
  register,
  handleSubmit,
  onSubmit,
  loading,
}) {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Create Role"
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
      submitLabel="Create Role"
      size="xl"
    >
      <div className="space-y-6">

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="form-label">
              Role Name *
            </label>

            <input
              className="input"
              placeholder="Sales Manager"
              {...register("name")}
            />
          </div>

          <div>
            <label className="form-label">
              Description
            </label>

            <input
              className="input"
              placeholder="Role description"
              {...register("description")}
            />
          </div>

        </div>

        <div className="flex justify-between items-center">

          <h2 className="text-lg font-semibold">
            Permissions
          </h2>

          <button
            type="button"
            className="text-blue-600 text-sm"
          >
            Select All
          </button>

        </div>

        {permissionGroups.map(group => (
          <PermissionGroup
            key={group.title}
            title={group.title}
            icon={group.icon}
            permissions={group.permissions}
            register={register}
          />
        ))}

      </div>
    </FormModal>
  );
}