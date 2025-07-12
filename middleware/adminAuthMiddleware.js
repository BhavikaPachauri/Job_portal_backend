const jwt = require('jsonwebtoken');

const authenticateAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, admin) => {
    if (err || !admin || !admin.admin) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.admin = admin;
    next();
  });
};

const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || !req.admin.isSuperAdmin) {
    return res.status(403).json({ message: 'Super admin privileges required' });
  }
  next();
};

module.exports = {
  authenticateAdminToken,
  requireSuperAdmin
}; 