const { sql, poolPromise } = require('../db');

// GET /api/emergency/embassy?country=japan
async function getEmbassyDetails(req, res) {
  try {
    const pool = await poolPromise;
    const key  = String(req.query.country || '').trim().toLowerCase();
    if (!key) return res.status(400).json({ message: 'country query required' });

    const r = await pool.request()
      .input('cn', sql.NVarChar(100), key)
      .query(`SELECT * FROM EmbassyContacts WHERE LOWER(CountryName) = @cn`);

    if (!r.recordset.length) return res.json({ embassy: null });
    res.json({ embassy: r.recordset[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch embassy' });
  }
}

// GET /api/emergency/contacts/:tripId
async function getEmergencyContacts(req, res) {
  try {
    const pool   = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const r = await pool.request()
      .input('tid', sql.Int, tripId)
      .input('uid', sql.Int, req.user.id)
      .query(`SELECT * FROM EmergencyContacts WHERE TripID=@tid AND UserID=@uid ORDER BY CreatedAt`);
    res.json({ contacts: r.recordset });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contacts' });
  }
}

// POST /api/emergency/contacts/:tripId
async function addEmergencyContact(req, res) {
  try {
    const pool   = await poolPromise;
    const tripId = parseInt(req.params.tripId);
    const { name, relationship, phoneNumber, email, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });

    const r = await pool.request()
      .input('tid',  sql.Int,           tripId)
      .input('uid',  sql.Int,           req.user.id)
      .input('name', sql.NVarChar(100), name.trim())
      .input('rel',  sql.NVarChar(50),  relationship || null)
      .input('ph',   sql.NVarChar(30),  phoneNumber  || null)
      .input('em',   sql.NVarChar(100), email        || null)
      .input('note', sql.NVarChar(300), notes        || null)
      .query(`INSERT INTO EmergencyContacts (TripID,UserID,Name,Relationship,PhoneNumber,Email,Notes)
              OUTPUT INSERTED.ContactID VALUES (@tid,@uid,@name,@rel,@ph,@em,@note)`);
    res.status(201).json({ contactId: r.recordset[0].ContactID });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add contact' });
  }
}

// DELETE /api/emergency/contacts/:tripId/:contactId
async function deleteEmergencyContact(req, res) {
  try {
    const pool      = await poolPromise;
    const tripId    = parseInt(req.params.tripId);
    const contactId = parseInt(req.params.contactId);

    const check = await pool.request()
      .input('cid', sql.Int, contactId).input('tid', sql.Int, tripId).input('uid', sql.Int, req.user.id)
      .query(`SELECT ContactID FROM EmergencyContacts WHERE ContactID=@cid AND TripID=@tid AND UserID=@uid`);
    if (!check.recordset.length) return res.status(404).json({ message: 'Contact not found' });

    await pool.request().input('cid', sql.Int, contactId)
      .query(`DELETE FROM EmergencyContacts WHERE ContactID=@cid`);
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete contact' });
  }
}

// GET /api/emergency/hospitals?city=Tokyo
// Proxies Google Places Text Search — requires GOOGLE_PLACES_API_KEY in .env
async function getNearbyHospitals(req, res) {
  const city = String(req.query.city || '').trim();
  if (!city) return res.status(400).json({ message: 'city query required' });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    // Graceful degradation — return empty rather than crash
    return res.json({ hospitals: [] });
  }

  try {
    const query    = encodeURIComponent(`hospitals near ${city}`);
    const url      = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&type=hospital&key=${apiKey}`;
    const response = await fetch(url);
    const data     = await response.json();

    const hospitals = (data.results || []).slice(0, 5).map(p => ({
      name:     p.name,
      address:  p.formatted_address,
      rating:   p.rating || null,
      placeId:  p.place_id,
      lat:      p.geometry?.location?.lat,
      lng:      p.geometry?.location?.lng,
    }));

    res.json({ hospitals });
  } catch (err) {
    res.status(500).json({ message: 'Hospital lookup failed' });
  }
}

module.exports = { getEmbassyDetails, getNearbyHospitals, getEmergencyContacts, addEmergencyContact, deleteEmergencyContact };
