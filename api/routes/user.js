const router = require("express").Router();
require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const user = prisma.user.findUnique({ where: { email } });
  if (user) res.status(300).json({ message: "User already exist" });

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const newUser = await prisma.user.create({
    data: {
      firstname,
      lastname,
      email,
      password: hashedPassword,
    },
  });

  res.status(201).json({ user: newUser });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) res.json({ message: "User not found" });

  const isPasswordOkay = bcrypt.compareSync(password, user.password);
  if (!isPasswordOkay) res.json({ message: "Wrong Credentials!" });

  const payload = {
    id: user.id,
    email: user.email,
  };
  const token = jwt.sign(payload, process.env.JWT_TOKEN);
  res.cookie("token", token);
  res.status(200).json({ message: "User successfully logged in." });
});

module.exports = router;
