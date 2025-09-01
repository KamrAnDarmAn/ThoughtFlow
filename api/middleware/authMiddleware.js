const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
  if (!token) {
    console.error("No token provided in request");
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      console.error("Invalid token: missing user ID");
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
