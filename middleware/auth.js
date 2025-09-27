 // middleware/auth.js
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("🔹 Auth Header Received:", authHeader); // debug

  let user;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No Bearer token found, using prototype user");
    user = { id: "prototype-user", email: "test@example.com" };
  } else {
    const token = authHeader.split(" ")[1];
    console.log("🔹 Extracted Token:", token); // debug
    // For prototype, ignore actual JWT verification
    user = { id: "prototype-user", email: "test@example.com" };
  }

  req.user = user;
  next();
};

module.exports = { verifyToken };
