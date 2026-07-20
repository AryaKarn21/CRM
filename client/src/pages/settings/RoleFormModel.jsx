import FormModal from "@/components/shared/FormModal";
import PermissionGroup from "./PermissionGroup";
import { PERMISSION_MODULES, ALL_PERMISSION_KEYS } from "./roles/permissionMeta";

import {
  LayoutDashboard,
  Briefcase,
  Users,
  Wallet,
  Package,
  Boxes,
  FolderKanban,
  LifeBuoy,
  Settings,
} from "lucide-react";

const MODULE_ICONS = {
  dashboard: <LayoutDashboard size={18} />,
  crm: <Briefcase size={18} />,
  hr: <Users size={18} />,
  finance: <Wallet size={18} />,
  inventory: <Package size={18} />,
  assets: <Boxes size={18} />,
  projects: <FolderKanban size={18} />,
  support: <LifeBuoy size={18} />,
  settings: <Settings size={18} />,
}

export default function RoleFormModal({
  open,
  onClose,
  register,
  handleSubmit,
  onSubmit,
  loading,
  watch,
  setValue,
  mode = "create",
}) {
  const allValues = ALL_PERMISSION_KEYS.map((key) => watch?.(`permissions.${key}`))
  const allSelected = allValues.length > 0 && allValues.every(Boolean)

  const handleSelectAll = () => {
    if (!setValue) return
    const next = !allSelected
    ALL_PERMISSION_KEYS.forEach((key) => setValue(`permissions.${key}`, next))
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit Role" : "Create Role"}
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
      submitLabel={mode === "edit" ? "Save Changes" : "Create Role"}
      size="xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Role Name *</label>
            <input className="input" placeholder="Sales Manager" {...register("name")} />
          </div>
          <div>
            <label className="form-label">Description</label>
            <input className="input" placeholder="Role description" {...register("description")} />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Permissions</h2>
          <button type="button" onClick={handleSelectAll} className="text-blue-600 text-sm hover:underline">
            {allSelected ? "Unselect All" : "Select All"}
          </button>
        </div>

        {PERMISSION_MODULES.map((mod) => (
          <PermissionGroup
            key={mod.key}
            title={mod.title}
            icon={MODULE_ICONS[mod.key]}
            permissions={mod.permissions.map((p) => p.key)}
            labels={Object.fromEntries(mod.permissions.map((p) => [p.key, p.label]))}
            register={register}
            watch={watch}
            setValue={setValue}
          />
        ))}
      </div>
    </FormModal>
  );
}