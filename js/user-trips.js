/**
 * User-Specific Trip Storage System
 * 
 * This module provides utilities to store and retrieve trip data
 * specific to individual users based on their user ID from JWT token.
 */

const UserTrips = {
  /**
   * Get the current user ID from JWT token in localStorage
   * @returns {string|null} User ID or null if not logged in
   */
  getCurrentUserId: function() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.id || payload.username; // Fallback to username if ID is not present
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  },
  
  /**
   * Get the current username from JWT token
   * @returns {string|null} Username or null if not logged in
   */
  getCurrentUsername: function() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.username || payload.email; // Fallback to email if username is not present
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  },
  
  /**
   * Store trip data for the current user
   * @param {string} tripType - Type of trip ('flights', 'hotels', or 'trains')
   * @param {Object} tripData - The trip data to store
   * @returns {boolean} Success state
   */
  saveTrip: function(tripType, tripData) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.error('Cannot save trip: User not logged in');
      return false;
    }
    
    console.log(`Saving ${tripType} for user ${userId}:`, tripData);
    
    // Add metadata to the trip if not already present
    const enhancedTripData = {
      ...tripData,
      userId: userId,
      bookingId: tripData.bookingId || this._generateBookingId(),
      bookingDate: tripData.bookingDate || new Date().toISOString()
    };
    
    // Get existing trips for this user
    const userTrips = this.getTrips(tripType);
    
    // Add the new trip
    userTrips.push(enhancedTripData);
    
    // Store back to localStorage
    const storageKey = `userTrips_${userId}_${tripType}`;
    localStorage.setItem(storageKey, JSON.stringify(userTrips));
    
    // Also update legacy storage for compatibility
    if (tripType === 'flights') {
      window.bookedFlights = userTrips;
    } else if (tripType === 'hotels') {
      window.bookedHotels = userTrips;
    } else if (tripType === 'trains') {
      window.bookedTrains = userTrips;
    }
    
    return true;
  },
  
  /**
   * Get all trips of specified type for current user
   * @param {string} tripType - Type of trip ('flights', 'hotels', or 'trains')
   * @returns {Array} Array of trips or empty array
   */
  getTrips: function(tripType) {
    const userId = this.getCurrentUserId();
    if (!userId) return [];
    
    const storageKey = `userTrips_${userId}_${tripType}`;
    const trips = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    // Debug logging
    console.log(`Retrieved ${trips.length} ${tripType} for user ${userId}`);
    
    return trips;
  },
  
  /**
   * Delete a specific trip
   * @param {string} tripType - Type of trip ('flights', 'hotels', or 'trains')
   * @param {string} bookingId - ID of the trip to delete
   * @returns {boolean} Success state
   */
  deleteTrip: function(tripType, bookingId) {
    const userId = this.getCurrentUserId();
    if (!userId) return false;
    
    const trips = this.getTrips(tripType);
    const initialLength = trips.length;
    
    const updatedTrips = trips.filter(trip => trip.bookingId !== bookingId);
    
    if (updatedTrips.length === initialLength) {
      return false; // Nothing was removed
    }
    
    const storageKey = `userTrips_${userId}_${tripType}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedTrips));
    return true;
  },
  
  /**
   * Clear all trips for current user
   * @param {string} tripType - Type of trip ('flights', 'hotels', or 'trains') or 'all'
   * @returns {boolean} Success state
   */
  clearTrips: function(tripType = 'all') {
    const userId = this.getCurrentUserId();
    if (!userId) return false;
    
    if (tripType === 'all') {
      localStorage.removeItem(`userTrips_${userId}_flights`);
      localStorage.removeItem(`userTrips_${userId}_hotels`);
      localStorage.removeItem(`userTrips_${userId}_trains`);
    } else {
      localStorage.removeItem(`userTrips_${userId}_${tripType}`);
    }
    
    return true;
  },
  
  /**
   * Migrate legacy bookings to the user-specific format
   * @returns {Object} Migration results
   */
  migrateBookings: function() {
    const userId = this.getCurrentUserId();
    if (!userId) return { success: false, error: 'Not logged in' };
    
    const results = {
      success: true,
      migrated: {
        flights: 0,
        hotels: 0,
        trains: 0
      }
    };
    
    try {
      // Migrate flights
      const legacyFlights = JSON.parse(localStorage.getItem('bookedFlights')) || [];
      legacyFlights.forEach(flight => {
        if (this.saveTrip('flights', flight)) {
          results.migrated.flights++;
        }
      });
      
      // Migrate hotels
      const legacyHotels = JSON.parse(localStorage.getItem('bookedHotels')) || [];
      legacyHotels.forEach(hotel => {
        if (this.saveTrip('hotels', hotel)) {
          results.migrated.hotels++;
        }
      });
      
      // Migrate trains
      const legacyTrains = JSON.parse(localStorage.getItem('bookedTrains')) || [];
      legacyTrains.forEach(train => {
        if (this.saveTrip('trains', train)) {
          results.migrated.trains++;
        }
      });
      
      return results;
    } catch (error) {
      console.error('Error during migration:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Generate a unique booking ID
   * @private
   * @returns {string} Unique booking ID
   */
  _generateBookingId: function() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let bookingId = '';
    
    // Add 3 random letters
    for (let i = 0; i < 3; i++) {
      bookingId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Add a dash
    bookingId += '-';
    
    // Add 4 random numbers
    for (let i = 0; i < 4; i++) {
      bookingId += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return bookingId;
  }
};

// Add a function to run migration on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check for migration flag
  if (localStorage.getItem('needsMigration') === 'true') {
    const userId = UserTrips.getCurrentUserId();
    if (userId) {
      console.log('Migrating legacy bookings to user-specific storage...');
      const result = UserTrips.migrateBookings();
      console.log('Migration result:', result);
      localStorage.removeItem('needsMigration');
    }
  }
});
