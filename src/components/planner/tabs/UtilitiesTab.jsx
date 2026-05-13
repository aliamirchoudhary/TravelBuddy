import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useTripStore from '../../../store/tripStore';
import api from '../../../services/api';

// ── Constants ────────────────────────────────────────────────────────────────

const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'JPY', 'TRY', 'AED', 'INR', 'CAD', 'AUD', 'SGD', 'THB'];

const FALLBACK_RATES = {
  'USD:EUR': 0.92,  'EUR:USD': 1.09,
  'USD:GBP': 0.79,  'GBP:USD': 1.27,
  'USD:PKR': 278.5, 'PKR:USD': 1/278.5,
  'USD:JPY': 155,   'JPY:USD': 1/155,
  'USD:TRY': 32.2,  'TRY:USD': 1/32.2,
  'USD:AED': 3.67,  'AED:USD': 1/3.67,
  'USD:INR': 83.1,  'INR:USD': 1/83.1,
  'USD:CAD': 1.36,  'CAD:USD': 1/1.36,
  'USD:AUD': 1.53,  'AUD:USD': 1/1.53,
  'USD:SGD': 1.34,  'SGD:USD': 1/1.34,
  'USD:THB': 35.8,  'THB:USD': 1/35.8,
};

function getFallback(from, to) {
  if (from === to) return 1;
  const direct = FALLBACK_RATES[`${from}:${to}`];
  if (direct) return direct;
  const toUsd   = FALLBACK_RATES[`${from}:USD`] ?? 1;
  const fromUsd = FALLBACK_RATES[`USD:${to}`]   ?? 1;
  return toUsd * fromUsd;
}

// ── Language phrases (grouped by category) ───────────────────────────────────

