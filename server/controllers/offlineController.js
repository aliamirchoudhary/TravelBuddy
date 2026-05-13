// Feature 11: Offline Mode controller
// Provides a compact trip bundle that the frontend can save in IndexedDB.
// This controller is written defensively: if a real DB pool is not available yet,
// it returns a demo bundle so the UI can still be tested before Azure integration.

function nowIso() {
  return new Date().toISOString();
}

function demoOfflineBundle(tripId) {
  return {
    tripId: Number(tripId),
    generatedAt: nowIso(),
    source: 'demo-fallback',
    trip: {
      TripID: Number(tripId),
      TripName: 'Northern Areas Adventure',
      Destination: 'Hunza, Gilgit-Baltistan',
      StartDate: '2026-06-10',
      EndDate: '2026-06-16',
      Status: 'planned',
    },
    hotel: {
      name: 'Mountain View Hotel',
      address: 'Karimabad, Hunza',
      phone: '+92-000-0000000',
      latitude: 36.3167,
      longitude: 74.6500,
    },
    itinerary: [
      {
        day: 1,
        date: '2026-06-10',
        title: 'Arrival and hotel check-in',
        location: 'Karimabad',
        notes: 'Keep hotel address and ID documents ready.',
      },
      {
        day: 2,
        date: '2026-06-11',
        title: 'Altit Fort and Baltit Fort visit',
        location: 'Hunza',
        notes: 'Start early and keep water/snacks.',
      },
      {
        day: 3,
        date: '2026-06-12',
        title: 'Attabad Lake and Passu Cones',
        location: 'Gojal',
        notes: 'Offline map screenshot recommended.',
      },
    ],
    restaurants: [
      { name: 'Hunza Food Pavilion', cuisine: 'Local', address: 'Karimabad Bazaar' },
      { name: 'Cafe de Hunza', cuisine: 'Cafe', address: 'Karimabad' },
    ],
    emergencyContacts: [
      { label: 'Local Emergency', value: '1122' },
      { label: 'Police', value: '15' },
      { label: 'Hotel Reception', value: '+92-000-0000000' },
    ],
    languagePhrases: [
      { phrase: 'Where is my hotel?', translation: 'Mera hotel kahan hai?' },
      { phrase: 'I need help.', translation: 'Mujhe madad chahiye.' },
      { phrase: 'How much does this cost?', translation: 'Is ki qeemat kya hai?' },
    ],
    map: {
      type: 'static-image',
      note: 'Use a Cloudinary/static map URL here after final integration.',
      staticMapUrl: 'https://placehold.co/900x500?text=Offline+Map+Preview',
    },
  };
}

async function getOfflineBundle(req, res) {
  const tripId = Number(req.params.id);

  if (!tripId || Number.isNaN(tripId)) {
    return res.status(400).json({ message: 'Valid trip id is required' });
  }

  try {
    // Later Azure integration can attach a DB pool to app.locals.pool.
    // If your project uses a different DB service, replace this block only.
    const pool = req.app.locals.pool;

    if (!pool) {
      return res.json(demoOfflineBundle(tripId));
    }

    const tripResult = await pool.request()
      .input('TripID', tripId)
      .query(`
        SELECT TOP 1 TripID, TripName, Destination, StartDate, EndDate, Status
        FROM Trips
        WHERE TripID = @TripID
      `);

    const trip = tripResult.recordset?.[0];

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const itineraryResult = await pool.request()
      .input('TripID', tripId)
      .query(`
        SELECT DayNumber AS day, ActivityDate AS date, Title AS title, Location AS location, Notes AS notes
        FROM ItineraryItems
        WHERE TripID = @TripID
        ORDER BY DayNumber, ActivityDate
      `);

    const hotelResult = await pool.request()
      .input('TripID', tripId)
      .query(`
        SELECT TOP 1 HotelName AS name, Address AS address, Phone AS phone, Latitude AS latitude, Longitude AS longitude
        FROM TripHotels
        WHERE TripID = @TripID
      `);

    const restaurantsResult = await pool.request()
      .input('TripID', tripId)
      .query(`
        SELECT RestaurantName AS name, Cuisine AS cuisine, Address AS address
        FROM TripRestaurants
        WHERE TripID = @TripID
      `);

    const bundle = {
      tripId,
      generatedAt: nowIso(),
      source: 'database',
      trip,
      hotel: hotelResult.recordset?.[0] || null,
      itinerary: itineraryResult.recordset || [],
      restaurants: restaurantsResult.recordset || [],
      emergencyContacts: [
        { label: 'Local Emergency', value: '1122' },
        { label: 'Police', value: '15' },
      ],
      languagePhrases: [
        { phrase: 'Where is my hotel?', translation: 'Mera hotel kahan hai?' },
        { phrase: 'I need help.', translation: 'Mujhe madad chahiye.' },
      ],
      map: {
        type: 'static-image',
        staticMapUrl: 'https://placehold.co/900x500?text=Offline+Map+Preview',
      },
    };

    return res.json(bundle);
  } catch (err) {
    console.error('Offline bundle error:', err);
    return res.status(500).json({
      message: 'Could not generate offline bundle',
      error: err.message,
    });
  }
}

module.exports = {
  getOfflineBundle,
};
