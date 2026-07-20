import express from "express";

import { logEvent } from "../utils/audit.js";

import {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  setDefaultAccount,
  testAccount,
  sanitizeAccount,
  accountScope,
} from "../services/emailAccount.service.js";

import {
  Email,
  EmailAccount,
} from "../models/Emailmodels.js";

import {
  syncAccessibleAccount,
  syncUserMailboxes,
} from "../services/emailSync.service.js";

const router = express.Router();

const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};

const parsePagination = (query) => {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);

  const page =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const limit = Math.min(
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : 50,
    100
  );

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

const buildAccountWhere = (req) => {
  const where = {
    ...accountScope(req),
  };

  if (req.query.accountId) {
    where.id = req.query.accountId;
  }

  return where;
};

const buildEmailWhere = (req, folder) => {
  const where = {
    folder,
  };

  if (req.companyId) {
    where.companyId = req.companyId;
  }

  return where;
};

const accountInclude = (req) => ({
  model: EmailAccount,
  as: "account",
  required: true,
  where: buildAccountWhere(req),
  attributes: [
    "id",
    "displayName",
    "email",
    "provider",
    "status",
  ],
});

const listMailbox = async (req, res, folder) => {
  const {
    page,
    limit,
    offset,
  } = parsePagination(req.query);

  const {
    rows: emails,
    count: total,
  } = await Email.findAndCountAll({
    where: buildEmailWhere(req, folder),

    include: [
      accountInclude(req),
    ],

    order: [
      ["createdAt", "DESC"],
    ],

    limit,
    offset,
    distinct: true,
  });

  const totalPages =
    total === 0
      ? 0
      : Math.ceil(total / limit);

  return res.json({
    success: true,

    emails,

    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage:
        page < totalPages,
      hasPreviousPage:
        page > 1,
    },
  });
};

const getAccessibleEmail = async (
  req,
  emailId
) => {
  return Email.findOne({
    where: {
      id: emailId,

      ...(req.companyId
        ? {
            companyId:
              req.companyId,
          }
        : {}),
    },

    include: [
      {
        ...accountInclude(req),
      },
    ],
  });
};

// ============================================================
// EMAIL ACCOUNTS
// ============================================================

router.get(
  "/accounts",

  handle(async (req, res) => {
    const accounts =
      await listAccounts(req);

    return res.json({
      success: true,
      accounts,
      total: accounts.length,
    });
  })
);

router.post(
  "/accounts",

  handle(async (req, res) => {
    const account =
      await createAccount(
        req,
        req.body
      );

    await logEvent({
      companyId:
        req.companyId,

      userId:
        req.user.id,

      action:
        "email_account_connected",

      resourceId:
        account.id,

      changes: {
        provider:
          account.provider,

        email:
          account.email,
      },
    });

    return res
      .status(201)
      .json({
        success: true,
        account,
      });
  })
);

router.get(
  "/accounts/:id",

  handle(async (req, res) => {
    const account =
      await getAccount(
        req,
        req.params.id
      );

    if (!account) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Email account not found",
        });
    }

    return res.json({
      success: true,

      account:
        sanitizeAccount(
          account
        ),
    });
  })
);

router.patch(
  "/accounts/:id",

  handle(async (req, res) => {
    const account =
      await updateAccount(
        req,
        req.params.id,
        req.body
      );

    await logEvent({
      companyId:
        req.companyId,

      userId:
        req.user.id,

      action:
        "email_account_updated",

      resourceId:
        req.params.id,

      changes: {},
    });

    return res.json({
      success: true,
      account,
    });
  })
);

router.delete(
  "/accounts/:id",

  handle(async (req, res) => {
    const result =
      await deleteAccount(
        req,
        req.params.id
      );

    await logEvent({
      companyId:
        req.companyId,

      userId:
        req.user.id,

      action:
        "email_account_disconnected",

      resourceId:
        req.params.id,

      changes: {},
    });

    return res.json({
      success: true,
      ...result,
    });
  })
);

router.patch(
  "/accounts/:id/set-default",

  handle(async (req, res) => {
    const account =
      await setDefaultAccount(
        req,
        req.params.id
      );

    await logEvent({
      companyId:
        req.companyId,

      userId:
        req.user.id,

      action:
        "email_default_account_changed",

      resourceId:
        req.params.id,

      changes: {},
    });

    return res.json({
      success: true,
      account,
    });
  })
);

router.post(
  "/accounts/:id/test",

  handle(async (req, res) => {
    const result =
      await testAccount(
        req,
        req.params.id
      );

    if (!result.ok) {
      return res
        .status(400)
        .json({
          success: false,
          ok: false,

          message:
            result.error ||
            "Email account connection failed",
        });
    }

    return res.json({
      success: true,
      ok: true,

      message:
        "Connection successful",
    });
  })
);