const PHRASES = {
  Japanese: {
    Greetings:   [['Hello','Konnichiwa (こんにちは)'],['Goodbye','Sayonara (さようなら)'],['Good morning','Ohayou gozaimasu (おはようございます)'],['Please','Onegaishimasu (お願いします)']],
    Directions:  [['Where is …?','Doko desu ka? (どこですか？)'],['Left','Hidari (左)'],['Right','Migi (右)'],['Station','Eki (駅)']],
    Food:        [['How much?','Ikura desu ka? (いくらですか？)'],['The bill please','Okaikei onegaishimasu (お会計お願いします)'],['No meat','Niku nashi de (肉なしで)'],['Delicious','Oishii (おいしい)']],
    Numbers:     [['One','Ichi (一)'],['Two','Ni (二)'],['Five','Go (五)'],['Ten','Juu (十)']],
    Emergencies: [['Help!','Tasukete! (助けて！)'],['I need a doctor','Isha ga hitsuyou desu (医者が必要です)'],['Police','Keisatsu (警察)'],['Hospital','Byouin (病院)']],
  },
  Turkish: {
    Greetings:   [['Hello','Merhaba'],['Goodbye','Hoşçakalın'],['Good morning','Günaydın'],['Please','Lütfen']],
    Directions:  [['Where is …?','Nerede?'],['Left','Sol'],['Right','Sağ'],['Station','İstasyon']],
    Food:        [['How much?','Bu ne kadar?'],['The bill please','Hesabı alabilir miyim?'],['No meat','Etsiz lütfen'],['Delicious','Nefis']],
    Numbers:     [['One','Bir'],['Two','İki'],['Five','Beş'],['Ten','On']],
    Emergencies: [['Help!','İmdat!'],['I need a doctor','Doktora ihtiyacım var'],['Police','Polis'],['Hospital','Hastane']],
  },
  Arabic: {
    Greetings:   [['Hello','Marhaban (مرحبا)'],['Goodbye','Ma\'a as-salama (مع السلامة)'],['Good morning','Sabah al-khayr (صباح الخير)'],['Please','Min fadlak (من فضلك)']],
    Directions:  [['Where is …?','Ayna? (أين؟)'],['Left','Yasaar (يسار)'],['Right','Yameen (يمين)'],['Station','Mahata (محطة)']],
    Food:        [['How much?','Bikam? (بكم؟)'],['The bill please','Al-hisab min fadlak (الحساب من فضلك)'],['No meat','Biddoon lahm (بدون لحم)'],['Delicious','Ladheedh (لذيذ)']],
    Numbers:     [['One','Wahid (واحد)'],['Two','Ithnayn (اثنان)'],['Five','Khamsa (خمسة)'],['Ten','Ashara (عشرة)']],
    Emergencies: [['Help!','Najda! (نجدة!)'],['I need a doctor','Ahtaj tabib (أحتاج طبيب)'],['Police','Shurta (شرطة)'],['Hospital','Mustashfa (مستشفى)']],
  },
  French: {
    Greetings:   [['Hello','Bonjour'],['Goodbye','Au revoir'],['Good morning','Bonjour'],['Please','S\'il vous plaît']],
    Directions:  [['Where is …?','Où est …?'],['Left','À gauche'],['Right','À droite'],['Station','La gare']],
    Food:        [['How much?','Combien ça coûte?'],['The bill please','L\'addition s\'il vous plaît'],['No meat','Sans viande'],['Delicious','Délicieux']],
    Numbers:     [['One','Un'],['Two','Deux'],['Five','Cinq'],['Ten','Dix']],
    Emergencies: [['Help!','Au secours!'],['I need a doctor','J\'ai besoin d\'un médecin'],['Police','Police'],['Hospital','Hôpital']],
  },
  Spanish: {
    Greetings:   [['Hello','Hola'],['Goodbye','Adiós'],['Good morning','Buenos días'],['Please','Por favor']],
    Directions:  [['Where is …?','¿Dónde está …?'],['Left','Izquierda'],['Right','Derecha'],['Station','La estación']],
    Food:        [['How much?','¿Cuánto cuesta?'],['The bill please','La cuenta por favor'],['No meat','Sin carne'],['Delicious','Delicioso']],
    Numbers:     [['One','Uno'],['Two','Dos'],['Five','Cinco'],['Ten','Diez']],
    Emergencies: [['Help!','¡Ayuda!'],['I need a doctor','Necesito un médico'],['Police','Policía'],['Hospital','Hospital']],
  },
  German: {
    Greetings:   [['Hello','Hallo'],['Goodbye','Auf Wiedersehen'],['Good morning','Guten Morgen'],['Please','Bitte']],
    Directions:  [['Where is …?','Wo ist …?'],['Left','Links'],['Right','Rechts'],['Station','Bahnhof']],
    Food:        [['How much?','Was kostet das?'],['The bill please','Die Rechnung bitte'],['No meat','Ohne Fleisch'],['Delicious','Köstlich']],
    Numbers:     [['One','Eins'],['Two','Zwei'],['Five','Fünf'],['Ten','Zehn']],
    Emergencies: [['Help!','Hilfe!'],['I need a doctor','Ich brauche einen Arzt'],['Police','Polizei'],['Hospital','Krankenhaus']],
  },
  Italian: {
    Greetings:   [['Hello','Ciao / Buongiorno'],['Goodbye','Arrivederci'],['Good morning','Buongiorno'],['Please','Per favore']],
    Directions:  [['Where is …?','Dov\'è …?'],['Left','Sinistra'],['Right','Destra'],['Station','La stazione']],
    Food:        [['How much?','Quanto costa?'],['The bill please','Il conto per favore'],['No meat','Senza carne'],['Delicious','Delizioso']],
    Numbers:     [['One','Uno'],['Two','Due'],['Five','Cinque'],['Ten','Dieci']],
    Emergencies: [['Help!','Aiuto!'],['I need a doctor','Ho bisogno di un medico'],['Police','Polizia'],['Hospital','Ospedale']],
  },
  Mandarin: {
    Greetings:   [['Hello','Nǐ hǎo (你好)'],['Goodbye','Zàijiàn (再见)'],['Good morning','Zǎo shàng hǎo (早上好)'],['Please','Qǐng (请)']],
    Directions:  [['Where is …?','…zài nǎlǐ? (在哪里？)'],['Left','Zuǒ (左)'],['Right','Yòu (右)'],['Station','Zhàn (站)']],
    Food:        [['How much?','Duōshǎo qián? (多少钱？)'],['The bill please','Mǎidān (买单)'],['No meat','Bù yào ròu (不要肉)'],['Delicious','Hǎochī (好吃)']],
    Numbers:     [['One','Yī (一)'],['Two','Èr (二)'],['Five','Wǔ (五)'],['Ten','Shí (十)']],
    Emergencies: [['Help!','Jiùmìng! (救命！)'],['I need a doctor','Wǒ xūyào yīshēng (我需要医生)'],['Police','Jǐngchá (警察)'],['Hospital','Yīyuàn (医院)']],
  },
  Thai: {
    Greetings:   [['Hello','Sawasdee (สวัสดี)'],['Goodbye','La gorn (ลาก่อน)'],['Good morning','Sawasdee ton chao (สวัสดีตอนเช้า)'],['Please','Karuna (กรุณา)']],
    Directions:  [['Where is …?','…yuu thi nai? (อยู่ที่ไหน?)'],['Left','Sai (ซ้าย)'],['Right','Khwa (ขวา)'],['Station','Sathanii (สถานี)']],
    Food:        [['How much?','Rakha thaorai? (ราคาเท่าไร?)'],['The bill please','Kep tang duay (เก็บตังด้วย)'],['No meat','Mai sai nuea (ไม่ใส่เนื้อ)'],['Delicious','Aroy (อร่อย)']],
    Numbers:     [['One','Neung (หนึ่ง)'],['Two','Song (สอง)'],['Five','Ha (ห้า)'],['Ten','Sip (สิบ)']],
    Emergencies: [['Help!','Chuay duay! (ช่วยด้วย!)'],['I need a doctor','Tong gaan mor (ต้องการหมอ)'],['Police','Tamruat (ตำรวจ)'],['Hospital','Rong phayaban (โรงพยาบาล)']],
  },
};

