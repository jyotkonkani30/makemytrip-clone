/**
 * Data Migration Utility
 * 
 * This script migrates old localStorage booking data to the new user-specific format.
 * It should be run once for each user to move their old bookings to the new format.
 */

function migrateUserData() {
  // Check if user is logged in
  const userId = UserTrips.getCurrentUserId();
  if (!userId) {
    console.error("Cannot migrate data: User not logged in");
    return false;
  }
  
  // Array of booking types to migrate
  const bookingTypes = ['bookedFlights', 'bookedHotels', 'bookedTrains'];
  const migrationResults = { success: true, migrations: {} };
  
  // Handle each booking type
  bookingTypes.forEach(oldKey => {
    try {
      // Get old data
      const oldData = JSON.parse(localStorage.getItem(oldKey)) || [];
      if (!oldData.length) {
        migrationResults.migrations[oldKey] = {
          status: 'skipped',
          message: 'No data found'
        };
        return;
      }
      
      // Convert old booking type to new format
      const newType = oldKey.replace('booked', '').toLowerCase();
      
      // Migrate each booking
      let migratedCount = 0;
      oldData.forEach(booking => {
        if (UserTrips.saveTrip(newType, booking)) {
          migratedCount++;
        }
      });
      
      migrationResults.migrations[oldKey] = {
        status: 'success',
        migrated: migratedCount,
        total: oldData.length
      };
    } catch (error) {
      console.error(`Error migrating ${oldKey}:`, error);
      migrationResults.success = false;
      migrationResults.migrations[oldKey] = {
        status: 'error',
        message: error.message
      };
    }
  });
  
  return migrationResults;
}
