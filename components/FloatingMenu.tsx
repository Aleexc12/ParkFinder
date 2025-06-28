import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { 
  X, 
  MapPin, 
  Settings, 
  User, 
  Wallet, 
  Target, 
  Activity, 
  Wifi, 
  WifiOff, 
  Clock, 
  Bell, 
  Shield, 
  CircleHelp as HelpCircle, 
  LogOut, 
  ChevronRight, 
  Star, 
  Plus, 
  CreditCard as Edit 
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

interface FloatingMenuProps {
  onClose: () => void;
  location: LocationData | null;
  isTracking: boolean;
  accuracy: number | null;
}

export function FloatingMenu({ onClose, location, isTracking, accuracy }: FloatingMenuProps) {
  // User data (mock data for now)
  const userData = {
    name: 'Carlos M.',
    email: 'carlos.m@email.com',
    memberSince: '2024',
    walletBalance: 0,
    totalTrips: 47,
    favoriteSpots: 12,
  };

  // Get signal strength icon and text
  const getSignalIcon = () => {
    if (!location) return <WifiOff size={12} color="#EF4444" />;
    
    switch (location.signalStrength) {
      case 'excellent':
      case 'good':
        return <Wifi size={12} color="#10B981" />;
      case 'poor':
        return <Wifi size={12} color="#F59E0B" />;
      case 'lost':
        return <WifiOff size={12} color="#EF4444" />;
      default:
        return <WifiOff size={12} color="#9CA3AF" />;
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MapPin size={20} color="#3B82F6" />
          <Text style={styles.headerTitle}>ParkingFinder</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <TouchableOpacity style={styles.userSection} activeOpacity={0.7}>
          <View style={styles.carAvatarContainer}>
            <Text style={styles.carEmoji}>🏎️</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <View style={styles.memberBadge}>
              <User size={10} color="#3B82F6" />
              <Text style={styles.memberText}>Miembro desde {userData.memberSince}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Edit size={16} color="#6B7280" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Wallet Section */}
        <View style={styles.walletSection}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIconContainer}>
              <Wallet size={18} color="#10B981" />
            </View>
            <Text style={styles.walletTitle}>Billetera</Text>
          </View>
          
          <View style={styles.walletBalance}>
            <Text style={styles.balanceLabel}>Saldo disponible</Text>
            <Text style={styles.balanceAmount}>${userData.walletBalance.toFixed(2)}</Text>
          </View>
          
          <TouchableOpacity style={styles.addFundsButton}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addFundsText}>Agregar fondos</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Star size={16} color="#F59E0B" />
            <Text style={styles.statNumber}>{userData.favoriteSpots}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Clock size={16} color="#8B5CF6" />
            <Text style={styles.statNumber}>{userData.totalTrips}</Text>
            <Text style={styles.statLabel}>Viajes</Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Bell size={18} color="#6B7280" />
            </View>
            <Text style={styles.menuText}>Notificaciones</Text>
            <ChevronRight size={16} color="#D1D5DB" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Shield size={18} color="#6B7280" />
            </View>
            <Text style={styles.menuText}>Privacidad y seguridad</Text>
            <ChevronRight size={16} color="#D1D5DB" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Settings size={18} color="#6B7280" />
            </View>
            <Text style={styles.menuText}>Configuración</Text>
            <ChevronRight size={16} color="#D1D5DB" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <HelpCircle size={18} color="#6B7280" />
            </View>
            <Text style={styles.menuText}>Ayuda y soporte</Text>
            <ChevronRight size={16} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* GPS Status */}
        <View style={styles.gpsSection}>
          <Text style={styles.gpsSectionTitle}>Estado del GPS</Text>
          
          <View style={styles.gpsStatus}>
            <View style={styles.gpsRow}>
              {getSignalIcon()}
              <Text style={styles.gpsLabel}>Señal: {getSignalText()}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: isTracking ? '#10B981' : '#EF4444' }
              ]}>
                <Text style={styles.statusText}>
                  {isTracking ? 'ACTIVO' : 'INACTIVO'}
                </Text>
              </View>
            </View>
            
            {location && (
              <>
                <View style={styles.gpsRow}>
                  <Target size={12} color="#6B7280" />
                  <Text style={styles.gpsLabel}>
                    Precisión: ±{accuracy?.toFixed(0) || 'N/A'}m
                  </Text>
                </View>

                {location.isMoving && location.speed && location.speed > 0.5 && (
                  <View style={styles.gpsRow}>
                    <Activity size={12} color="#3B82F6" />
                    <Text style={styles.gpsLabel}>
                      Velocidad: {(location.speed * 3.6).toFixed(1)} km/h
                    </Text>
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

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 ParkingFinder • v1.0.0 • {Platform.OS === 'web' ? 'Web' : Platform.OS}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    maxHeight: 500,
  },
  
  // User Section
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  carAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  carEmoji: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  memberText: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
  },

  // Wallet Section
  walletSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
  },
  walletBalance: {
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#065F46',
  },
  addFundsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
  },
  addFundsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },

  // Menu Section
  menuSection: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },

  // GPS Section
  gpsSection: {
    marginBottom: 16,
  },
  gpsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  gpsStatus: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  gpsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  coordinatesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  coordinatesLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  coordinatesText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#374151',
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },
  logoutText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 8,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  footerText: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});