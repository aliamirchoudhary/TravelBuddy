require('dotenv').config();
const { poolPromise, sql } = require('./db');

async function updateSchema() {
    try {
        const pool = await poolPromise;
        console.log('Adding TrustScore and ReviewCount to Cities table...');
        
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Cities') AND name = 'TrustScore')
            BEGIN
                ALTER TABLE Cities ADD TrustScore DECIMAL(4,2) DEFAULT 0;
            END

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Cities') AND name = 'ReviewCount')
            BEGIN
                ALTER TABLE Cities ADD ReviewCount INT DEFAULT 0;
            END
        `);
        
        console.log('Schema updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();
