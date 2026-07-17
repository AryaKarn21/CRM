import { z } from "zod";

export const employeeSchema = z.object({
  // ================= Personal Information =================
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  citizenshipNumber: z.string().optional(),


  


  // ================= Address =================
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  

  // ================= Emergency Contact =================
  emergencyContactName: z.string().optional(),
  emergencyPhone: z.string().optional(),

  // ================= Employment Information =================
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  joinDate: z.string().min(1, "Join date is required"),
  employmentType: z.string().optional(),
  confirmationDate: z.string().optional(),
  workLocation: z.string().optional(),
  status: z.string().optional(),
  // "" from an empty <select> would fail a UUID FK — coerce blank to undefined
  shiftId: z.preprocess((v) => (v === "" ? undefined : v), z.string().uuid().optional()),
  reportingManagerId: z.preprocess((v) => (v === "" ? undefined : v), z.string().uuid().optional()),

  // ================= Salary Information =================
  salary: z.coerce.number().min(0, "Salary must be positive"),
  salaryType: z.string().optional(),
  currency: z.string().optional(),
  salaryEffectiveDate: z.string().optional(),
  allowances: z.coerce.number().min(0).optional(),
  bonus: z.coerce.number().min(0).optional(),
  overtime: z.coerce.number().min(0).optional(),
  tax: z.coerce.number().min(0).optional(),
  pf: z.coerce.number().min(0).optional(),
  insurance: z.coerce.number().min(0).optional(),

  // ================= Bank Information =================
  bankName: z.string().optional(),
  accountHolderName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  ifscSwiftCode: z.string().optional(),
  paymentMethod: z.string().optional(),

  // ================= Government Information =================
  panTaxNumber: z.string().optional(),
  pfNumber: z.string().optional(),
  esiNumber: z.string().optional(),

  // ================= Notes =================
  salaryNotes: z.string().optional(),
});

export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Expense date is required"),
  description: z.string().optional(),
  status: z.string().optional(),
});