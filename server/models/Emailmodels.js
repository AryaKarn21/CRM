// ─────────────────────────────────────────────────────────────
// EMAIL MODULE — all models + associations in one self-contained file.
//
// Why one file: the email module is a bolt-on. Keeping its 10 models and
// their relationships together means models/index.js only needs a single
// import line, so adding (or removing) the whole module can never break
// an existing CRM module.
//
// Conventions match the rest of the project: class-based models, UUID
// primary keys, companyId / createdBy / updatedBy audit columns,
// paranoid soft deletes, and explicit indexes.
// ─────────────────────────────────────────────────────────────
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";
import Company from "./Company.js";
import User from "./User.js";

// Shared column set — every email table is company-scoped and audited.
const auditFields = () => ({
  companyId: { type: DataTypes.UUID, allowNull: false },
  createdBy: { type: DataTypes.UUID, allowNull: true },
  updatedBy: { type: DataTypes.UUID, allowNull: true },
});

const FOLDERS = ["inbox", "sent", "drafts", "spam", "trash", "archive", "scheduled", "outbox"];

// ═════════════════════════════════════════════════════════════
// 1. EmailAccount — a connected mailbox (Gmail / Outlook / SMTP / IMAP)
// ═════════════════════════════════════════════════════════════
class EmailAccount extends Model {}
EmailAccount.init(
  {
    id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ...auditFields(),
    userId:          { type: DataTypes.UUID, allowNull: false }, // mailbox owner
    provider:        { type: DataTypes.ENUM("gmail", "outlook", "microsoft365", "smtp", "imap"), allowNull: false },
    authType:        { type: DataTypes.ENUM("oauth2", "password"), defaultValue: "password" },
    email:           { type: DataTypes.STRING, allowNull: false },
    displayName:     { type: DataTypes.STRING },
    // Credentials are AES-256-GCM ciphertext (see utils/crypto.js) — never plaintext.
    encAccessToken:  { type: DataTypes.TEXT },
    encRefreshToken: { type: DataTypes.TEXT },
    encPassword:     { type: DataTypes.TEXT },
    tokenExpiresAt:  { type: DataTypes.DATE },
    smtpHost:        { type: DataTypes.STRING },
    smtpPort:        { type: DataTypes.INTEGER },
    smtpSecure:      { type: DataTypes.BOOLEAN, defaultValue: true },
    imapHost:        { type: DataTypes.STRING },
    imapPort:        { type: DataTypes.INTEGER },
    imapSecure:      { type: DataTypes.BOOLEAN, defaultValue: true },
    status:          { type: DataTypes.ENUM("active", "error", "disconnected"), defaultValue: "active" },
    syncEnabled:     { type: DataTypes.BOOLEAN, defaultValue: true },
    lastSyncedAt:    { type: DataTypes.DATE },
    lastError:       { type: DataTypes.TEXT },
    isDefault:       { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize, modelName: "EmailAccount", tableName: "email_accounts",
    timestamps: true, paranoid: true,
    indexes: [
      { fields: ["companyId", "userId"] },
      { fields: ["companyId", "status"] },
      { fields: ["email"] },
    ],
  }
);

// ═════════════════════════════════════════════════════════════
// 2. EmailThread — a conversation (groups related messages)
// ═════════════════════════════════════════════════════════════
class EmailThread extends Model {}
EmailThread.init(
  {
    id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ...auditFields(),
    accountId:     { type: DataTypes.UUID, allowNull: false },
    subject:       { type: DataTypes.STRING },
    participants:  { type: DataTypes.JSON, defaultValue: [] },
    messageCount:  { type: DataTypes.INTEGER, defaultValue: 1 },
    lastMessageAt: { type: DataTypes.DATE },
    snippet:       { type: DataTypes.TEXT },
    folder:        { type: DataTypes.ENUM(...FOLDERS), defaultValue: "inbox" },
    isRead:        { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize, modelName: "EmailThread", tableName: "email_threads",
    timestamps: true, paranoid: true,
    indexes: [
      { fields: ["companyId", "accountId"] },
      { fields: ["companyId", "folder"] },
      { fields: ["lastMessageAt"] },
    ],
  }
);

// ═════════════════════════════════════════════════════════════
// 3. Email — a single message (inbox item, sent mail, or draft)
// ═════════════════════════════════════════════════════════════
class Email extends Model {}
Email.init(
  {
    id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ...auditFields(),
    accountId:      { type: DataTypes.UUID, allowNull: false },
    threadId:       { type: DataTypes.UUID, allowNull: true },
    messageId:      { type: DataTypes.STRING }, // provider Message-ID header
    inReplyTo:      { type: DataTypes.STRING },
    folder:         { type: DataTypes.ENUM(...FOLDERS), defaultValue: "inbox" },
    subject:        { type: DataTypes.STRING },
    bodyHtml:       { type: DataTypes.TEXT("long") },
    bodyText:       { type: DataTypes.TEXT("long") },
    snippet:        { type: DataTypes.STRING },
    fromName:       { type: DataTypes.STRING },
    fromAddress:    { type: DataTypes.STRING },
    toAddresses:    { type: DataTypes.JSON, defaultValue: [] },
    ccAddresses:    { type: DataTypes.JSON, defaultValue: [] },
    bccAddresses:   { type: DataTypes.JSON, defaultValue: [] },
    replyTo:        { type: DataTypes.STRING },
    priority:       { type: DataTypes.ENUM("low", "normal", "high"), defaultValue: "normal" },
    isRead:         { type: DataTypes.BOOLEAN, defaultValue: false },
    isStarred:      { type: DataTypes.BOOLEAN, defaultValue: false },
    isImportant:    { type: DataTypes.BOOLEAN, defaultValue: false },
    hasAttachments: { type: DataTypes.BOOLEAN, defaultValue: false },
    status:         { type: DataTypes.ENUM("draft", "queued", "scheduled", "sending", "sent", "delivered", "failed", "bounced"), defaultValue: "draft" },
    scheduledAt:    { type: DataTypes.DATE },
    sentAt:         { type: DataTypes.DATE },
    deliveredAt:    { type: DataTypes.DATE },
    openedAt:       { type: DataTypes.DATE },
    openCount:      { type: DataTypes.INTEGER, defaultValue: 0 },
    clickCount:     { type: DataTypes.INTEGER, defaultValue: 0 },
    retryCount:     { type: DataTypes.INTEGER, defaultValue: 0 },
    errorMessage:   { type: DataTypes.TEXT },
    sizeBytes:      { type: DataTypes.INTEGER, defaultValue: 0 },
    trackingId:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }, // open/click token
    labels:         { type: DataTypes.JSON, defaultValue: [] },
    // Polymorphic link to any CRM record (Contact / Lead / Employee / Vendor / Project)
    relatedType:    { type: DataTypes.STRING },
    relatedId:      { type: DataTypes.UUID },
  },
  {
    sequelize, modelName: "Email", tableName: "emails",
    timestamps: true, paranoid: true,
    indexes: [
      { fields: ["companyId", "folder"] },
      { fields: ["companyId", "accountId", "folder"] },
      { fields: ["companyId", "status"] },
      { fields: ["threadId"] },
      { fields: ["scheduledAt"] },
      { fields: ["trackingId"] },
      { fields: ["relatedType", "relatedId"] },
    ],
  }
);

// ═════════════════════════════════════════════════════════════
// 4. EmailAttachment
// ═════════════════════════════════════════════════════════════
class EmailAttachment extends Model {}
EmailAttachment.init(
  {
    id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ...auditFields(),
    emailId:      { type: DataTypes.UUID, allowNull: false },
    fileName:     { type: DataTypes.STRING, allowNull: false }, // stored (sanitised) name
    originalName: { type: DataTypes.STRING },                   // name shown to the user
    mimeType:     { type: DataTypes.STRING },
    sizeBytes:    { type: DataTypes.INTEGER, defaultValue: 0 },
    storagePath:  { type: DataTypes.STRING },
    url:          { type: DataTypes.STRING },
    isInline:     { type: DataTypes.BOOLEAN, defaultValue: false },
    contentId:    { type: DataTypes.STRING }, // CID for inline images
    checksum:     { type: DataTypes.STRING },
  },
  {
    sequelize, modelName: "EmailAttachment", tableName: "email_attachments",
    timestamps: true, paranoid: true,
    indexes: [{ fields: ["companyId", "emailId"] }],
  }
);

// ═════════════════════════════════════════════════════════════
// 5. EmailTemplate
// ═════════════════════════════════════════════════════════════
class EmailTemplate extends Model {}
EmailTemplate.init(
  {
    id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ...auditFields(),
    name:         { type: DataTypes.STRING, allowNull: false },
    category:     { type: DataTypes.STRING },
    subject:      { type: DataTypes.STRING },
    bodyHtml:     { type: DataTypes.TEXT("long") },
    placeholders: { type: DataTypes.JSON, defaultValue: [] }, // ["{{firstName}}", "{{company}}"]
    isShared:     { type: DataTypes.BOOLEAN, defaultValue: true },
    ownerId:      { type: DataTypes.UUID }, // null => shared company-wide
  },
  {
    sequelize, modelName: "EmailTemplate", tableName: "email_templates",
    timestamps: true, paranoid: true,
    indexes: [{ fields: ["companyId", "category"] }],
  }
);

// ═════════════════════════════════════════════════════════════
// 6. EmailSignature
// ═════════════════════════════════════════════════════════════
class EmailSignature extends Model {}
EmailSignature.init(
  {
    id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ...auditFields(),
    userId:    { type: DataTypes.UUID, allowNull: false },
    name:      { type: DataTypes.STRING, allowNull: false },
    bodyHtml:  { type: DataTypes.TEXT },
    isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize, modelName: "EmailSignature", tableName: "email_signatures",
    timestamps: true, paranoid: true,
    indexes: [{ fields: ["companyId", "userId"] }],
  }
);

// ═════════════════════════════════════════════════════════════
// 7. EmailLabel
// ═════════════════════════════════════════════════════════════
class EmailLabel extends Model {}
EmailLabel.init(
  {
    id:    { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ...auditFields(),
    name:  { type: DataTypes.STRING, allowNull: false },
    color: { type: DataTypes.STRING, defaultValue: "#6b7280" },
  },
  {
    sequelize, modelName: "EmailLabel", tableName: "email_labels",
    timestamps: true, paranoid: true,
    indexes: [{ fields: ["companyId", "name"] }],
  }
);

// ═════════════════════════════════════════════════════════════
// 8. EmailFolder — user-defined folders (system ones are enums above)
// ═════════════════════════════════════════════════════════════
class EmailFolder extends Model {}
EmailFolder.init(
  {
    id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ...auditFields(),
    userId:     { type: DataTypes.UUID },
    name:       { type: DataTypes.STRING, allowNull: false },
    parentId:   { type: DataTypes.UUID },
    systemType: { type: DataTypes.STRING }, // null for custom folders
  },
  {
    sequelize, modelName: "EmailFolder", tableName: "email_folders",
    timestamps: true, paranoid: true,
    indexes: [{ fields: ["companyId", "userId"] }],
  }
);

// ═════════════════════════════════════════════════════════════
// 9. EmailRule — automation (if conditions -> do actions)
// ═════════════════════════════════════════════════════════════
class EmailRule extends Model {}
EmailRule.init(
  {
    id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ...auditFields(),
    userId:     { type: DataTypes.UUID },
    name:       { type: DataTypes.STRING, allowNull: false },
    isActive:   { type: DataTypes.BOOLEAN, defaultValue: true },
    matchType:  { type: DataTypes.ENUM("all", "any"), defaultValue: "all" },
    conditions: { type: DataTypes.JSON, defaultValue: [] }, // [{ field, op, value }]
    actions:    { type: DataTypes.JSON, defaultValue: [] }, // [{ type, value }]
    priority:   { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize, modelName: "EmailRule", tableName: "email_rules",
    timestamps: true, paranoid: true,
    indexes: [{ fields: ["companyId", "isActive"] }],
  }
);

// ═════════════════════════════════════════════════════════════
// 10. EmailEvent — append-only delivery/open/click log (no soft delete)
// ═════════════════════════════════════════════════════════════
class EmailEvent extends Model {}
EmailEvent.init(
  {
    id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId:  { type: DataTypes.UUID, allowNull: false },
    emailId:    { type: DataTypes.UUID, allowNull: false },
    type:       { type: DataTypes.ENUM("queued", "sent", "delivered", "opened", "clicked", "bounced", "failed", "complaint"), allowNull: false },
    meta:       { type: DataTypes.JSON, defaultValue: {} }, // { ip, userAgent, url, reason }
    occurredAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize, modelName: "EmailEvent", tableName: "email_events",
    timestamps: true, paranoid: false,
    indexes: [
      { fields: ["companyId", "emailId"] },
      { fields: ["emailId", "type"] },
    ],
  }
);

// ═════════════════════════════════════════════════════════════
// ASSOCIATIONS — kept here so the module stays self-contained.
// ═════════════════════════════════════════════════════════════
EmailAccount.belongsTo(Company, { foreignKey: "companyId" });
EmailAccount.belongsTo(User, { as: "owner", foreignKey: "userId" });

EmailAccount.hasMany(Email, { as: "emails", foreignKey: "accountId" });
Email.belongsTo(EmailAccount, { as: "account", foreignKey: "accountId" });

EmailAccount.hasMany(EmailThread, { as: "threads", foreignKey: "accountId" });
EmailThread.belongsTo(EmailAccount, { as: "account", foreignKey: "accountId" });

EmailThread.hasMany(Email, { as: "messages", foreignKey: "threadId" });
Email.belongsTo(EmailThread, { as: "thread", foreignKey: "threadId" });

Email.hasMany(EmailAttachment, { as: "attachments", foreignKey: "emailId" });
EmailAttachment.belongsTo(Email, { as: "email", foreignKey: "emailId" });

Email.hasMany(EmailEvent, { as: "events", foreignKey: "emailId" });
EmailEvent.belongsTo(Email, { as: "email", foreignKey: "emailId" });

EmailTemplate.belongsTo(Company, { foreignKey: "companyId" });
EmailSignature.belongsTo(Company, { foreignKey: "companyId" });
EmailSignature.belongsTo(User, { as: "user", foreignKey: "userId" });
EmailLabel.belongsTo(Company, { foreignKey: "companyId" });
EmailFolder.belongsTo(Company, { foreignKey: "companyId" });
EmailRule.belongsTo(Company, { foreignKey: "companyId" });

// Convenient array for models/index.js (mongoCompat + registration)
export const emailmodels = [
  EmailAccount,
  EmailThread,
  Email,
  EmailAttachment,
  EmailTemplate,
  EmailSignature,
  EmailLabel,
  EmailFolder,
  EmailRule,
  EmailEvent,
];

export {
  EmailAccount,
  EmailThread,
  Email,
  EmailAttachment,
  EmailTemplate,
  EmailSignature,
  EmailLabel,
  EmailFolder,
  EmailRule,
  EmailEvent,
};