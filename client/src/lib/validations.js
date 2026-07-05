import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const leadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  stage: z.string().min(1, 'Stage is required'),
  value: z.coerce.number().min(0).optional(),
  source: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
})

export const accountSchema = z.object({
  name: z.string().min(2, 'Account name is required'),
  industry: z.string().optional(),
  website: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  type: z.string().optional(),
  revenue: z.coerce.number().min(0).optional(),
})

export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  account: z.string().optional(),
  department: z.string().optional(),
})

export const opportunitySchema = z.object({
  name: z.string().min(2, 'Opportunity name is required'),
  account: z.string().min(1, 'Account is required'),
  stage: z.string().min(1, 'Stage is required'),
  value: z.coerce.number().min(0, 'Value must be positive'),
  probability: z.coerce.number().min(0).max(100).optional(),
  closeDate: z.string().min(1, 'Close date is required'),
  assignedTo: z.string().optional(),
  description: z.string().optional(),
})

export const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  joinDate: z.string().min(1, 'Join date is required'),
  salary: z.coerce.number().min(0, 'Salary must be positive'),
  employeeId: z.string().optional(),
})

export const expenseSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
})

export const ticketSchema = z.object({
  subject: z.string().min(3, 'Subject is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.string().min(1, 'Priority is required'),
  status: z.string().optional(),
  category: z.string().optional(),

  assignedToId: z.string().optional(),
})
export const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.string().optional(),
  budget: z.coerce.number().min(0).optional(),
  client: z.string().optional(),
})