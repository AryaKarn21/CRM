import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Employee extends Model {}

Employee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: true, unique: true },
    employeeId: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    // ================= Personal Information =================
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },

    
    phone: { type: DataTypes.STRING },
    dateOfBirth: { type: DataTypes.DATE, allowNull: true },
    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: true,
    },
    maritalStatus: {
      type: DataTypes.ENUM("Single", "Married", "Divorced", "Widowed"),
      allowNull: true,
    },
    bloodGroup: { type: DataTypes.STRING, allowNull: true },
    nationality: { type: DataTypes.STRING, allowNull: true },
    citizenshipNumber: { type: DataTypes.STRING, allowNull: true },
    avatar: { type: DataTypes.STRING },

    // ================= Contact Information =================
    address: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
    postalCode: { type: DataTypes.STRING },
    emergencyContactName: { type: DataTypes.STRING },
    emergencyPhone: { type: DataTypes.STRING },

    // ================= Employment Information =================
    department: { type: DataTypes.STRING, allowNull: false },
    designation: { type: DataTypes.STRING, allowNull: false },
    joinDate: { type: DataTypes.DATE, allowNull: false },
    employmentType: {
      type: DataTypes.ENUM(
        "Full-Time",
        "Part-Time",
        "Contract",
        "Intern",
        "Consultant",
      ),
      defaultValue: "Full-Time",
    },
    confirmationDate: { type: DataTypes.DATE, allowNull: true },
    shiftId: { type: DataTypes.UUID, allowNull: true },
    reportingManagerId: { type: DataTypes.UUID, allowNull: true },
    workLocation: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM("active", "inactive", "on_leave", "terminated"),
      defaultValue: "active",
    },

    // ================= Salary Information =================
    salary: { type: DataTypes.FLOAT, allowNull: false },
    salaryType: {
      type: DataTypes.ENUM("Monthly", "Daily", "Hourly"),
      defaultValue: "Monthly",
    },
    currency: { type: DataTypes.STRING, defaultValue: "NPR" },
    salaryEffectiveDate: { type: DataTypes.DATE, allowNull: true },
    allowances: { type: DataTypes.FLOAT, defaultValue: 0 },
    bonus: { type: DataTypes.FLOAT, defaultValue: 0 },
    overtime: { type: DataTypes.FLOAT, defaultValue: 0 },
    tax: { type: DataTypes.FLOAT, defaultValue: 0 },
    pf: { type: DataTypes.FLOAT, defaultValue: 0 },
    insurance: { type: DataTypes.FLOAT, defaultValue: 0 },

    // ================= Bank Information =================
    bankName: { type: DataTypes.STRING },
    accountHolderName: { type: DataTypes.STRING },
    bankAccountNumber: { type: DataTypes.STRING },
    ifscSwiftCode: { type: DataTypes.STRING },
    paymentMethod: {
      type: DataTypes.ENUM("Bank Transfer", "Cash", "Cheque", "Digital Wallet"),
      defaultValue: "Bank Transfer",
    },

    // ================= Government Information =================
    panTaxNumber: { type: DataTypes.STRING },
    pfNumber: { type: DataTypes.STRING },
    esiNumber: { type: DataTypes.STRING },

    // ================= Misc =================
    salaryNotes: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employees",
    timestamps: true,
   indexes: [
  {
    unique: true,
    fields: ["companyId", "employeeId"],
  },
  { fields: ["companyId", "department"] },
  { fields: ["companyId", "status"] },
  { fields: ["shiftId"] },
  { fields: ["reportingManagerId"] },
],
  },
);

export default Employee;
