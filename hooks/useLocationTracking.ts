import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  heading: number;
  smoothedHeading: number;
  accuracy?: number;
  speed?: number;
  timestamp: number;
  isMoving: boolean;
  isValid: boolean;
  signalStrength: 'excellent' | 'good' | 'poor' | 'lost';
}

interface UseLocationTrackingOptions {
  enableHighAccuracy?: boolean;
  distanceInterval?: number;
  timeInterval?: number;
  minAccuracy?: number;
  headingSamples?: number;
}

export function useLocationTracking(options: UseLocationTrackingOptions = {}) {
  const {
    enableHighAccuracy = true,
    distanceInterval = 1,
    timeInterval = 500,
    minAccuracy = 30,
    headingSamples = 5,
  } = options;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const headingSubscription = useRef<Location.LocationSubscription | null>(null);
  const headingHistory = useRef<number[]>([]);
  const lastValidLocation = useRef<LocationData | null>(null);
  const locationHistory = useRef<{lat: number, lng: number, timestamp: number}[]>([]);
  const rejectedLocationCount = useRef<number>(0);
  const consecutiveRejectionsCount = useRef<number>(0);

  // ULTRA-STRICT location validation - ZERO TOLERANCE for invalid coordinates
  const isValidLocation = (lat: number, lng: number, accuracy?: number): boolean => {
    // ABSOLUTE REJECTION CRITERIA - NO EXCEPTIONS
    
    // 1. CRITICAL: Reject ANY coordinate that is exactly 0 (the main culprit)
    if (lat === 0 || lng === 0) {
      console.warn(`🚫 REJECTED: Zero coordinate detected [${lat}, ${lng}] - NEVER ALLOWED`);
      consecutiveRejectionsCount.current++;
      return false;
    }
    
    // 2. Reject NaN, null, undefined, or infinite values
    if (!isFinite(lat) || !isFinite(lng) || lat === null || lng === null || lat === undefined || lng === undefined) {
      console.warn(`🚫 REJECTED: Invalid coordinate values [${lat}, ${lng}]`);
      consecutiveRejectionsCount.current++;
      return false;
    }
    
    // 3. Reject coordinates outside Earth's valid ranges
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      console.warn(`🚫 REJECTED: Coordinates outside valid Earth range [${lat}, ${lng}]`);
      consecutiveRejectionsCount.current++;
      return false;
    }
    
    // 4. CRITICAL: Reject coordinates that are suspiciously close to [0,0]
    const distanceFromZero = Math.sqrt(lat * lat + lng * lng);
    if (distanceFromZero < 0.1) { // Within ~11km of [0,0]
      console.warn(`🚫 REJECTED: Suspiciously close to [0,0]: distance ${distanceFromZero.toFixed(6)}`);
      consecutiveRejectionsCount.current++;
      return false;
    }
    
    // 5. Reject extremely poor accuracy (likely GPS malfunction)
    if (accuracy && accuracy > 1000) {
      console.warn(`🚫 REJECTED: Accuracy catastrophically poor: ${accuracy}m`);
      consecutiveRejectionsCount.current++;
      return false;
    }
    
    // 6. TELEPORTATION DETECTION - Reject impossible movements
    if (lastValidLocation.current) {
      const distance = calculateDistance(
        lastValidLocation.current.latitude,
        lastValidLocation.current.longitude,
        lat,
        lng
      );
      
      const timeDiff = (Date.now() - lastValidLocation.current.timestamp) / 1000;
      
      // Maximum realistic speed: 50 m/s (180 km/h) - very conservative for mobile devices
      const maxRealisticSpeed = 50;
      
      if (distance > maxRealisticSpeed * timeDiff && timeDiff > 1 && timeDiff < 60) {
        console.warn(`🚫 REJECTED: Impossible teleportation: ${distance.toFixed(0)}m in ${timeDiff.toFixed(1)}s (${(distance/timeDiff).toFixed(1)} m/s)`);
        consecutiveRejectionsCount.current++;
        return false;
      }

      // SPECIAL CHECK: Reject sudden jumps to "round" coordinates (common GPS error pattern)
      if (distance > 10000) { // More than 10km jump
        const latIsRound = Math.abs(lat - Math.round(lat)) < 0.001;
        const lngIsRound = Math.abs(lng - Math.round(lng)) < 0.001;
        
        if (latIsRound || lngIsRound) {
          console.warn(`🚫 REJECTED: Large jump to suspiciously round coordinates [${lat}, ${lng}]`);
          consecutiveRejectionsCount.current++;
          return false;
        }
      }
    }
    
    // 7. PATTERN DETECTION - Reject coordinates that follow suspicious patterns
    if (locationHistory.current.length >= 3) {
      const recent = locationHistory.current.slice(-3);
      
      // Check if GPS is "stuck" at same coordinates
      const allSame = recent.every(loc => 
        Math.abs(loc.lat - recent[0].lat) < 0.000001 && 
        Math.abs(loc.lng - recent[0].lng) < 0.000001
      );
      
      if (allSame && Math.abs(lat - recent[0].lat) < 0.000001 && Math.abs(lng - recent[0].lng) < 0.000001) {
        console.warn(`🚫 REJECTED: GPS stuck at identical coordinates`);
        consecutiveRejectionsCount.current++;
        return false;
      }
    }
    
    // 8. COORDINATE PRECISION CHECK - Reject suspiciously "perfect" coordinates
    const latStr = lat.toString();
    const lngStr = lng.toString();
    
    // Reject coordinates that are too "perfect" (often indicates default/fallback values)
    if (latStr.includes('.000000') || lngStr.includes('.000000')) {
      console.warn(`🚫 REJECTED: Suspiciously precise coordinates [${lat}, ${lng}]`);
      consecutiveRejectionsCount.current++;
      return false;
    }

    // 9. MOVEMENT DIRECTION VALIDATION - When moving, reject coordinates that don't make sense
    if (lastValidLocation.current && lastValidLocation.current.isMoving) {
      const distance = calculateDistance(
        lastValidLocation.current.latitude,
        lastValidLocation.current.longitude,
        lat,
        lng
      );
      
      // If we were moving but suddenly get a coordinate very far away, be suspicious
      if (distance > 1000 && consecutiveRejectionsCount.current === 0) {
        console.warn(`🚫 REJECTED: Suspicious jump while moving: ${distance.toFixed(0)}m`);
        consecutiveRejectionsCount.current++;
        return false;
      }
    }
    
    // If we get here, the location passed ALL validation tests
    console.log(`✅ LOCATION VALIDATED: [${lat.toFixed(6)}, ${lng.toFixed(6)}] - All checks passed`);
    consecutiveRejectionsCount.current = 0; // Reset rejection count on valid location
    
    // Add to location history for pattern analysis
    locationHistory.current.push({ lat, lng, timestamp: Date.now() });
    if (locationHistory.current.length > 10) {
      locationHistory.current.shift(); // Keep only last 10 locations
    }
    
    return true;
  };

  // Calculate distance between two points (in meters)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Determine signal strength based on accuracy and rejection patterns
  const getSignalStrength = (accuracy?: number): 'excellent' | 'good' | 'poor' | 'lost' => {
    // If we've rejected many locations consecutively, signal is definitely lost
    if (consecutiveRejectionsCount.current > 10) return 'lost';
    if (consecutiveRejectionsCount.current > 5) return 'poor';
    
    if (!accuracy) return 'lost';
    if (accuracy <= 5) return 'excellent';
    if (accuracy <= 15) return 'good';
    if (accuracy <= 50) return 'poor';
    return 'lost';
  };

  // Smooth heading with moving average
  const smoothHeading = (newHeading: number): number => {
    if (newHeading === null || newHeading === undefined || isNaN(newHeading)) {
      return lastValidLocation.current?.smoothedHeading || 0;
    }
    
    // Normalize heading to 0-360
    const normalizedHeading = ((newHeading % 360) + 360) % 360;
    
    headingHistory.current.push(normalizedHeading);
    
    // Keep only last N samples
    if (headingHistory.current.length > headingSamples) {
      headingHistory.current.shift();
    }
    
    // Calculate circular mean for angles
    let sinSum = 0;
    let cosSum = 0;
    
    headingHistory.current.forEach(heading => {
      const radians = (heading * Math.PI) / 180;
      sinSum += Math.sin(radians);
      cosSum += Math.cos(radians);
    });
    
    const meanRadians = Math.atan2(sinSum / headingHistory.current.length, cosSum / headingHistory.current.length);
    const meanDegrees = ((meanRadians * 180) / Math.PI + 360) % 360;
    
    return meanDegrees;
  };

  // Request permissions
  const requestPermissions = async () => {
    try {
      setError(null);
      
      // Request foreground location permission
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        setHasPermission(false);
        setError('Se requieren permisos de ubicación para usar esta función');
        return false;
      }

      // Request background permission for better tracking
      if (Platform.OS !== 'web') {
        try {
          await Location.requestBackgroundPermissionsAsync();
        } catch (bgError) {
          console.log('Background permission not available:', bgError);
        }
      }

      setHasPermission(true);
      return true;
    } catch (err) {
      setError(`Error al solicitar permisos: ${err}`);
      setHasPermission(false);
      return false;
    }
  };

  // Start location tracking with ULTRA-STRICT validation
  const startTracking = async () => {
    try {
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) return;
      }

      setIsTracking(true);
      setError(null);
      consecutiveRejectionsCount.current = 0;
      locationHistory.current = [];

      console.log('🛡️ Starting GPS tracking with ULTRA-STRICT anti-jump validation');

      // Get initial high-accuracy position with multiple attempts
      let initialPosition = null;
      let attempts = 0;
      const maxAttempts = 10; // More attempts for better reliability

      while (!initialPosition && attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`📍 Attempting to get initial position (attempt ${attempts}/${maxAttempts})`);
          
          const position = await Location.getCurrentPositionAsync({
            accuracy: enableHighAccuracy 
              ? Location.Accuracy.BestForNavigation 
              : Location.Accuracy.High,
            maximumAge: 500, // Very fresh data only
          });

          // ULTRA-STRICT validation of initial position
          if (isValidLocation(position.coords.latitude, position.coords.longitude, position.coords.accuracy)) {
            initialPosition = position;
            console.log(`✅ Valid initial position found: [${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}]`);
          } else {
            console.warn(`❌ Initial position rejected, retrying...`);
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        } catch (positionError) {
          console.warn(`⚠️ Error getting initial position (attempt ${attempts}):`, positionError);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      if (!initialPosition) {
        setError('No se pudo obtener una ubicación GPS válida después de múltiples intentos');
        setIsTracking(false);
        return;
      }

      // Create initial location data
      const initialHeading = initialPosition.coords.heading || 0;
      const smoothedInitialHeading = smoothHeading(initialHeading);
      const signalStrength = getSignalStrength(initialPosition.coords.accuracy);

      const initialLocationData: LocationData = {
        latitude: initialPosition.coords.latitude,
        longitude: initialPosition.coords.longitude,
        heading: initialHeading,
        smoothedHeading: smoothedInitialHeading,
        accuracy: initialPosition.coords.accuracy || undefined,
        speed: initialPosition.coords.speed || undefined,
        timestamp: initialPosition.timestamp,
        isMoving: (initialPosition.coords.speed || 0) > 0.5,
        isValid: true,
        signalStrength,
      };

      setLocation(initialLocationData);
      lastValidLocation.current = initialLocationData;
      setError(null);

      console.log(`🎯 Initial location set successfully: [${initialLocationData.latitude.toFixed(6)}, ${initialLocationData.longitude.toFixed(6)}]`);

      // Start continuous position tracking with ULTRA-STRICT filtering
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: enableHighAccuracy 
            ? Location.Accuracy.BestForNavigation 
            : Location.Accuracy.High,
          timeInterval,
          distanceInterval,
          mayShowUserSettingsDialog: true,
        },
        (newLocation) => {
          const lat = newLocation.coords.latitude;
          const lng = newLocation.coords.longitude;
          const acc = newLocation.coords.accuracy;

          console.log(`📡 GPS reading: [${lat.toFixed(6)}, ${lng.toFixed(6)}] accuracy: ${acc?.toFixed(1)}m`);

          // ULTRA-STRICT validation - REJECT EVERYTHING SUSPICIOUS
          if (!isValidLocation(lat, lng, acc)) {
            console.warn(`🚫 LOCATION REJECTED - maintaining last valid position`);
            
            // Update signal strength to indicate poor signal, but KEEP last valid location
            if (lastValidLocation.current) {
              setLocation(prev => prev ? {
                ...prev,
                signalStrength: consecutiveRejectionsCount.current > 5 ? 'lost' : 'poor',
                timestamp: Date.now(),
              } : null);
            }
            return;
          }

          // Additional accuracy filter
          if (acc && acc > minAccuracy) {
            console.log(`📊 Location accuracy too poor: ${acc}m > ${minAccuracy}m threshold`);
            consecutiveRejectionsCount.current++;
            return;
          }

          // If we get here, the location is DEFINITELY valid and safe
          console.log(`✅ LOCATION ACCEPTED: [${lat.toFixed(6)}, ${lng.toFixed(6)}]`);

          const currentHeading = newLocation.coords.heading || lastValidLocation.current?.heading || 0;
          const smoothedCurrentHeading = smoothHeading(currentHeading);
          const isMoving = (newLocation.coords.speed || 0) > 0.5;
          const signalStrength = getSignalStrength(acc);

          const locationData: LocationData = {
            latitude: lat,
            longitude: lng,
            heading: currentHeading,
            smoothedHeading: smoothedCurrentHeading,
            accuracy: acc || undefined,
            speed: newLocation.coords.speed || undefined,
            timestamp: newLocation.timestamp,
            isMoving,
            isValid: true,
            signalStrength,
          };

          setLocation(locationData);
          lastValidLocation.current = locationData;
          setError(null);
        }
      );

      // Start heading tracking for iOS (with validation)
      if (Platform.OS === 'ios') {
        try {
          headingSubscription.current = await Location.watchHeadingAsync((headingData) => {
            const compassHeading = headingData.trueHeading !== null 
              ? headingData.trueHeading 
              : headingData.magHeading;
            
            // Only update heading if we have a valid location and valid heading
            if (compassHeading !== null && !isNaN(compassHeading) && lastValidLocation.current && lastValidLocation.current.isValid) {
              const smoothedCompassHeading = smoothHeading(compassHeading);
              
              setLocation(prev => prev ? {
                ...prev,
                heading: compassHeading,
                smoothedHeading: smoothedCompassHeading,
                timestamp: Date.now(),
              } : null);
            }
          });
        } catch (headingError) {
          console.warn('Heading tracking not available:', headingError);
        }
      }

    } catch (error) {
      console.error('❌ Error starting location tracking:', error);
      setError(`Error al iniciar seguimiento: ${error}`);
      setIsTracking(false);
    }
  };

  // Stop location tracking
  const stopTracking = () => {
    console.log('🛑 Stopping GPS tracking');
    
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    if (headingSubscription.current) {
      headingSubscription.current.remove();
      headingSubscription.current = null;
    }

    setIsTracking(false);
  };

  // Recenter map to current valid location
  const recenterMap = () => {
    return lastValidLocation.current;
  };

  // Reset tracking completely
  const resetTracking = () => {
    console.log('🔄 Resetting GPS tracking system');
    
    stopTracking();
    setLocation(null);
    setError(null);
    headingHistory.current = [];
    lastValidLocation.current = null;
    locationHistory.current = [];
    consecutiveRejectionsCount.current = 0;
  };

  // Initialize permissions check
  useEffect(() => {
    requestPermissions();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    location,
    hasPermission,
    isTracking,
    error,
    accuracy: location?.accuracy || null,
    lastUpdate: location?.timestamp || null,
    startTracking,
    stopTracking,
    resetTracking,
    recenterMap,
    requestPermissions,
  };
}