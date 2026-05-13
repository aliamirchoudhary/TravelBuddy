/**
 * Create missing database tables:
 *   - LanguagePhrases (for /api/utilities/phrases)
 *   - Conversations, ConversationParticipants, Messages (for messaging)
 */
require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: { encrypt: true, trustServerCertificate: true },
  connectionTimeout: 60000,
  requestTimeout: 60000,
};

const TABLES = [
  {
    name: 'LanguagePhrases',
    ddl: `
      CREATE TABLE dbo.LanguagePhrases (
        PhraseID     INT IDENTITY(1,1) PRIMARY KEY,
        Language     NVARCHAR(50)  NOT NULL,
        Category     NVARCHAR(100) NOT NULL,
        English      NVARCHAR(500) NOT NULL,
        Translation  NVARCHAR(500) NOT NULL,
        SortOrder    INT           DEFAULT 0
      );
    `,
    seed: `
      INSERT INTO dbo.LanguagePhrases (Language, Category, English, Translation, SortOrder) VALUES
      -- Japanese
      ('Japanese', 'Greetings', 'Hello', 'こんにちは (Konnichiwa)', 1),
      ('Japanese', 'Greetings', 'Good morning', 'おはようございます (Ohayou gozaimasu)', 2),
      ('Japanese', 'Greetings', 'Good evening', 'こんばんは (Konbanwa)', 3),
      ('Japanese', 'Greetings', 'Goodbye', 'さようなら (Sayounara)', 4),
      ('Japanese', 'Greetings', 'Thank you', 'ありがとうございます (Arigatou gozaimasu)', 5),
      ('Japanese', 'Essentials', 'Yes', 'はい (Hai)', 1),
      ('Japanese', 'Essentials', 'No', 'いいえ (Iie)', 2),
      ('Japanese', 'Essentials', 'Please', 'お願いします (Onegaishimasu)', 3),
      ('Japanese', 'Essentials', 'Excuse me', 'すみません (Sumimasen)', 4),
      ('Japanese', 'Essentials', 'I''m sorry', 'ごめんなさい (Gomen nasai)', 5),
      ('Japanese', 'Transport', 'Where is the station?', '駅はどこですか？ (Eki wa doko desu ka?)', 1),
      ('Japanese', 'Transport', 'How much is a ticket?', '切符はいくらですか？ (Kippu wa ikura desu ka?)', 2),
      ('Japanese', 'Food', 'Menu please', 'メニューをください (Menyuu o kudasai)', 1),
      ('Japanese', 'Food', 'Water please', '水をください (Mizu o kudasai)', 2),
      ('Japanese', 'Food', 'The bill please', 'お会計お願いします (Okaikei onegaishimasu)', 3),
      ('Japanese', 'Emergency', 'Help!', '助けて！ (Tasukete!)', 1),
      ('Japanese', 'Emergency', 'I need a doctor', '医者が必要です (Isha ga hitsuyou desu)', 2),
      ('Japanese', 'Emergency', 'Where is the hospital?', '病院はどこですか？ (Byouin wa doko desu ka?)', 3),
      -- Spanish
      ('Spanish', 'Greetings', 'Hello', 'Hola', 1),
      ('Spanish', 'Greetings', 'Good morning', 'Buenos días', 2),
      ('Spanish', 'Greetings', 'Good evening', 'Buenas noches', 3),
      ('Spanish', 'Greetings', 'Goodbye', 'Adiós', 4),
      ('Spanish', 'Greetings', 'Thank you', 'Gracias', 5),
      ('Spanish', 'Essentials', 'Yes', 'Sí', 1),
      ('Spanish', 'Essentials', 'No', 'No', 2),
      ('Spanish', 'Essentials', 'Please', 'Por favor', 3),
      ('Spanish', 'Essentials', 'Excuse me', 'Disculpe', 4),
      ('Spanish', 'Essentials', 'I''m sorry', 'Lo siento', 5),
      ('Spanish', 'Transport', 'Where is the station?', '¿Dónde está la estación?', 1),
      ('Spanish', 'Transport', 'How much is a ticket?', '¿Cuánto cuesta un boleto?', 2),
      ('Spanish', 'Food', 'Menu please', 'El menú por favor', 1),
      ('Spanish', 'Food', 'Water please', 'Agua por favor', 2),
      ('Spanish', 'Food', 'The bill please', 'La cuenta por favor', 3),
      ('Spanish', 'Emergency', 'Help!', '¡Ayuda!', 1),
      ('Spanish', 'Emergency', 'I need a doctor', 'Necesito un médico', 2),
      ('Spanish', 'Emergency', 'Where is the hospital?', '¿Dónde está el hospital?', 3),
      -- French
      ('French', 'Greetings', 'Hello', 'Bonjour', 1),
      ('French', 'Greetings', 'Good evening', 'Bonsoir', 2),
      ('French', 'Greetings', 'Goodbye', 'Au revoir', 3),
      ('French', 'Greetings', 'Thank you', 'Merci', 4),
      ('French', 'Essentials', 'Yes', 'Oui', 1),
      ('French', 'Essentials', 'No', 'Non', 2),
      ('French', 'Essentials', 'Please', 'S''il vous plaît', 3),
      ('French', 'Essentials', 'Excuse me', 'Excusez-moi', 4),
      ('French', 'Food', 'Menu please', 'Le menu s''il vous plaît', 1),
      ('French', 'Food', 'Water please', 'De l''eau s''il vous plaît', 2),
      ('French', 'Food', 'The bill please', 'L''addition s''il vous plaît', 3),
      ('French', 'Emergency', 'Help!', 'Au secours !', 1),
      ('French', 'Emergency', 'I need a doctor', 'J''ai besoin d''un médecin', 2),
      -- Turkish
      ('Turkish', 'Greetings', 'Hello', 'Merhaba', 1),
      ('Turkish', 'Greetings', 'Good morning', 'Günaydın', 2),
      ('Turkish', 'Greetings', 'Goodbye', 'Hoşça kal', 3),
      ('Turkish', 'Greetings', 'Thank you', 'Teşekkür ederim', 4),
      ('Turkish', 'Essentials', 'Yes', 'Evet', 1),
      ('Turkish', 'Essentials', 'No', 'Hayır', 2),
      ('Turkish', 'Essentials', 'Please', 'Lütfen', 3),
      ('Turkish', 'Food', 'Menu please', 'Menüyü lütfen', 1),
      ('Turkish', 'Food', 'Water please', 'Su lütfen', 2),
      ('Turkish', 'Food', 'The bill please', 'Hesap lütfen', 3),
      ('Turkish', 'Emergency', 'Help!', 'İmdat!', 1),
      ('Turkish', 'Emergency', 'I need a doctor', 'Bir doktora ihtiyacım var', 2),
      -- Urdu
      ('Urdu', 'Greetings', 'Hello', 'السلام علیکم (Assalam o Alaikum)', 1),
      ('Urdu', 'Greetings', 'Thank you', 'شکریہ (Shukriya)', 2),
      ('Urdu', 'Greetings', 'Goodbye', 'اللہ حافظ (Allah Hafiz)', 3),
      ('Urdu', 'Essentials', 'Yes', 'ہاں (Haan)', 1),
      ('Urdu', 'Essentials', 'No', 'نہیں (Nahi)', 2),
      ('Urdu', 'Essentials', 'Please', 'براہ کرم (Barah-e-karam)', 3),
      ('Urdu', 'Food', 'Menu please', 'مینو دکھائیں (Menu dikhayein)', 1),
      ('Urdu', 'Food', 'Water please', 'پانی چاہیے (Pani chahiye)', 2),
      ('Urdu', 'Food', 'The bill please', 'بل دیں (Bill dein)', 3),
      ('Urdu', 'Emergency', 'Help!', 'مدد! (Madad!)', 1),
      ('Urdu', 'Emergency', 'I need a doctor', 'مجھے ڈاکٹر چاہیے (Mujhe doctor chahiye)', 2),
      -- Arabic
      ('Arabic', 'Greetings', 'Hello', 'مرحبا (Marhaba)', 1),
      ('Arabic', 'Greetings', 'Thank you', 'شكرا (Shukran)', 2),
      ('Arabic', 'Greetings', 'Goodbye', 'مع السلامة (Ma''a salama)', 3),
      ('Arabic', 'Essentials', 'Yes', 'نعم (Na''am)', 1),
      ('Arabic', 'Essentials', 'No', 'لا (La)', 2),
      ('Arabic', 'Essentials', 'Please', 'من فضلك (Min fadlak)', 3),
      ('Arabic', 'Food', 'Water please', 'ماء من فضلك (Ma min fadlak)', 1),
      ('Arabic', 'Emergency', 'Help!', 'النجدة! (Al-najda!)', 1);
    `,
  },
  {
    name: 'Conversations',
    ddl: `
      CREATE TABLE dbo.Conversations (
        ConvID     INT IDENTITY(1,1) PRIMARY KEY,
        Type       NVARCHAR(20) NOT NULL DEFAULT 'direct',  -- 'direct' or 'group'
        TripID     INT NULL REFERENCES dbo.Trips(TripID),
        CreatedAt  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
      );
    `,
  },
  {
    name: 'ConversationParticipants',
    ddl: `
      CREATE TABLE dbo.ConversationParticipants (
        ConvID     INT NOT NULL REFERENCES dbo.Conversations(ConvID),
        UserID     INT NOT NULL REFERENCES dbo.Users(UserID),
        LastReadAt DATETIME2 NULL,
        PRIMARY KEY (ConvID, UserID)
      );
    `,
  },
  {
    name: 'Messages',
    ddl: `
      CREATE TABLE dbo.Messages (
        MessageID    INT IDENTITY(1,1) PRIMARY KEY,
        ConvID       INT NOT NULL REFERENCES dbo.Conversations(ConvID),
        SenderID     INT NOT NULL REFERENCES dbo.Users(UserID),
        MessageText  NVARCHAR(MAX) NOT NULL DEFAULT '',
        MediaURL     NVARCHAR(500) NULL,
        MessageType  NVARCHAR(20) NOT NULL DEFAULT 'text',
        SentAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        IsDeleted    BIT NOT NULL DEFAULT 0
      );

      CREATE INDEX IX_Messages_ConvID_SentAt ON dbo.Messages(ConvID, SentAt);
    `,
  },
];

async function run() {
  const pool = await sql.connect(config);

  for (const table of TABLES) {
    // Check if table exists
    const check = await pool.request()
      .input('name', sql.NVarChar, table.name)
      .query(`SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @name`);

    if (check.recordset.length > 0) {
      console.log(`⏭️  Table ${table.name} already exists — skipping.`);
      continue;
    }

    console.log(`🔨 Creating table: ${table.name}...`);
    await pool.request().query(table.ddl);
    console.log(`✅ Created: ${table.name}`);

    if (table.seed) {
      console.log(`🌱 Seeding ${table.name}...`);
      await pool.request().query(table.seed);
      console.log(`✅ Seeded: ${table.name}`);
    }
  }

  console.log('\n🎉 All missing tables created successfully!');
  await pool.close();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
