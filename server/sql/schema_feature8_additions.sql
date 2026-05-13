-- ── Feature 8: LanguagePhrases Schema & Seed ────────────────────────────────
-- Append to server/schema.sql

CREATE TABLE LanguagePhrases (
  PhraseID     INT IDENTITY(1,1) PRIMARY KEY,
  Language     NVARCHAR(50)  NOT NULL,   -- 'Japanese','Turkish','Arabic', etc.
  Category     NVARCHAR(50)  NOT NULL,   -- 'Greetings','Directions','Food','Numbers','Emergencies'
  English      NVARCHAR(200) NOT NULL,
  Translation  NVARCHAR(300) NOT NULL,
  SortOrder    INT DEFAULT 0
);

CREATE INDEX IX_LP_Lang_Cat ON LanguagePhrases (Language, Category);

-- ── GET endpoint (add to server/routes/utilities.js or expenses.js) ──────────
-- GET /api/phrases?language=Japanese
-- SELECT * FROM LanguagePhrases WHERE Language=@lang ORDER BY Category, SortOrder

-- ── Seed data ────────────────────────────────────────────────────────────────

-- Japanese
INSERT INTO LanguagePhrases (Language,Category,English,Translation,SortOrder) VALUES
('Japanese','Greetings',  'Hello',          'Konnichiwa (こんにちは)',                    1),
('Japanese','Greetings',  'Goodbye',        'Sayonara (さようなら)',                      2),
('Japanese','Greetings',  'Good morning',   'Ohayou gozaimasu (おはようございます)',      3),
('Japanese','Greetings',  'Please',         'Onegaishimasu (お願いします)',               4),
('Japanese','Directions', 'Where is …?',    'Doko desu ka? (どこですか？)',               1),
('Japanese','Directions', 'Left',           'Hidari (左)',                                2),
('Japanese','Directions', 'Right',          'Migi (右)',                                  3),
('Japanese','Directions', 'Station',        'Eki (駅)',                                   4),
('Japanese','Food',       'How much?',      'Ikura desu ka? (いくらですか？)',            1),
('Japanese','Food',       'The bill please','Okaikei onegaishimasu (お会計お願いします)', 2),
('Japanese','Food',       'No meat',        'Niku nashi de (肉なしで)',                   3),
('Japanese','Food',       'Delicious',      'Oishii (おいしい)',                          4),
('Japanese','Numbers',    'One',            'Ichi (一)',                                  1),
('Japanese','Numbers',    'Two',            'Ni (二)',                                    2),
('Japanese','Numbers',    'Five',           'Go (五)',                                    3),
('Japanese','Numbers',    'Ten',            'Juu (十)',                                   4),
('Japanese','Emergencies','Help!',          'Tasukete! (助けて！)',                       1),
('Japanese','Emergencies','I need a doctor','Isha ga hitsuyou desu (医者が必要です)',     2),
('Japanese','Emergencies','Police',         'Keisatsu (警察)',                            3),
('Japanese','Emergencies','Hospital',       'Byouin (病院)',                              4);

-- Turkish
INSERT INTO LanguagePhrases (Language,Category,English,Translation,SortOrder) VALUES
('Turkish','Greetings',  'Hello',          'Merhaba',                        1),
('Turkish','Greetings',  'Goodbye',        'Hoşçakalın',                     2),
('Turkish','Greetings',  'Good morning',   'Günaydın',                       3),
('Turkish','Greetings',  'Please',         'Lütfen',                         4),
('Turkish','Directions', 'Where is …?',    'Nerede?',                        1),
('Turkish','Directions', 'Left',           'Sol',                            2),
('Turkish','Directions', 'Right',          'Sağ',                            3),
('Turkish','Directions', 'Station',        'İstasyon',                       4),
('Turkish','Food',       'How much?',      'Bu ne kadar?',                   1),
('Turkish','Food',       'The bill please','Hesabı alabilir miyim?',         2),
('Turkish','Food',       'No meat',        'Etsiz lütfen',                   3),
('Turkish','Food',       'Delicious',      'Nefis',                          4),
('Turkish','Numbers',    'One',            'Bir',                            1),
('Turkish','Numbers',    'Two',            'İki',                            2),
('Turkish','Numbers',    'Five',           'Beş',                            3),
('Turkish','Numbers',    'Ten',            'On',                             4),
('Turkish','Emergencies','Help!',          'İmdat!',                         1),
('Turkish','Emergencies','I need a doctor','Doktora ihtiyacım var',          2),
('Turkish','Emergencies','Police',         'Polis',                          3),
('Turkish','Emergencies','Hospital',       'Hastane',                        4);

