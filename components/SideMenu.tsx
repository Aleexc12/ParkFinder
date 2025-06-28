import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  X,
  MapPin, 
  Navigation, 
  Settings, 
  Info, 
  Target,
  Activity,
  Wifi,
  WifiOff,
  Clock,
  Zap
} from 'lucide-react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  heading: number;
  smoothedHeading: number;
  accuracy?: number;
  speed?: number;
  isMoving: boolean;
  signalStrength: 'excellent' | 'good' | 'poor' | 'lost';
  timestamp: number;
}

interface SideMenuProps {
  onClose: () => void;
  location: LocationData | null;
  isTracking: boolean;
  accuracy: number | null;
}

export function SideMenu({ onClose, location, isTracking, accuracy }: SideMenuProps) {
  const menuItems = [
    {
      id: 'tracking',
      title: 'Seguimiento GPS',
      subtitle: 'Configurar precisión y frecuencia',
      icon: Navigation,
      color: '#3B82F6',
      onPress: () => {
        // Navigate to tracking settings
        onClose();
      },
    },
    {
      id: 'favorites',
      title: 'Lugares Favoritos',
      subtitle: 'Gestionar ubicaciones guardadas',
      icon: Target,
      color: '#10B981',
      onPress: () => {
        // Navigate to favorites
        onClose();
      },
    },
    {
      id: 'history',
      title: 'Historial',
      subtitle: 'Ver rutas y ubicaciones anteriores',
      icon: Clock,
      color: '#8B5CF6',
      onPress: () => {
        // Navigate to history
        onClose();
      },
    },
    {
      id: 'settings',
      title: 'Configuración',
      subtitle: 'Ajustes de la aplicación',
      icon: Settings,
      color: '#6B7280',
      onPress: () => {
        // Navigate to settings
        onClose();
      },
    },
    {
      id: 'about',
      title: 'Acerca de',
      subtitle: 'Información y soporte',
      icon: Info,
      color: '#F59E0B',
      onPress: () => {
        // Navigate to about
        onClose();
      },
    },
  ];

  // Get signal strength icon
  const getSignalIcon = () => {
    if (!location) return <WifiOff size={16} color="#EF4444" />;
    
    switch (location.signalStrength) {
      case 'excellent':
      case 'good':
        return <Wifi size={16} color="#10B981" />;
      case 'poor':
        return <Wifi size={16} color="#F59E0B" />;
      case 'lost':
        return <WifiOff size={16} color="#EF4444" />;
      default:
        return <WifiOff size={16} color="#9CA3AF" />;
    }
  };

  const getSignalText = () => {
    if (!location) return 'Sin señal';
    
    switch (location.signalStrength) {
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Buena';
      case 'poor':
        return 'Regular';
      case 'lost':
        return 'Perdida';
      default:
        return 'Desconocida';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.appIcon}>
            <MapPin size={24} color="#3B82F6" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.appName}>ParkingFinder</Text>
            <Text style={styles.appVersion}>v1.0.0</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* GPS Status */}
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Estado GPS</Text>
        
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator}>
              {getSignalIcon()}
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Señal</Text>
              <Text style={styles.statusValue}>{getSignalText()}</Text>
            </View>
            <View style={[
              styles.trackingBadge,
              { backgroundColor: isTracking ? '#10B981' : '#EF4444' }
            ]}>
              <Text style={styles.trackingText}>
                {isTracking ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>

          {location && (
            <>
              <View style={styles.statusRow}>
                <Target size={16} color="#6B7280" />
                <View style={styles.statusInfo}>
                  <Text style={styles.statusLabel}>Precisión</Text>
                  <Text style={styles.statusValue}>
                    ±{accuracy?.toFixed(0) || 'N/A'}m
                  </Text>
                </View>
              </View>

              {location.isMoving && location.speed && location.speed > 0.5 && (
                <View style={styles.statusRow}>
                  <Activity size={16} color="#3B82F6" />
                  <View style={styles.statusInfo}>
                    <Text style={styles.statusLabel}>Velocidad</Text>
                    <Text style={styles.statusValue}>
                      {(location.speed * 3.6).toFixed(1)} km/h
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinatesLabel}>Coordenadas:</Text>
                <Text style={styles.coordinatesText}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuSection} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Menú</Text>
        
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
              <item.icon size={20} color={item.color} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <View style={styles.chevron}>
              <Text style={styles.chevronText}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.platformInfo}>
          <Zap size={16} color="#6B7280" />
          <Text style={styles.platformText}>
            {Platform.OS === 'web' ? 'Modo Web' : `${Platform.OS} ${Platform.Version}`}
          </Text>
        </View>
        <Text style={styles.footerText}>
          © 2024 ParkingFinder
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  appVersion: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  statusSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  trackingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trackingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  coordinatesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  coordinatesLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#374151',
  },
  menuSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  chevron: {
    marginLeft: 12,
  },
  chevronText: {
    fontSize: 18,
    color: '#D1D5DB',
    fontWeight: '300',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});