const PHRASE_CATEGORIES = ['Greetings', 'Directions', 'Food', 'Numbers', 'Emergencies'];

const COUNTRY_LANGUAGE_MAP = {
  japan: 'Japanese', turkey: 'Turkish', pakistan: 'Arabic', 'saudi arabia': 'Arabic',
  uae: 'Arabic', 'united arab emirates': 'Arabic', france: 'French', spain: 'Spanish',
  mexico: 'Spanish', germany: 'German', italy: 'Italian', china: 'Mandarin', thailand: 'Thai',
};

const EMERGENCY_BY_COUNTRY = {
  japan:                  { police: '110',  ambulance: '119', fire: '119',  embassy: '+81-3-3224-5000'  },
  pakistan:               { police: '15',   ambulance: '1122',fire: '16',   embassy: '+92-51-201-4000'  },
  turkey:                 { police: '155',  ambulance: '112', fire: '110',  embassy: '+90-312-455-5555' },
  uk:                     { police: '999',  ambulance: '999', fire: '999',  embassy: '+44-20-7499-9000' },
  'united kingdom':       { police: '999',  ambulance: '999', fire: '999',  embassy: '+44-20-7499-9000' },
  usa:                    { police: '911',  ambulance: '911', fire: '911',  embassy: '+1-202-501-4444'  },
  'united states':        { police: '911',  ambulance: '911', fire: '911',  embassy: '+1-202-501-4444'  },
  france:                 { police: '17',   ambulance: '15',  fire: '18',   embassy: '+33-1-4312-2222'  },
  germany:                { police: '110',  ambulance: '112', fire: '112',  embassy: '+49-30-8305-0'    },
  italy:                  { police: '113',  ambulance: '118', fire: '115',  embassy: '+39-06-46741'     },
  spain:                  { police: '091',  ambulance: '112', fire: '080',  embassy: '+34-91-587-2200'  },
  uae:                    { police: '999',  ambulance: '998', fire: '997',  embassy: '+971-2-414-2200'  },
  'united arab emirates': { police: '999',  ambulance: '998', fire: '997',  embassy: '+971-2-414-2200'  },
  india:                  { police: '100',  ambulance: '102', fire: '101',  embassy: '+91-11-2419-8000' },
  australia:              { police: '000',  ambulance: '000', fire: '000',  embassy: '+61-2-6214-5600'  },
  canada:                 { police: '911',  ambulance: '911', fire: '911',  embassy: '+1-613-238-5335'  },
  china:                  { police: '110',  ambulance: '120', fire: '119',  embassy: '+86-10-8531-3000' },
  thailand:               { police: '191',  ambulance: '1669',fire: '199',  embassy: '+66-2-205-4049'   },
  singapore:              { police: '999',  ambulance: '995', fire: '995',  embassy: '+65-6476-9100'    },
  'saudi arabia':         { police: '999',  ambulance: '997', fire: '998',  embassy: '+966-11-488-3800' },
  malaysia:               { police: '999',  ambulance: '999', fire: '994',  embassy: '+60-3-2168-5000'  },
};
const DEFAULT_EMERGENCY = { police: '112', ambulance: '112', fire: '112', embassy: 'Contact your embassy' };