// ============================================================
// SYNCHRONIZATION
// ============================================================

router.post(
  "/accounts/:id/sync",

  handle(async (req, res) => {
    const result =
      await syncAccessibleAccount(
        req,
        req.params.id,
        {
          limit:
            req.body?.limit,
        }
      );

    return res.json({
      success: true,

      message:
        "Mailbox synchronization completed.",

      result,
    });
  })
);

router.post(
  "/sync",

  handle(async (req, res) => {
    const results =
      await syncUserMailboxes(
        req,
        {
          limit:
            req.body?.limit,
        }
      );

    const successful =
      results.filter(
        (item) =>
          item.success
      ).length;

    const failed =
      results.length -
      successful;

    return res.json({
      success:
        failed === 0,

      message:
        failed === 0
          ? "Mailbox synchronization completed."
          : "Mailbox synchronization completed with errors.",

      summary: {
        totalAccounts:
          results.length,

        successful,
        failed,
      },

      results,
    });
  })
);

// ============================================================
// MAILBOX LIST ROUTES
// ============================================================

router.get(
  "/inbox",

  handle(async (req, res) =>
    listMailbox(
      req,
      res,
      "inbox"
    )
  )
);

router.get(
  "/sent",

  handle(async (req, res) =>
    listMailbox(
      req,
      res,
      "sent"
    )
  )
);

router.get(
  "/drafts",

  handle(async (req, res) =>
    listMailbox(
      req,
      res,
      "draft"
    )
  )
);

router.get(
  "/trash",

  handle(async (req, res) =>
    listMailbox(
      req,
      res,
      "trash"
    )
  )
);

router.get(
  "/spam",

  handle(async (req, res) =>
    listMailbox(
      req,
      res,
      "spam"
    )
  )
);

router.get(
  "/archive",

  handle(async (req, res) =>
    listMailbox(
      req,
      res,
      "archive"
    )
  )
);

// ============================================================
// STARRED
// ============================================================

router.get(
  "/starred",

  handle(async (req, res) => {
    const {
      page,
      limit,
      offset,
    } = parsePagination(
      req.query
    );

    const where = {
      starred: true,

      ...(req.companyId
        ? {
            companyId:
              req.companyId,
          }
        : {}),
    };

    const {
      rows: emails,
      count: total,
    } =
      await Email.findAndCountAll(
        {
          where,

          include: [
            accountInclude(req),
          ],

          order: [
            [
              "createdAt",
              "DESC",
            ],
          ],

          limit,
          offset,
          distinct: true,
        }
      );

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(
            total / limit
          );

    return res.json({
      success: true,

      emails,

      pagination: {
        page,
        limit,
        total,
        totalPages,

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1,
      },
    });
  })
);

// ============================================================
// SINGLE EMAIL
// ============================================================

router.get(
  "/:id",

  handle(async (req, res) => {
    const email =
      await getAccessibleEmail(
        req,
        req.params.id
      );

    if (!email) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Email not found",
        });
    }

    return res.json({
      success: true,
      email,
    });
  })
);

// ============================================================
// MARK READ
// ============================================================

router.patch(
  "/:id/read",

  handle(async (req, res) => {
    const email =
      await getAccessibleEmail(
        req,
        req.params.id
      );

    if (!email) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Email not found",
        });
    }

    await email.update({
      read: true,
    });

    return res.json({
      success: true,
      email,
    });
  })
);

// ============================================================
// TOGGLE STAR
// ============================================================

router.patch(
  "/:id/star",

  handle(async (req, res) => {
    const email =
      await getAccessibleEmail(
        req,
        req.params.id
      );

    if (!email) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Email not found",
        });
    }

    await email.update({
      starred:
        !email.starred,
    });

    return res.json({
      success: true,
      email,
    });
  })
);

// ============================================================
// DELETE / MOVE TO TRASH
// ============================================================

router.delete(
  "/:id",

  handle(async (req, res) => {
    const email =
      await getAccessibleEmail(
        req,
        req.params.id
      );

    if (!email) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Email not found",
        });
    }

    /*
     * Mail UI normally treats Delete
     * as "move to trash", not an
     * immediate destructive database
     * delete.
     */
    await email.update({
      folder: "trash",
    });

    await logEvent({
      companyId:
        req.companyId,

      userId:
        req.user.id,

      action:
        "email_moved_to_trash",

      resourceId:
        email.id,

      changes: {},
    });

    return res.json({
      success: true,

      message:
        "Email moved to trash.",
    });
  })
);

export default router;