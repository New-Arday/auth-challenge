const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const jwtSecret = "mysecret";

const register = async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = await prisma.user.create({
    data: {
      username: username,
      password: hashedPassword,
    },
  });

  res.json({ data: createdUser.username });
};

const login = async (req, res) => {
  const { username, password } = req.body;

  const foundUser = await prisma.user.findFirst({
    where: {
      username,
    },
  });
  console.log("login - foundUser:", foundUser);
  if (!foundUser) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const passwordsMatch = await bcrypt.compare(password, foundUser.password);

  if (!passwordsMatch) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const token = jwt.sign({ username }, jwtSecret);

  console.log("token:", token);
  res.json({ data: token });
};

module.exports = {
  register,
  login,
};