function getEmergency(countryName) {
  return EMERGENCY_BY_COUNTRY[String(countryName || '').trim().toLowerCase()] || DEFAULT_EMERGENCY;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function UtilitiesTab() {
  const { trip } = useTripStore();

  // ── Currency ──
  const [amount,       setAmount]       = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency,   setToCurrency]   = useState('USD');
  const [liveRate,     setLiveRate]     = useState(null);
  const [rateIsLive,   setRateIsLive]   = useState(false);
  const [rateLoading,  setRateLoading]  = useState(false);
  const [rateUpdatedAt,setRateUpdatedAt]= useState(null);
  const rateKey = useRef('');

  // ── Language ──
  const [language,      setLanguage]     = useState('Japanese');
  const [openCategory,  setOpenCategory] = useState('Greetings');
  const [copied,        setCopied]       = useState(null); // "cat-idx"
  const [phraseMap,     setPhraseMap]    = useState(PHRASES);
  const [languages,     setLanguages]    = useState(Object.keys(PHRASES));

  // ── Embassy details from DB ──
  const [embassyDetails, setEmbassyDetails] = useState(null);
  const [embassyLoading, setEmbassyLoading] = useState(false);

  // ── Nearest hospitals (Google Places) ──
  const [hospitals,        setHospitals]       = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [hospitalsError,   setHospitalsError]   = useState(false);

  // ── Personal emergency contacts ──
  const [contacts,      setContacts]     = useState([]);
  const [contactsLoaded,setContactsLoaded]=useState(false);
  const [contactForm,   setContactForm]  = useState({ name:'', relationship:'', phoneNumber:'', email:'' });
  const [addingContact, setAddingContact]= useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);

  // ── Toast ──
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  // Init toCurrency from trip
  useEffect(() => {
    if (trip?.CountryCurrencyCode) {
      const code = trip.CountryCurrencyCode.toUpperCase();
      if (CURRENCIES.includes(code)) setToCurrency(code);
    }
  }, [trip?.CountryCurrencyCode]);

  // Auto-detect language
  useEffect(() => {
    if (!trip?.CountryName) return;
    const suggested = COUNTRY_LANGUAGE_MAP[trip.CountryName.trim().toLowerCase()];
    if (suggested) setLanguage(suggested);
  }, [trip?.CountryName]);

  useEffect(() => {
    let cancelled = false;
    api.get('/utilities/phrases/languages')
      .then(({ data }) => {
        if (cancelled) return;
        if (Array.isArray(data?.languages) && data.languages.length) {
          setLanguages(data.languages);
          if (!data.languages.includes(language)) {
            setLanguage(data.languages[0]);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setLanguages(Object.keys(PHRASES));
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get(`/utilities/phrases?language=${encodeURIComponent(language)}`)
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.phrases && Object.keys(data.phrases).length) {
          setPhraseMap(prev => ({ ...prev, [language]: data.phrases }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPhraseMap(prev => ({ ...prev, [language]: PHRASES[language] || {} }));
        }
      });
    return () => { cancelled = true; };
  }, [language]);

  // Fetch live rate
  useEffect(() => {
    if (fromCurrency === toCurrency) { setLiveRate(1); setRateIsLive(true); setRateUpdatedAt(new Date()); return; }
    const key = `${fromCurrency}:${toCurrency}`;
    if (rateKey.current === key && liveRate !== null) return;
    rateKey.current = key;
    setRateLoading(true);
    let cancelled = false;
    api.get(`/expenses/rates?base=${fromCurrency}&target=${toCurrency}`)
      .then(({ data }) => {
        if (!cancelled && data.rate) {
          setLiveRate(Number(data.rate));
          setRateIsLive(true);
          setRateUpdatedAt(new Date());
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLiveRate(getFallback(fromCurrency, toCurrency));
          setRateIsLive(false);
          setRateUpdatedAt(null);
        }
      })
      .finally(() => { if (!cancelled) setRateLoading(false); });
    return () => { cancelled = true; };
  }, [fromCurrency, toCurrency]);

  const rate = liveRate ?? getFallback(fromCurrency, toCurrency);
  const convertedAmount = useMemo(() => (Number(amount || 0) * rate).toFixed(2), [amount, rate]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency); setToCurrency(fromCurrency);
    setLiveRate(null); rateKey.current = '';
  };

  const copyPhrase = (text, key) => {
    try { navigator.clipboard.writeText(text); } catch {}
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const emergency = useMemo(() => getEmergency(trip?.CountryName), [trip?.CountryName]);
  const copyEmergency = (val) => { try { navigator.clipboard.writeText(String(val)); } catch {} };

  // Fetch full embassy details from DB
  useEffect(() => {
    if (!trip?.CountryName) { setEmbassyDetails(null); return; }
    const key = trip.CountryName.trim().toLowerCase();
    setEmbassyLoading(true);
    api.get(`/emergency/embassy?country=${encodeURIComponent(key)}`)
      .then(({ data }) => setEmbassyDetails(data.embassy || null))
      .catch(() => setEmbassyDetails(null))
      .finally(() => setEmbassyLoading(false));
  }, [trip?.CountryName]);

  // Fetch nearest hospitals via backend proxy to Google Places
  useEffect(() => {
    if (!trip?.CityName) { setHospitals([]); return; }
    setHospitalsLoading(true);
    setHospitalsError(false);
    api.get(`/emergency/hospitals?city=${encodeURIComponent(trip.CityName)}`)
      .then(({ data }) => setHospitals(data.hospitals || []))
      .catch(() => { setHospitals([]); setHospitalsError(true); })
      .finally(() => setHospitalsLoading(false));
  }, [trip?.CityName]);

  // Fetch personal contacts
  useEffect(() => {
    if (!trip?.TripID || contactsLoaded) return;
    api.get(`/emergency/contacts/${trip.TripID}`)
      .then(({ data }) => { setContacts(data.contacts || []); setContactsLoaded(true); })
      .catch(() => {});
  }, [trip?.TripID, contactsLoaded]);

  const addContact = async () => {
    if (!contactForm.name.trim()) return;
    setAddingContact(true);
    try {
      const { data } = await api.post(`/emergency/contacts/${trip.TripID}`, contactForm);
      setContacts(prev => [...prev, { ContactID: data.contactId, ...contactForm }]);
      setContactForm({ name:'', relationship:'', phoneNumber:'', email:'' });
      setShowContactForm(false);
      showToast('Contact saved.');
    } catch {
      showToast('Failed to save contact.', 'error');
    } finally {
      setAddingContact(false);
    }
  };

  const deleteContact = async (contactId) => {
    setDeletingContact(contactId);
    try {
      await api.delete(`/emergency/contacts/${trip.TripID}/${contactId}`);
      setContacts(prev => prev.filter(c => c.ContactID !== contactId));
      showToast('Contact removed.');
    } catch {
      showToast('Failed to remove contact.', 'error');
    } finally {
      setDeletingContact(null);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeUp 0.6s ease', position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          padding: '14px 22px', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
          background: toast.type === 'error' ? 'rgba(255,115,83,0.95)' : 'rgba(52,211,153,0.95)',
          color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'fadeIn 0.3s ease',
        }}>
          {toast.type === 'error' ? '⚠️' : '✓'} {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: '28px' }}>
        <h3 className="display-heading" style={{ fontSize: '32px', marginBottom: '8px' }}>
          Travel <span className="text-gradient">Utilities</span>
        </h3>
        <p style={{ color: 'var(--paper-muted)', fontSize: '15px' }}>
          Currency, language support, and emergency readiness for{' '}
          <strong style={{ color: 'var(--accent)' }}>{trip?.CityName || 'your destination'}</strong>.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>

        {/* ── CURRENCY CONVERTER ── */}
        <div className="bento-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div className="tag">Currency Converter</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
              <span style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
                color: rateIsLive ? 'var(--accent3)' : 'var(--paper-dim)',
                padding: '4px 10px', borderRadius: '99px',
                background: rateIsLive ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${rateIsLive ? 'rgba(52,211,153,0.25)' : 'var(--border)'}`,
              }}>
                {rateLoading ? '⟳ Fetching…' : rateIsLive ? '● Live Rate' : '○ Offline Rate'}
              </span>
              {rateUpdatedAt && (
                <span style={{ fontSize: '10px', color: 'var(--paper-ghost)' }}>
                  Updated {rateUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto 1fr', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--paper-dim)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>From</span>
              <select className="input-light" value={fromCurrency}
                onChange={e => { setFromCurrency(e.target.value); setLiveRate(null); rateKey.current = ''; }}
                style={{ padding: '10px 12px' }}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'transparent' }}>x</span>
              <input className="input-light" type="number" value={amount} onChange={e => setAmount(e.target.value)}
                style={{ width: '120px', padding: '10px 12px', textAlign: 'center', fontSize: '16px', fontWeight: 700 }} />
            </div>
            <button onClick={swapCurrencies} style={{
              background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '50%',
              width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'background 0.2s, border-color 0.2s', alignSelf: 'flex-end', marginBottom: '2px',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              title="Swap currencies">⇄</button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--paper-dim)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>To</span>
              <select className="input-light" value={toCurrency}
                onChange={e => { setToCurrency(e.target.value); setLiveRate(null); rateKey.current = ''; }}
                style={{ padding: '10px 12px' }}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'transparent' }}>x</span>
              <div className="input-light" style={{
                padding: '10px 12px', fontSize: '16px', fontWeight: 900,
                color: 'var(--accent)', borderRadius: '12px', textAlign: 'center',
                background: 'rgba(129,236,255,0.06)',
              }}>
                {rateLoading ? '…' : convertedAmount}
              </div>
            </div>
          </div>

          <p style={{ margin: '14px 0 0', color: 'var(--paper-muted)', fontSize: '13px' }}>
            1 {fromCurrency} = <strong style={{ color: 'var(--paper)' }}>{rate.toFixed(4)}</strong> {toCurrency}
            {!rateIsLive && <span style={{ color: 'var(--paper-ghost)', marginLeft: '8px' }}>(offline fallback)</span>}
          </p>
        </div>

        {/* ── LANGUAGE PHRASE HELPER ── */}
        <div className="bento-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div className="tag">Language Phrase Helper</div>
            {trip?.CountryName && COUNTRY_LANGUAGE_MAP[trip.CountryName.toLowerCase()] && (
              <span style={{ fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '3px 10px', borderRadius: '99px', border: '1px solid var(--border-cyan)', fontWeight: 700 }}>
                Auto-detected for {trip.CountryName}
              </span>
            )}
          </div>

          <select className="input-light" value={language} onChange={e => setLanguage(e.target.value)}
            style={{ padding: '10px 14px', marginBottom: '16px', minWidth: '200px' }}>
            {languages.map(lang => <option key={lang}>{lang}</option>)}
          </select>

          {/* Accordion categories */}
          <div style={{ display: 'grid', gap: '8px' }}>
            {PHRASE_CATEGORIES.map(cat => {
              const isOpen = openCategory === cat;
              const phrases = phraseMap[language]?.[cat] || [];
              return (
                <div key={cat} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenCategory(isOpen ? null : cat)}
                    style={{
                      width: '100%', padding: '12px 16px', background: isOpen ? 'var(--accent-dim)' : 'rgba(255,255,255,0.02)',
                      border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      color: isOpen ? 'var(--accent)' : 'var(--paper)', fontFamily: 'inherit', fontWeight: 700, fontSize: '13px',
                      transition: 'background 0.2s',
                    }}
                  >
                    <span>{cat}</span>
                    <span style={{ fontSize: '12px', opacity: 0.6 }}>{isOpen ? '▲' : '▼'}</span>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '8px', display: 'grid', gap: '6px' }}>
                      {phrases.map(([english, translated], idx) => {
                        const ck = `${cat}-${idx}`;
                        return (
                          <div key={ck} style={{
                            display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center',
                            border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px',
                            background: copied === ck ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.03)',
                            transition: 'background 0.2s',
                          }}>
                            <div>
                              <div style={{ fontSize: '11px', color: 'var(--paper-dim)', marginBottom: '2px' }}>{english}</div>
                              <div style={{ fontWeight: 700, fontSize: '14px' }}>{translated}</div>
                            </div>
                            <button className="btn btn-outline"
                              style={{ padding: '7px 14px', fontSize: '12px', whiteSpace: 'nowrap',
                                color: copied === ck ? 'var(--accent3)' : undefined,
                                borderColor: copied === ck ? 'var(--accent3)' : undefined,
                              }}
                              onClick={() => copyPhrase(translated, ck)}>
                              {copied === ck ? '✓ Copied' : 'Copy'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── EMERGENCY ASSISTANCE ── */}
        <div className="bento-card" style={{ padding: '28px', borderColor: 'var(--border-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div className="tag">Emergency Assistance</div>
            <span style={{ fontSize: '12px', color: 'var(--paper-muted)' }}>
              📍 {trip?.CountryName || 'No destination set'} · numbers auto-update with destination
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {[
              ['🚔 Police',    emergency.police],
              ['🚑 Ambulance', emergency.ambulance],
              ['🔥 Fire',      emergency.fire],
              ['🏛️ Embassy',   emergency.embassy],
            ].map(([label, value]) => (
              <div key={label} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                <div className="tag" style={{ marginBottom: '10px' }}>{label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '17px', color: 'var(--paper)' }}>{value}</strong>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => copyEmergency(value)}>Copy</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button className="btn btn-primary" onClick={() => { window.location.href = `tel:${emergency.ambulance}`; }}>🚑 Call Ambulance</button>
            <button className="btn btn-outline" onClick={() => { window.location.href = `tel:${emergency.police}`; }}>🚔 Call Police</button>
            <button className="btn btn-outline" onClick={() => { window.location.href = `tel:${emergency.fire}`; }}>🔥 Call Fire</button>
          </div>

          {/* Embassy full details */}
          {embassyLoading && <p style={{ fontSize: '12px', color: 'var(--paper-dim)' }}>Loading embassy details…</p>}
          {!embassyLoading && embassyDetails && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'grid', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '1px', marginBottom: '8px' }}>EMBASSY DETAILS</div>
              {embassyDetails.Address && (
                <div style={{ fontSize: '13px', color: 'var(--paper-muted)', display: 'flex', gap: '8px' }}>
                  <span>📍</span><span>{embassyDetails.Address}</span>
                </div>
              )}
              {embassyDetails.OpeningHours && (
                <div style={{ fontSize: '13px', color: 'var(--paper-muted)', display: 'flex', gap: '8px' }}>
                  <span>🕐</span><span>{embassyDetails.OpeningHours}</span>
                </div>
              )}
              {embassyDetails.Email && (
                <div style={{ fontSize: '13px', color: 'var(--paper-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span>✉️</span>
                  <a href={`mailto:${embassyDetails.Email}`} style={{ color: 'var(--accent)' }}>{embassyDetails.Email}</a>
                </div>
              )}
              {embassyDetails.Website && (
                <div style={{ fontSize: '13px', color: 'var(--paper-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span>🌐</span>
                  <a href={embassyDetails.Website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>{embassyDetails.Website}</a>
                </div>
              )}
            </div>
          )}

          {!trip?.CountryName && (
            <p style={{ margin: '14px 0 0', fontSize: '12px', color: 'var(--paper-ghost)' }}>
              ℹ️ Set a destination on the Destination tab to load country-specific emergency numbers.
            </p>
          )}
        </div>

        {/* ── NEAREST HOSPITALS ── */}
        <div className="bento-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="tag">Nearest Hospitals</div>
            {trip?.CityName && (
              <span style={{ fontSize: '12px', color: 'var(--paper-muted)' }}>Near {trip.CityName}</span>
            )}
          </div>

          {!trip?.CityName && (
            <p style={{ fontSize: '13px', color: 'var(--paper-ghost)' }}>Set a destination city to find nearby hospitals.</p>
          )}
          {trip?.CityName && hospitalsLoading && (
            <p style={{ fontSize: '13px', color: 'var(--paper-dim)' }}>⟳ Searching for hospitals…</p>
          )}
          {trip?.CityName && !hospitalsLoading && hospitalsError && (
            <p style={{ fontSize: '13px', color: 'var(--paper-dim)' }}>Could not load hospitals. Check connection or Google Places API key.</p>
          )}
          {trip?.CityName && !hospitalsLoading && !hospitalsError && hospitals.length === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--paper-ghost)' }}>No hospital data available for this city.</p>
          )}
          {hospitals.length > 0 && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {hospitals.slice(0, 5).map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--paper)' }}>🏥 {h.name}</div>
                    {h.address && <div style={{ fontSize: '11px', color: 'var(--paper-dim)', marginTop: '3px' }}>{h.address}</div>}
                    {h.rating && <div style={{ fontSize: '11px', color: 'var(--accent5)', marginTop: '2px' }}>★ {h.rating}</div>}
                  </div>
                  {h.placeId && (
                    <a
                      href={`https://www.google.com/maps/place/?q=place_id:${h.placeId}`}
                      target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ padding: '7px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      Map →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── PERSONAL EMERGENCY CONTACTS ── */}
        {trip?.TripID && (
          <div className="bento-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="tag">Emergency Contacts</div>
              <button className="btn btn-outline" style={{ padding: '7px 16px', fontSize: '12px' }} onClick={() => setShowContactForm(v => !v)}>
                {showContactForm ? 'Cancel' : '+ Add Contact'}
              </button>
            </div>

            {showContactForm && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                {[
                  ['Name *',        'name',         'text', 'Jane Smith'],
                  ['Relationship',  'relationship', 'text', 'Parent, Doctor…'],
                  ['Phone',         'phoneNumber',  'tel',  '+1 555 000 0000'],
                  ['Email',         'email',        'email','jane@email.com'],
                ].map(([label, field, type, placeholder]) => (
                  <div key={field}>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--paper-dim)', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>{label.toUpperCase()}</label>
                    <input type={type} placeholder={placeholder} value={contactForm[field]}
                      onChange={e => setContactForm(p => ({ ...p, [field]: e.target.value }))}
                      className="input-light" style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" disabled={addingContact} onClick={addContact} style={{ padding: '10px 24px' }}>
                    {addingContact ? '…' : 'Save Contact'}
                  </button>
                </div>
              </div>
            )}

            {contacts.length === 0 && !showContactForm && (
              <p style={{ fontSize: '13px', color: 'var(--paper-ghost)' }}>No emergency contacts saved for this trip.</p>
            )}

            <div style={{ display: 'grid', gap: '8px' }}>
              {contacts.map(c => (
                <div key={c.ContactID} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>👤 {c.Name || c.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--paper-dim)', marginTop: '3px' }}>
                      {(c.Relationship || c.relationship) && <span style={{ marginRight: '12px' }}>{c.Relationship || c.relationship}</span>}
                      {(c.PhoneNumber || c.phoneNumber) && <a href={`tel:${c.PhoneNumber || c.phoneNumber}`} style={{ color: 'var(--accent)' }}>{c.PhoneNumber || c.phoneNumber}</a>}
                    </div>
                    {(c.Email || c.email) && (
                      <a href={`mailto:${c.Email || c.email}`} style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '2px', display: 'block' }}>{c.Email || c.email}</a>
                    )}
                  </div>
                  <button
                    onClick={() => deleteContact(c.ContactID)}
                    disabled={deletingContact === c.ContactID}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--paper-ghost)', fontSize: '15px', padding: '4px 8px', borderRadius: '6px', opacity: deletingContact === c.ContactID ? 0.4 : 1, transition: 'color 0.2s, background 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent2)'; e.currentTarget.style.background = 'rgba(255,115,83,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--paper-ghost)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    {deletingContact === c.ContactID ? '…' : '✕'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TRAVEL INSURANCE REMINDER ── */}
        <div className="bento-card" style={{ padding: '24px', background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.2)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '32px', flexShrink: 0 }}>🛡️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: '15px', color: 'var(--accent5)', marginBottom: '6px' }}>Travel Insurance</div>
              <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--paper-muted)', lineHeight: 1.6 }}>
                Protect your trip against medical emergencies, cancellations, and lost luggage. Most travellers who skip insurance regret it when something goes wrong.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a href="https://www.worldnomads.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '8px 18px', fontSize: '12px' }}>World Nomads →</a>
                <a href="https://www.insureandgo.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '8px 18px', fontSize: '12px' }}>InsureAndGo →</a>
                <a href="https://www.safetywing.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '8px 18px', fontSize: '12px' }}>SafetyWing →</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
