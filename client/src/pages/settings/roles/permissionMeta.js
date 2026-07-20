// Single source of truth mapping raw permission keys (stored on
// Role.permissions as { key: true/false }) to human-readable module +
// label pairs. Nothing in the UI should ever render a raw key or a
// permission ID — everything reads through this map.

export const PERMISSION_MODULES = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    permissions: [{ key: 'dashboard', label: 'View Dashboard' }],
  },
  {
    key: 'crm',
    title: 'CRM',
    permissions: [
      { key: 'leads', label: 'Leads' },
      { key: 'accounts', label: 'Accounts' },
      { key: 'contacts', label: 'Contacts' },
      { key: 'opportunities', label: 'Opportunities' },
    ],
  },
  {
    key: 'hr',
    title: 'HR',
    permissions: [
      { key: 'employees', label: 'Employees' },
      { key: 'attendance', label: 'Attendance' },
      { key: 'leave', label: 'Leave Management' },
      { key: 'payroll', label: 'Payroll' },
    ],
  },
  {
    key: 'finance',
    title: 'Finance',
    permissions: [
      { key: 'expenses', label: 'Expenses' },
      { key: 'ledger', label: 'General Ledger' },
      { key: 'reports', label: 'Financial Reports' },
    ],
  },
  {
    key: 'inventory',
    title: 'Inventory',
    permissions: [
      { key: 'warehouse', label: 'Warehouses' },
      { key: 'inventory', label: 'Stock Items' },
    ],
  },
  {
    key: 'assets',
    title: 'Assets',
    permissions: [{ key: 'assets', label: 'Company Assets' }],
  },
  {
    key: 'projects',
    title: 'Projects',
    permissions: [
      { key: 'projects', label: 'Projects' },
      { key: 'tasks', label: 'Tasks' },
    ],
  },
  {
    key: 'support',
    title: 'Support',
    permissions: [{ key: 'tickets', label: 'Support Tickets' }],
  },
  {
    key: 'settings',
    title: 'Settings',
    permissions: [
      { key: 'company', label: 'Company Settings' },
      { key: 'users', label: 'User Management' },
      { key: 'roles', label: 'Roles & Permissions' },
      { key: 'auditlog', label: 'Audit Log' },
    ],
  },
]

export const ALL_PERMISSION_KEYS = PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => p.key))

/**
 * Returns [{ key, title, total, granted }] — used for the module-summary
 * pills on each role card and for the coverage graph in the drawer.
 * Defensive: role.permissions may be null/undefined/malformed (e.g. an
 * array instead of an object, if old data ever slipped through) — this
 * never throws regardless of input shape.
 */
export function summarizeByModule(permissions) {
  const safePermissions =
    permissions && typeof permissions === 'object' && !Array.isArray(permissions) ? permissions : {}

  return PERMISSION_MODULES.map((mod) => {
    const total = mod.permissions.length
    const granted = mod.permissions.filter((p) => !!safePermissions[p.key]).length
    return { key: mod.key, title: mod.title, total, granted }
  }).filter((m) => m.total > 0)
}

export function totalGrantedCount(permissions) {
  const safePermissions =
    permissions && typeof permissions === 'object' && !Array.isArray(permissions) ? permissions : {}
  return ALL_PERMISSION_KEYS.filter((k) => !!safePermissions[k]).length
}