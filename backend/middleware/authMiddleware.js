const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  let token = req.cookies.token; 

  if (!token) {
    token = req.header("Authorization")?.split(" ")[1]; // ✅ Then, check in Authorization header
}
  console.log(token); // Read token from cookies

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
