/**
 * Cloudinary Upload Middleware
 * 
 * Requires these environment variables in server/.env:
 *   CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   CLOUDINARY_API_KEY=your_api_key
 *   CLOUDINARY_API_SECRET=your_api_secret
 */

let uploadAvatar, uploadCover;

try {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const multer = require('multer');

  // Configure Cloudinary from env
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'travelbuddy/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 200, height: 200, crop: 'fill' }],
    },
  });

  const coverStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'travelbuddy/covers',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 1200, height: 300, crop: 'fill' }],
    },
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  };

  uploadAvatar = multer({ 
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter
  });

  uploadCover = multer({ 
    storage: coverStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter
  });

  console.log('✅ Cloudinary upload middleware configured');
} catch (err) {
  // Cloudinary packages not installed or not configured — provide no-op middleware
  console.warn('⚠️  Cloudinary upload not available (missing packages or config):', err.message);
  
  const noopMiddleware = {
    single: () => (req, res, next) => {
      return res.status(501).json({
        error: 'File upload not configured. Set CLOUDINARY env vars and install cloudinary + multer + multer-storage-cloudinary.',
      });
    },
  };
  
  uploadAvatar = noopMiddleware;
  uploadCover = noopMiddleware;
}

module.exports = { uploadAvatar, uploadCover };