-- Arabic
INSERT INTO LanguagePhrases (Language,Category,English,Translation,SortOrder) VALUES
('Arabic','Greetings',  'Hello',          'Marhaban (مرحبا)',                           1),
('Arabic','Greetings',  'Goodbye',        'Ma''a as-salama (مع السلامة)',               2),
('Arabic','Greetings',  'Good morning',   'Sabah al-khayr (صباح الخير)',               3),
('Arabic','Greetings',  'Please',         'Min fadlak (من فضلك)',                       4),
('Arabic','Directions', 'Where is …?',    'Ayna? (أين؟)',                               1),
('Arabic','Directions', 'Left',           'Yasaar (يسار)',                              2),
('Arabic','Directions', 'Right',          'Yameen (يمين)',                              3),
('Arabic','Directions', 'Station',        'Mahata (محطة)',                              4),
('Arabic','Food',       'How much?',      'Bikam? (بكم؟)',                              1),
('Arabic','Food',       'The bill please','Al-hisab min fadlak (الحساب من فضلك)',      2),
('Arabic','Food',       'No meat',        'Biddoon lahm (بدون لحم)',                    3),
('Arabic','Food',       'Delicious',      'Ladheedh (لذيذ)',                            4),
('Arabic','Numbers',    'One',            'Wahid (واحد)',                               1),
('Arabic','Numbers',    'Two',            'Ithnayn (اثنان)',                            2),
('Arabic','Numbers',    'Five',           'Khamsa (خمسة)',                              3),
('Arabic','Numbers',    'Ten',            'Ashara (عشرة)',                              4),
('Arabic','Emergencies','Help!',          'Najda! (نجدة!)',                             1),
('Arabic','Emergencies','I need a doctor','Ahtaj tabib (أحتاج طبيب)',                  2),
('Arabic','Emergencies','Police',         'Shurta (شرطة)',                              3),
('Arabic','Emergencies','Hospital',       'Mustashfa (مستشفى)',                         4);

-- French
INSERT INTO LanguagePhrases (Language,Category,English,Translation,SortOrder) VALUES
('French','Greetings',  'Hello',          'Bonjour',                         1),
('French','Greetings',  'Goodbye',        'Au revoir',                       2),
('French','Greetings',  'Good morning',   'Bonjour',                         3),
('French','Greetings',  'Please',         'S''il vous plaît',                4),
('French','Directions', 'Where is …?',    'Où est …?',                       1),
('French','Directions', 'Left',           'À gauche',                        2),
('French','Directions', 'Right',          'À droite',                        3),
('French','Directions', 'Station',        'La gare',                         4),
('French','Food',       'How much?',      'Combien ça coûte?',               1),
('French','Food',       'The bill please','L''addition s''il vous plaît',    2),
('French','Food',       'No meat',        'Sans viande',                     3),
('French','Food',       'Delicious',      'Délicieux',                       4),
('French','Numbers',    'One',            'Un',                              1),
('French','Numbers',    'Two',            'Deux',                            2),
('French','Numbers',    'Five',           'Cinq',                            3),
('French','Numbers',    'Ten',            'Dix',                             4),
('French','Emergencies','Help!',          'Au secours!',                     1),
('French','Emergencies','I need a doctor','J''ai besoin d''un médecin',      2),
('French','Emergencies','Police',         'Police',                          3),
('French','Emergencies','Hospital',       'Hôpital',                         4);

