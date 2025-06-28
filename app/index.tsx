import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
  Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region, Camera } from 'react-native-maps';
import { NativeUserLocationMarker } from '@/components/NativeUserLocationMarker';
import { LocationPermissionScreen } from '@/components/LocationPermissionScreen';
import { FloatingMenu } from '@/components/FloatingMenu';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { 
  MapPin, 
  Navigation, 
  Target, 
  Map, 
  Satellite, 
  Menu,
  Search,
  Mic,
  Box,
  Layers3,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Reduced parking data - 4 strategic locations in China
const chinaParkingData = [
  // Beijing (2 locations)
  { id: 'bj1', latitude: 39.9042, longitude: 116.4074, name: 'Forbidden City', spaces: 45, city: 'Beijing' },
  { id: 'bj2', latitude: 39.9163, longitude: 116.3972, name: 'Beihai Park', spaces: 28, city: 'Beijing' },
  
  // Shanghai (1 location)
  { id: 'sh1', latitude: 31.2304, longitude: 121.4737, name: 'The Bund', spaces: 35, city: 'Shanghai' },
  
  // Guangzhou (1 location)
  { id: 'gz1', latitude: 23.1291, longitude: 113.2644, name: 'Canton Tower', spaces: 52, city: 'Guangzhou' },
];

export default function MapScreen() {
  const {
    location,
    hasPermission,
    isTracking,
    error,
    accuracy,
    lastUpdate,
    startTracking,
    stopTracking,
    recenterMap,
    requestPermissions,
  } = useLocationTracking({
    enableHighAccuracy: true,
    distanceInterval: 1,
    timeInterval: 500,
    minAccuracy: 30,
    headingSamples: 5,
  });

  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [is3DMode, setIs3DMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [currentCamera, setCurrentCamera] = useState<Camera | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  
  const mapRef = useRef<MapView>(null);
  const lastLocationUpdate = useRef<number>(0);
  const isAnimatingToUser = useRef<boolean>(false);

  // Auto-start tracking when permissions are granted
  useEffect(() => {
    if (hasPermission === true && !isTracking) {
      startTracking();
    }
  }, [hasPermission]);

  // Update region/camera when location changes and following user
  useEffect(() => {
    if (location && location.isValid && isFollowingUser && !userHasInteracted) {
      const now = Date.now();
      
      // Throttle location updates to avoid excessive animations
      if (now - lastLocationUpdate.current < 1000) return;
      lastLocationUpdate.current = now;

      if (is3DMode) {
        // 3D Camera mode
        const newCamera: Camera = {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          pitch: 60, // 3D tilt angle (0-90 degrees)
          heading: location.smoothedHeading, // Follow user's heading
          altitude: 500, // Height above ground
          zoom: 17, // Zoom level for 3D view
        };
        
        setCurrentCamera(newCamera);
        
        if (!isAnimatingToUser.current) {
          isAnimatingToUser.current = true;
          mapRef.current?.animateCamera(newCamera, { duration: 1000 });
          
          setTimeout(() => {
            isAnimatingToUser.current = false;
          }, 1200);
        }
      } else {
        // 2D Region mode
        const newRegion: Region = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: currentRegion?.latitudeDelta || 0.008,
          longitudeDelta: currentRegion?.longitudeDelta || 0.008,
        };
        
        setCurrentRegion(newRegion);
        
        if (!isAnimatingToUser.current) {
          isAnimatingToUser.current = true;
          mapRef.current?.animateToRegion(newRegion, 800);
          
          setTimeout(() => {
            isAnimatingToUser.current = false;
          }, 1000);
        }
      }
    }
  }, [location, isFollowingUser, userHasInteracted, is3DMode]);

  // Handle when user starts interacting with the map
  const handleUserInteractionStart = () => {
    if (isFollowingUser) {
      console.log('🎯 User started interacting - stopping auto-follow');
      setUserHasInteracted(true);
      setIsFollowingUser(false);
    }
  };

  // Handle map region changes (when user manually moves the map)
  const handleRegionChange = (region: Region) => {
    if (isAnimatingToUser.current) return;
    setCurrentRegion(region);
  };

  // Handle camera changes (for 3D mode)
  const handleCameraChange = (camera: Camera) => {
    if (isAnimatingToUser.current) return;
    setCurrentCamera(camera);
  };

  // Handle region change complete
  const handleRegionChangeComplete = (region: Region) => {
    if (isAnimatingToUser.current) return;
    
    setCurrentRegion(region);
    
    // If user manually moved the map significantly, stop following
    if (isFollowingUser && location && location.isValid) {
      const distance = Math.sqrt(
        Math.pow(region.latitude - location.latitude, 2) + 
        Math.pow(region.longitude - location.longitude, 2)
      );
      
      if (distance > 0.0005) {
        console.log('🎯 User moved map significantly - stopping auto-follow');
        setIsFollowingUser(false);
        setUserHasInteracted(true);
      }
    }
  };

  // Toggle between 2D and 3D mode
  const toggle3DMode = () => {
    const new3DMode = !is3DMode;
    setIs3DMode(new3DMode);
    
    if (location && location.isValid) {
      if (new3DMode) {
        // Switch to 3D
        const camera: Camera = {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          pitch: 60,
          heading: location.smoothedHeading,
          altitude: 500,
          zoom: 17,
        };
        
        setCurrentCamera(camera);
        mapRef.current?.animateCamera(camera, { duration: 1500 });
      } else {
        // Switch to 2D
        const region: Region = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        };
        
        setCurrentRegion(region);
        mapRef.current?.animateToRegion(region, 1000);
      }
    }
  };

  // Cycle through map types
  const cycleMapType = () => {
    const types: Array<'standard' | 'satellite' | 'hybrid'> = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  // Reset camera rotation (for 3D mode)
  const resetCameraRotation = () => {
    if (location && location.isValid) {
      if (is3DMode) {
        const camera: Camera = {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          pitch: 0, // Reset to top-down view
          heading: 0, // Reset rotation
          altitude: 500,
          zoom: currentCamera?.zoom || 17,
        };
        
        setCurrentCamera(camera);
        mapRef.current?.animateCamera(camera, { duration: 1000 });
      }
    }
  };

  // Zoom in
  const zoomIn = () => {
    if (is3DMode && currentCamera) {
      const newCamera: Camera = {
        ...currentCamera,
        zoom: Math.min((currentCamera.zoom || 15) + 1, 20),
      };
      setCurrentCamera(newCamera);
      mapRef.current?.animateCamera(newCamera, { duration: 300 });
    } else if (currentRegion) {
      const newRegion: Region = {
        ...currentRegion,
        latitudeDelta: currentRegion.latitudeDelta * 0.5,
        longitudeDelta: currentRegion.longitudeDelta * 0.5,
      };
      setCurrentRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 300);
    }
  };

  // Zoom out
  const zoomOut = () => {
    if (is3DMode && currentCamera) {
      const newCamera: Camera = {
        ...currentCamera,
        zoom: Math.max((currentCamera.zoom || 15) - 1, 3),
      };
      setCurrentCamera(newCamera);
      mapRef.current?.animateCamera(newCamera, { duration: 300 });
    } else if (currentRegion) {
      const newRegion: Region = {
        ...currentRegion,
        latitudeDelta: Math.min(currentRegion.latitudeDelta * 2, 0.5),
        longitudeDelta: Math.min(currentRegion.longitudeDelta * 2, 0.5),
      };
      setCurrentRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 300);
    }
  };

  // Recenter to user location
  const handleRecenter = () => {
    if (location && location.isValid) {
      console.log('🎯 Recentering to user location');
      
      if (is3DMode) {
        const newCamera: Camera = {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          pitch: 60,
          heading: location.smoothedHeading,
          altitude: 500,
          zoom: 17,
        };
        
        setCurrentCamera(newCamera);
        mapRef.current?.animateCamera(newCamera, { duration: 1500 });
      } else {
        const newRegion: Region = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        };
        
        setCurrentRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      }
      
      setIsFollowingUser(true);
      setUserHasInteracted(false);
      
      isAnimatingToUser.current = true;
      setTimeout(() => {
        isAnimatingToUser.current = false;
      }, 1200);
    }
  };

  // Get map type icon
  const getMapTypeIcon = () => {
    switch (mapType) {
      case 'standard':
        return <Map size={20} color="#374151" />;
      case 'satellite':
        return <Satellite size={20} color="#374151" />;
      case 'hybrid':
        return <Layers3 size={20} color="#374151" />;
      default:
        return <Map size={20} color="#374151" />;
    }
  };

  // Permission check
  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Navigation size={48} color="#3B82F6" />
        <Text style={styles.loadingText}>Verificando permisos...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return <LocationPermissionScreen onRetry={requestPermissions} />;
  }

  // Error state (only show if no location at all)
  if (error && !location) {
    return (
      <View style={styles.loadingContainer}>
        <MapPin size={48} color="#EF4444" />
        <Text style={styles.loadingText}>Error de ubicación</Text>
        <Text style={styles.loadingSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={startTracking}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state (only if no location at all)
  if (!location || !location.isValid) {
    return (
      <View style={styles.loadingContainer}>
        <MapPin size={48} color="#3B82F6" />
        <Text style={styles.loadingText}>
          {error || 'Obteniendo ubicación GPS...'}
        </Text>
        <Text style={styles.loadingSubtext}>
          {Platform.OS === 'web' 
            ? 'Esta app está diseñada para dispositivos móviles con GPS'
            : 'Asegúrate de que el GPS esté activado'
          }
        </Text>
        {!isTracking && (
          <TouchableOpacity style={styles.retryButton} onPress={startTracking}>
            <Text style={styles.retryButtonText}>Iniciar seguimiento</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const initialRegion: Region = currentRegion || {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  };

  const initialCamera: Camera = currentCamera || {
    center: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    pitch: is3DMode ? 60 : 0,
    heading: is3DMode ? location.smoothedHeading : 0,
    altitude: 500,
    zoom: 17,
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={!is3DMode ? initialRegion : undefined}
        initialCamera={is3DMode ? initialCamera : undefined}
        region={!is3DMode && isFollowingUser && !userHasInteracted ? currentRegion : undefined}
        camera={is3DMode && isFollowingUser && !userHasInteracted ? currentCamera : undefined}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        mapType={mapType}
        
        // ENABLE ALL MAP NAVIGATION WITH 3D SUPPORT
        pitchEnabled={true}        // Allow 3D tilt
        rotateEnabled={true}       // Allow rotation
        scrollEnabled={true}       // Allow panning/scrolling
        zoomEnabled={true}         // Allow pinch to zoom
        panEnabled={true}          // Allow dragging
        
        followsUserLocation={false}
        showsBuildings={true}      // Essential for 3D view
        showsTraffic={false}
        showsIndoors={true}
        loadingEnabled={true}
        moveOnMarkerPress={false}
        
        // Handle user interactions
        onTouchStart={handleUserInteractionStart}
        onPanDrag={handleUserInteractionStart}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        onCameraChange={handleCameraChange}
        
        // Zoom controls
        minZoomLevel={3}           // World view
        maxZoomLevel={20}          // Very close street level
        
        // Performance optimizations
        loadingBackgroundColor="#F9FAFB"
        loadingIndicatorColor="#3B82F6"
      >
        {/* Parking markers at their actual locations */}
        {chinaParkingData.map((parking) => (
          <Marker
            key={parking.id}
            coordinate={{
              latitude: parking.latitude,
              longitude: parking.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={1500}
          >
            <View style={styles.parkingMarker}>
              <Text style={styles.parkingText}>P</Text>
              <Text style={styles.parkingSpaces}>{parking.spaces}</Text>
            </View>
          </Marker>
        ))}
        
        {/* Custom user location marker */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
          flat={true}
          zIndex={2000}
        >
          <NativeUserLocationMarker location={location} />
        </Marker>
      </MapView>

      {/* Menu Button - Top Left */}
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => setIsMenuOpen(true)}
      >
        <Menu size={24} color="#374151" />
      </TouchableOpacity>

      {/* Top Right Controls */}
      <View style={styles.topRightControls}>
        {/* Map type toggle */}
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={cycleMapType}
        >
          {getMapTypeIcon()}
        </TouchableOpacity>

        {/* 3D Mode toggle */}
        <TouchableOpacity 
          style={[
            styles.controlButton,
            { backgroundColor: is3DMode ? '#3B82F6' : '#FFFFFF' }
          ]}
          onPress={toggle3DMode}
        >
          <Box 
            size={20} 
            color={is3DMode ? "#FFFFFF" : "#374151"} 
          />
        </TouchableOpacity>

        {/* Reset rotation (only in 3D mode) */}
        {is3DMode && (
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={resetCameraRotation}
          >
            <RotateCcw size={20} color="#374151" />
          </TouchableOpacity>
        )}

        {/* Recenter button */}
        <TouchableOpacity 
          style={[
            styles.controlButton,
            { backgroundColor: isFollowingUser && !userHasInteracted ? '#3B82F6' : '#FFFFFF' }
          ]}
          onPress={handleRecenter}
        >
          <Target 
            size={20} 
            color={isFollowingUser && !userHasInteracted ? "#FFFFFF" : "#374151"} 
          />
        </TouchableOpacity>
      </View>

      {/* Zoom Controls - Right Side */}
      <View style={styles.zoomControls}>
        <TouchableOpacity 
          style={styles.zoomButton}
          onPress={zoomIn}
        >
          <ZoomIn size={20} color="#374151" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.zoomButton, { marginTop: 8 }]}
          onPress={zoomOut}
        >
          <ZoomOut size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* 3D Mode Indicator */}
      {is3DMode && (
        <View style={styles.modeIndicator}>
          <Box size={16} color="#3B82F6" />
          <Text style={styles.modeText}>Vista 3D</Text>
        </View>
      )}

      {/* Search Bar - Bottom */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lugar o dirección"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.micButton}>
            <Mic size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity activeOpacity={1}>
              <FloatingMenu 
                onClose={() => setIsMenuOpen(false)}
                location={location}
                isTracking={isTracking}
                accuracy={accuracy}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  map: {
    width: width,
    height: height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  parkingMarker: {
    width: 30,
    height: 30,
    backgroundColor: '#10B981',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  parkingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  parkingSpaces: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
    marginTop: -2,
  },
  menuButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 1000,
  },
  topRightControls: {
    position: 'absolute',
    top: 60,
    right: 20,
    gap: 12,
    zIndex: 1000,
  },
  controlButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  zoomControls: {
    position: 'absolute',
    right: 20,
    bottom: 140,
    zIndex: 1000,
  },
  zoomButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modeIndicator: {
    position: 'absolute',
    top: 120,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1000,
  },
  modeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  searchContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 0,
  },
  micButton: {
    marginLeft: 12,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
});