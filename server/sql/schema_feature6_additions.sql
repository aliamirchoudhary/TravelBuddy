-- ── Feature 6: Destination-tab hotel selection linkage ──────────────────────
-- Append to server/schema.sql

ALTER TABLE Trips ADD SelectedHotelID INT NULL;
ALTER TABLE Trips ADD CONSTRAINT FK_Trip_SelectedHotel
  FOREIGN KEY (SelectedHotelID) REFERENCES Hotels(HotelID);