-- Spanish
INSERT INTO LanguagePhrases (Language,Category,English,Translation,SortOrder) VALUES
('Spanish','Greetings',  'Hello',          'Hola',                           1),
('Spanish','Greetings',  'Goodbye',        'Adiós',                          2),
('Spanish','Greetings',  'Good morning',   'Buenos días',                    3),
('Spanish','Greetings',  'Please',         'Por favor',                      4),
('Spanish','Directions', 'Where is …?',    '¿Dónde está …?',                 1),
('Spanish','Directions', 'Left',           'Izquierda',                      2),
('Spanish','Directions', 'Right',          'Derecha',                        3),
('Spanish','Directions', 'Station',        'La estación',                    4),
('Spanish','Food',       'How much?',      '¿Cuánto cuesta?',                1),
('Spanish','Food',       'The bill please','La cuenta por favor',            2),
('Spanish','Food',       'No meat',        'Sin carne',                      3),
('Spanish','Food',       'Delicious',      'Delicioso',                      4),
('Spanish','Numbers',    'One',            'Uno',                            1),
('Spanish','Numbers',    'Two',            'Dos',                            2),
('Spanish','Numbers',    'Five',           'Cinco',                          3),
('Spanish','Numbers',    'Ten',            'Diez',                           4),
('Spanish','Emergencies','Help!',          '¡Ayuda!',                        1),
('Spanish','Emergencies','I need a doctor','Necesito un médico',             2),
('Spanish','Emergencies','Police',         'Policía',                        3),
('Spanish','Emergencies','Hospital',       'Hospital',                       4);

-- German
INSERT INTO LanguagePhrases (Language,Category,English,Translation,SortOrder) VALUES
('German','Greetings',  'Hello',          'Hallo',                           1),
('German','Greetings',  'Goodbye',        'Auf Wiedersehen',                 2),
('German','Greetings',  'Good morning',   'Guten Morgen',                    3),
('German','Greetings',  'Please',         'Bitte',                           4),
('German','Directions', 'Where is …?',    'Wo ist …?',                       1),
('German','Directions', 'Left',           'Links',                           2),
('German','Directions', 'Right',          'Rechts',                          3),
('German','Directions', 'Station',        'Bahnhof',                         4),
('German','Food',       'How much?',      'Was kostet das?',                 1),
('German','Food',       'The bill please','Die Rechnung bitte',              2),
('German','Food',       'No meat',        'Ohne Fleisch',                    3),
('German','Food',       'Delicious',      'Köstlich',                        4),
('German','Numbers',    'One',            'Eins',                            1),
('German','Numbers',    'Two',            'Zwei',                            2),
('German','Numbers',    'Five',           'Fünf',                            3),
('German','Numbers',    'Ten',            'Zehn',                            4),
('German','Emergencies','Help!',          'Hilfe!',                          1),
('German','Emergencies','I need a doctor','Ich brauche einen Arzt',          2),
('German','Emergencies','Police',         'Polizei',                         3),
('German','Emergencies','Hospital',       'Krankenhaus',                     4);

-- Italian
INSERT INTO LanguagePhrases (Language,Category,English,Translation,SortOrder) VALUES
('Italian','Greetings',  'Hello',          'Ciao / Buongiorno',              1),
('Italian','Greetings',  'Goodbye',        'Arrivederci',                    2),
('Italian','Greetings',  'Good morning',   'Buongiorno',                     3),
('Italian','Greetings',  'Please',         'Per favore',                     4),
('Italian','Directions', 'Where is …?',    'Dov''è …?',                      1),
('Italian','Directions', 'Left',           'Sinistra',                       2),
('Italian','Directions', 'Right',          'Destra',                         3),
('Italian','Directions', 'Station',        'La stazione',                    4),
('Italian','Food',       'How much?',      'Quanto costa?',                  1),
('Italian','Food',       'The bill please','Il conto per favore',            2),
('Italian','Food',       'No meat',        'Senza carne',                    3),
('Italian','Food',       'Delicious',      'Delizioso',                      4),
('Italian','Numbers',    'One',            'Uno',                            1),
('Italian','Numbers',    'Two',            'Due',                            2),
('Italian','Numbers',    'Five',           'Cinque',                         3),
('Italian','Numbers',    'Ten',            'Dieci',                          4),
('Italian','Emergencies','Help!',          'Aiuto!',                         1),
('Italian','Emergencies','I need a doctor','Ho bisogno di un medico',        2),
('Italian','Emergencies','Police',         'Polizia',                        3),
('Italian','Emergencies','Hospital',       'Ospedale',                       4);

