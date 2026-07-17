import express from "express";
import { User, Company } from "../models/index.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    console.log("========== USERS ==========");
    console.log("Company:", req.companyId);

    const users = await User.findAll({
      include: [
        {
          model: Company,
          as: "companies",
          where: {
            id: req.companyId,
          },
          through: {
            attributes: [],
          },
          attributes: [],
        },
      ],
      attributes: ["id", "name", "email", "role"],
    });

    console.log("Users found:", users.length);
    console.log(users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email
    })));

    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});


export default router;