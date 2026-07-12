export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  LEADS: '/crm/leads',
  LEAD_DETAIL: (id) => `/crm/leads/${id}`,
  ACCOUNTS: '/crm/accounts',
  ACCOUNT_DETAIL: (id) => `/crm/accounts/${id}`,
  CONTACTS: '/crm/contacts',
  OPPORTUNITIES: '/crm/opportunities',
  EMPLOYEES: '/hr/employees',
  EMPLOYEE_DETAIL: (id) => `/hr/employees/${id}`,
  ATTENDANCE: '/hr/attendance',
  LEAVES: '/hr/leaves',
  PAYROLL: '/hr/payroll',
  FINANCE: '/finance',
  EXPENSES: '/finance/expenses',
  LEDGER: '/finance/ledger',
  INVENTORY: '/inventory',
  PROCUREMENT: '/procurement',
  PROJECTS: '/projects',
  SUPPORT: '/support',
  REPORTS: '/reports',
  SETTINGS: '/settings',
}

export const LEAD_STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']

export const OPPORTUNITY_STAGES = ['Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition', 'Decision Makers', 'Perception Analysis', 'Proposal/Price', 'Negotiation/Review', 'Closed Won', 'Closed Lost']

export const TICKET_STATUS = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed']

export const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Urgent']

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: "admin",
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  ACCOUNTANT: 'accountant',
}

export const CURRENCIES = ['NPR', 'USD', 'EUR', 'GBP', 'INR']