-- Mandarin
INSERT INTO LanguagePhrases (Language,Category,English,Translation,SortOrder) VALUES
('Mandarin','Greetings',  'Hello',          'Nǐ hǎo (你好)',                  1),
('Mandarin','Greetings',  'Goodbye',        'Zàijiàn (再见)',                  2),
('Mandarin','Greetings',  'Good morning',   'Zǎo shàng hǎo (早上好)',         3),
('Mandarin','Greetings',  'Please',         'Qǐng (请)',                       4),
('Mandarin','Directions', 'Where is …?',    '…zài nǎlǐ? (在哪里？)',           1),
('Mandarin','Directions', 'Left',           'Zuǒ (左)',                        2),
('Mandarin','Directions', 'Right',          'Yòu (右)',                        3),
('Mandarin','Directions', 'Station',        'Zhàn (站)',                       4),
('Mandarin','Food',       'How much?',      'Duōshǎo qián? (多少钱？)',        1),
('Mandarin','Food',       'The bill please','Mǎidān (买单)',                   2),
('Mandarin','Food',       'No meat',        'Bù yào ròu (不要肉)',             3),
('Mandarin','Food',       'Delicious',      'Hǎochī (好吃)',                   4),
('Mandarin','Numbers',    'One',            'Yī (一)',                         1),
('Mandarin','Numbers',    'Two',            'Èr (二)',                         2),
('Mandarin','Numbers',    'Five',           'Wǔ (五)',                         3),
('Mandarin','Numbers',    'Ten',            'Shí (十)',                        4),
('Mandarin','Emergencies','Help!',          'Jiùmìng! (救命！)',               1),
('Mandarin','Emergencies','I need a doctor','Wǒ xūyào yīshēng (我需要医生)', 2),
('Mandarin','Emergencies','Police',         'Jǐngchá (警察)',                  3),
('Mandarin','Emergencies','Hospital',       'Yīyuàn (医院)',                   4);

-- Thai
INSERT INTO LanguagePhrases (Language,Category,English,Translation,SortOrder) VALUES
('Thai','Greetings',  'Hello',          'Sawasdee (สวัสดี)',                       1),
('Thai','Greetings',  'Goodbye',        'La gorn (ลาก่อน)',                        2),
('Thai','Greetings',  'Good morning',   'Sawasdee ton chao (สวัสดีตอนเช้า)',      3),
('Thai','Greetings',  'Please',         'Karuna (กรุณา)',                          4),
('Thai','Directions', 'Where is …?',    '…yuu thi nai? (อยู่ที่ไหน?)',            1),
('Thai','Directions', 'Left',           'Sai (ซ้าย)',                              2),
('Thai','Directions', 'Right',          'Khwa (ขวา)',                              3),
('Thai','Directions', 'Station',        'Sathanii (สถานี)',                        4),
('Thai','Food',       'How much?',      'Rakha thaorai? (ราคาเท่าไร?)',           1),
('Thai','Food',       'The bill please','Kep tang duay (เก็บตังด้วย)',            2),
('Thai','Food',       'No meat',        'Mai sai nuea (ไม่ใส่เนื้อ)',             3),
('Thai','Food',       'Delicious',      'Aroy (อร่อย)',                            4),
('Thai','Numbers',    'One',            'Neung (หนึ่ง)',                           1),
('Thai','Numbers',    'Two',            'Song (สอง)',                              2),
('Thai','Numbers',    'Five',           'Ha (ห้า)',                               3),
('Thai','Numbers',    'Ten',            'Sip (สิบ)',                               4),
('Thai','Emergencies','Help!',          'Chuay duay! (ช่วยด้วย!)',                1),
('Thai','Emergencies','I need a doctor','Tong gaan mor (ต้องการหมอ)',             2),
('Thai','Emergencies','Police',         'Tamruat (ตำรวจ)',                         3),
('Thai','Emergencies','Hospital',       'Rong phayaban (โรงพยาบาล)',              4);
