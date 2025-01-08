import express from "express";
const router = express.Router();

import User from "../controllers/user";

router.post("/register", User.register);

router.post("/login", User.login);

router.post("/refreshToken", User.refreshToken);

router.post("/logout", User.logout);

export = router;
