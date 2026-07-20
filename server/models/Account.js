import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Account extends Model {}

Account.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    accountNumber: {
      type: DataTypes.STRING,
      unique: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    industry: {
      type: DataTypes.STRING,
    },

    type: {
      type: DataTypes.ENUM(
        "Customer",
        "Partner",
        "Prospect",
        "Competitor",
        "Vendor",
        "Other"
      ),
      defaultValue: "Customer",
    },

    status: {
      type: DataTypes.ENUM(
        "Active",
        "Inactive",
        "Blocked"
      ),
      defaultValue: "Active",
    },

    website: {
      type: DataTypes.STRING,
    },

    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },

    phone: {
      type: DataTypes.STRING,
    },

    mobile: {
      type: DataTypes.STRING,
    },

    annualRevenue: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },

    employees: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    currency: {
      type: DataTypes.STRING,
      defaultValue: "NPR",
    },

    billingStreet: {
      type: DataTypes.STRING,
    },

    billingCity: {
      type: DataTypes.STRING,
    },

    billingState: {
      type: DataTypes.STRING,
    },

    billingCountry: {
      type: DataTypes.STRING,
    },

    billingZip: {
      type: DataTypes.STRING,
    },

    shippingStreet: {
      type: DataTypes.STRING,
    },

    shippingCity: {
      type: DataTypes.STRING,
    },

    shippingState: {
      type: DataTypes.STRING,
    },

    shippingCountry: {
      type: DataTypes.STRING,
    },

    shippingZip: {
      type: DataTypes.STRING,
    },

    assignedToId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    parentAccountId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    creditLimit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },

    taxNumber: {
      type: DataTypes.STRING,
    },

  gstNumber: {
  type: DataTypes.STRING,
},

panNumber: {
  type: DataTypes.STRING,
},

paymentTerms: {
  type: DataTypes.STRING,
},

ownership: {
  type: DataTypes.ENUM(
    "Private",
    "Public",
    "Government",
    "Partnership",
    "Non-Profit",
    "Other"
  ),
},

rating: {
  type: DataTypes.ENUM(
    "Hot",
    "Warm",
    "Cold"
  ),
  defaultValue: "Warm",
},

territory: {
  type: DataTypes.STRING,
},

source: {
  type: DataTypes.STRING,
},

priority: {
  type: DataTypes.ENUM(
    "Low",
    "Medium",
    "High"
  ),
  defaultValue: "Medium",
},
   
    description: {
      type: DataTypes.TEXT,
    },

    logo: {
      type: DataTypes.STRING,
    },

    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Account",
    tableName: "accounts",
    timestamps: true,

    indexes: [
      {
        fields: ["companyId"],
      },
      {
        fields: ["name"],
      },
      {
        fields: ["accountNumber"],
        unique: true,
      },
      {
        fields: ["email"],
      },
      {
        fields: ["assignedToId"],
      },
    ],
  }
);

export default Account;