const jwt = require('jsonwebtoken');

// Middleware to check if the user is authenticated
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Assuming you're using JWT
    req.user = decoded;  // Attach user data to request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authMiddleware };
