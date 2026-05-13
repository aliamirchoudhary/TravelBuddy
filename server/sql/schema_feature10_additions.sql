-- ── Feature 10: Emergency Assistance Schema Additions ──────────────────────
-- Append these to server/schema.sql

-- Per-country embassy full details
CREATE TABLE EmbassyContacts (
  EmbassyID    INT IDENTITY(1,1) PRIMARY KEY,
  CountryCode  CHAR(2)          NOT NULL,   -- ISO 2-letter (JP, US, FR …)
  CountryName  NVARCHAR(100)    NOT NULL,   -- matches EMERGENCY_BY_COUNTRY keys
  PhoneNumber  NVARCHAR(30),
  Email        NVARCHAR(100),
  Address      NVARCHAR(300),
  Website      NVARCHAR(200),
  OpeningHours NVARCHAR(200),
  Notes        NVARCHAR(500),
  UpdatedAt    DATETIME DEFAULT GETDATE()
);

-- Optional: per-trip personal emergency contacts (stored per user/trip)
CREATE TABLE EmergencyContacts (
  ContactID    INT IDENTITY(1,1) PRIMARY KEY,
  TripID       INT           NOT NULL,
  UserID       INT           NOT NULL,
  Name         NVARCHAR(100) NOT NULL,
  Relationship NVARCHAR(50),           -- 'Parent', 'Spouse', 'Doctor', etc.
  PhoneNumber  NVARCHAR(30),
  Email        NVARCHAR(100),
  Notes        NVARCHAR(300),
  CreatedAt    DATETIME DEFAULT GETDATE(),
  CONSTRAINT FK_EC_Trip FOREIGN KEY (TripID) REFERENCES Trips(TripID),
  CONSTRAINT FK_EC_User FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- ── Seed: EmbassyContacts (US embassy phone numbers per destination country) ──
-- These are US Embassy contacts abroad — shown to US travellers.
-- Non-US deployments should replace PhoneNumber with their own country's embassy.
INSERT INTO EmbassyContacts (CountryCode, CountryName, PhoneNumber, Email, Address, Website, OpeningHours) VALUES
('JP', 'japan',         '+81-3-3224-5000',  'TokyoACS@state.gov',     '1-10-5 Akasaka, Minato, Tokyo',              'https://jp.usembassy.gov',      'Mon-Fri 08:30-17:30'),
('PK', 'pakistan',      '+92-51-201-4000',  'IslamabadACS@state.gov', 'Diplomatic Enclave, Ramna 5, Islamabad',     'https://pk.usembassy.gov',      'Mon-Thu 08:00-17:00'),
('TR', 'turkey',        '+90-312-455-5555', 'AnkaraACS@state.gov',    '110 Atatürk Blvd, Kavaklidere, Ankara',      'https://tr.usembassy.gov',      'Mon-Fri 08:00-17:00'),
('GB', 'united kingdom','+44-20-7499-9000', 'LondonACS@state.gov',    '33 Nine Elms Ln, London SW11 7US',           'https://uk.usembassy.gov',      'Mon-Fri 08:30-17:00'),
('FR', 'france',        '+33-1-4312-2222',  'ParisACS@state.gov',     '2 Ave Gabriel, 75008 Paris',                 'https://fr.usembassy.gov',      'Mon-Fri 09:00-12:00,14:00-16:00'),
('DE', 'germany',       '+49-30-8305-0',    'BerlinACS@state.gov',    'Pariser Platz 2, 10117 Berlin',              'https://de.usembassy.gov',      'Mon-Fri 08:00-17:00'),
('IT', 'italy',         '+39-06-46741',     'RomeACS@state.gov',      'Via Vittorio Veneto 121, 00187 Rome',        'https://it.usembassy.gov',      'Mon-Fri 08:30-17:30'),
('ES', 'spain',         '+34-91-587-2200',  'MadridACS@state.gov',    'Calle de Serrano 75, 28006 Madrid',          'https://es.usembassy.gov',      'Mon-Fri 09:00-13:00'),
('AE', 'uae',           '+971-2-414-2200',  'AbuDhabiACS@state.gov',  'Embassies District, Abu Dhabi',              'https://ae.usembassy.gov',      'Mon-Fri 08:00-17:00'),
('IN', 'india',         '+91-11-2419-8000', 'NewDelhiACS@state.gov',  'Shantipath, Chanakyapuri, New Delhi 110021', 'https://in.usembassy.gov',      'Mon-Fri 08:00-17:00'),
('AU', 'australia',     '+61-2-6214-5600',  'CanberraACS@state.gov',  'Moonah Place, Yarralumla, ACT 2600',         'https://au.usembassy.gov',      'Mon-Fri 08:30-17:00'),
('CA', 'canada',        '+1-613-238-5335',  'OttawaACS@state.gov',    '490 Sussex Drive, Ottawa, ON K1N 1G8',       'https://ca.usembassy.gov',      'Mon-Fri 08:30-17:00'),
('CN', 'china',         '+86-10-8531-3000', 'BeijingACS@state.gov',   '55 Anjialou Rd, Chaoyang, Beijing',          'https://china.usembassy-china.org.cn', 'Mon-Fri 08:00-17:00'),
('TH', 'thailand',      '+66-2-205-4049',   'BangkokACS@state.gov',   '95 Wireless Rd, Lumpini, Bangkok 10330',    'https://th.usembassy.gov',      'Mon-Fri 07:30-16:00'),
('SG', 'singapore',     '+65-6476-9100',    'SingaporeACS@state.gov', '27 Napier Road, Singapore 258508',           'https://sg.usembassy.gov',      'Mon-Fri 08:00-17:00'),
('SA', 'saudi arabia',  '+966-11-488-3800', 'RiyadhACS@state.gov',    'Collector Road M, Riyadh Diplomatic Qtr',   'https://sa.usembassy.gov',      'Sun-Thu 08:00-16:30'),
('MY', 'malaysia',      '+60-3-2168-5000',  'KualaLumpurACS@state.gov','376 Jalan Tun Razak, 50400 KL',            'https://my.usembassy.gov',      'Mon-Fri 07:30-16:00');
