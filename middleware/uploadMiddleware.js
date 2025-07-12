const multer = require('multer');
const path = require('path');
const fs = require('fs');

function getUploadDir({ entity, type, id }) {
  // e.g., uploads/candidates/cvs/123
  const uploadDir = path.join(__dirname, '../uploads', entity, type, String(id));
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
}

function getMulterUpload({ entity, type, id, allowedTypes = [], prefix = '' }) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = getUploadDir({ entity, type, id });
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, (prefix ? prefix + '-' : '') + uniqueSuffix + path.extname(file.originalname));
    }
  });

  return multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: function (req, file, cb) {
      if (allowedTypes.length === 0 || allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('File type not allowed'));
      }
    }
  });
}

module.exports = { getMulterUpload }; 