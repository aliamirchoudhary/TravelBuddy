require('dotenv').config();
const { poolPromise, sql } = require('./db');

async function fixSchema() {
  try {
    const pool = await poolPromise;
    console.log('Connected to SQL Server');

    const query = `
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'AvatarURL')
      BEGIN
        ALTER TABLE Users ADD AvatarURL NVARCHAR(500) NULL;
        PRINT 'Added AvatarURL column';
      END
      ELSE PRINT 'AvatarURL column already exists';

      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'CoverPhotoURL')
      BEGIN
        ALTER TABLE Users ADD CoverPhotoURL NVARCHAR(500) NULL;
        PRINT 'Added CoverPhotoURL column';
      END
      ELSE PRINT 'CoverPhotoURL column already exists';

      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'HomeCity')
      BEGIN
        ALTER TABLE Users ADD HomeCity NVARCHAR(100) NULL;
        PRINT 'Added HomeCity column';
      END

      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Bio')
      BEGIN
        ALTER TABLE Users ADD Bio NVARCHAR(500) NULL;
        PRINT 'Added Bio column';
      END
    `;

    await pool.request().query(query);
    console.log('Schema check/update completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Schema update failed:', err.message);
    process.exit(1);
  }
}

fixSchema();
