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
import MapView, { Marker, Region } from 'react-native-maps';
import { NativeUserLocationMarker } from '@/components/NativeUserLocationMarker';
import { LocationPermissionScreen } from '@/components/LocationPermissionScreen';
import { SideMenu } from '@/components/SideMenu';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { 
  MapPin, 
  Navigation, 
  Target, 
  Map, 
  Satellite, 
  Menu,
  Search,
  Mic
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

  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new RNAnimated.Value(-300)).current;

  // Auto-start tracking when permissions are granted
  useEffect(() => {
    if (hasPermission === true && !isTracking) {
      startTracking();
    }
  }, [hasPermission]);

  // Menu animation
  useEffect(() => {
    RNAnimated.timing(slideAnim, {
      toValue: isMenuOpen ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen]);

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

  const region: Region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={false} // We use our custom marker
        showsMyLocationButton={false}
        showsCompass={false}
        mapType={mapType}
        
        // DESHABILITAR COMPLETAMENTE TODOS LOS MOVIMIENTOS
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled={false}  // NO SCROLL
        zoomEnabled={false}    // NO ZOOM
        panEnabled={false}     // NO PAN
        
        followsUserLocation={false}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={true}
        loadingEnabled={true}
        moveOnMarkerPress={false}
        
        // DESHABILITAR GESTOS COMPLETAMENTE
        onRegionChange={() => {}} // Vacío para evitar cualquier cambio
        onRegionChangeComplete={() => {}} // Vacío para evitar cualquier cambio
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
        
        {/* Custom user location marker - always show even if signal is lost */}
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
          onPress={() => setMapType(prev => prev === 'standard' ? 'satellite' : 'standard')}
        >
          {mapType === 'standard' ? (
            <Satellite size={20} color="#374151" />
          ) : (
            <Map size={20} color="#374151" />
          )}
        </TouchableOpacity>

        {/* Recenter button */}
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={recenterMap}
        >
          <Target size={20} color="#374151" />
        </TouchableOpacity>
      </View>

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

      {/* Side Menu */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
        >
          <RNAnimated.View 
            style={[
              styles.menuContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <SideMenu 
                onClose={() => setIsMenuOpen(false)}
                location={location}
                isTracking={isTracking}
                accuracy={accuracy}
              />
            </TouchableOpacity>
          </RNAnimated.View>
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: 300,
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});