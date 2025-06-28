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

interface SideMenuProps {
  onClose: () => void;
  location: LocationData | null;
  isTracking: boolean;
  accuracy: number | null;
}

export function SideMenu({ onClose, location, isTracking, accuracy }: SideMenuProps) {
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
    if (!location) return <WifiOff size={10} color="#EF4444" />;
    
    switch (location.signalStrength) {
      case 'excellent':
      case 'good':
        return <Wifi size={10} color="#10B981" />;
      case 'poor':
        return <Wifi size={10} color="#F59E0B" />;
      case 'lost':
        return <WifiOff size={10} color="#EF4444" />;
      default:
        return <WifiOff size={10} color="#9CA3AF" />;
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
      {/* Header with Close Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <TouchableOpacity style={styles.userSection} activeOpacity={0.7}>
          <View style={styles.carAvatarContainer}>
            {/* Lightning McQueen style car emoji/icon */}
            <Text style={styles.carEmoji}>🏎️</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <View style={styles.memberBadge}>
              <User size={8} color="#3B82F6" />
              <Text style={styles.memberText}>Desde {userData.memberSince}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Edit size={12} color="#6B7280" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Wallet Section */}
        <View style={styles.walletSection}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIconContainer}>
              <Wallet size={14} color="#10B981" />
            </View>
            <Text style={styles.walletTitle}>Billetera</Text>
          </View>
          
          <View style={styles.walletBalance}>
            <Text style={styles.balanceLabel}>Saldo</Text>
            <Text style={styles.balanceAmount}>${userData.walletBalance.toFixed(2)}</Text>
          </View>
          
          <TouchableOpacity style={styles.addFundsButton}>
            <Plus size={12} color="#FFFFFF" />
            <Text style={styles.addFundsText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <Settings size={14} color="#6B7280" />
            <Text style={styles.sectionTitle}>Configuración</Text>
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <Bell size={14} color="#6B7280" />
            <Text style={styles.settingText}>Notificaciones</Text>
            <ChevronRight size={12} color="#D1D5DB" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Shield size={14} color="#6B7280" />
            <Text style={styles.settingText}>Privacidad</Text>
            <ChevronRight size={12} color="#D1D5DB" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Star size={14} color="#F59E0B" />
            <Text style={styles.settingText}>Favoritos</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{userData.favoriteSpots}</Text>
            </View>
            <ChevronRight size={12} color="#D1D5DB" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Clock size={14} color="#8B5CF6" />
            <Text style={styles.settingText}>Historial</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{userData.totalTrips}</Text>
            </View>
            <ChevronRight size={12} color="#D1D5DB" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <HelpCircle size={14} color="#6B7280" />
            <Text style={styles.settingText}>Ayuda</Text>
            <ChevronRight size={12} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* GPS Status */}
        <View style={styles.gpsSection}>
          <Text style={styles.gpsSectionTitle}>Estado GPS</Text>
          
          <View style={styles.gpsStatus}>
            <View style={styles.gpsRow}>
              {getSignalIcon()}
              <Text style={styles.gpsLabel}>Señal: {getSignalText()}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: isTracking ? '#10B981' : '#EF4444' }
              ]}>
                <Text style={styles.statusText}>
                  {isTracking ? 'ON' : 'OFF'}
                </Text>
              </View>
            </View>
            
            {location && (
              <>
                <View style={styles.gpsRow}>
                  <Target size={10} color="#6B7280" />
                  <Text style={styles.gpsLabel}>
                    ±{accuracy?.toFixed(0) || 'N/A'}m
                  </Text>
                </View>

                {location.isMoving && location.speed && location.speed > 0.5 && (
                  <View style={styles.gpsRow}>
                    <Activity size={10} color="#3B82F6" />
                    <Text style={styles.gpsLabel}>
                      {(location.speed * 3.6).toFixed(1)} km/h
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
          <LogOut size={16} color="#EF4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.appInfo}>
          <MapPin size={12} color="#3B82F6" />
          <Text style={styles.appName}>ParkingFinder</Text>
          <Text style={styles.appVersion}>v1.0.0</Text>
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
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  
  // User Section
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
  },
  carAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  carEmoji: {
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 3,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  memberText: {
    fontSize: 8,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 2,
  },
  editButton: {
    padding: 4,
  },

  // Wallet Section
  walletSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletIconContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  walletTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065F46',
  },
  walletBalance: {
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 9,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#065F46',
  },
  addFundsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
  },
  addFundsText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Settings Section
  settingsSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 10,
    flex: 1,
  },
  badge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 8,
    color: '#374151',
    fontWeight: '600',
  },

  // GPS Section
  gpsSection: {
    marginBottom: 16,
  },
  gpsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  gpsStatus: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gpsLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 10,
  },

  // Footer
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  appName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
    marginRight: 4,
  },
  appVersion: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});