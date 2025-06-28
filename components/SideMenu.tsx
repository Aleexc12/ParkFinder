import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, MapPin, Settings, User, Wallet, Target, Activity, Wifi, WifiOff, Clock, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Star, CreditCard, Gift } from 'lucide-react-native';

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
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    memberSince: '2024',
    walletBalance: 0,
    totalTrips: 47,
    favoriteSpots: 12,
  };

  const mainMenuItems = [
    {
      id: 'wallet',
      title: 'Billetera',
      subtitle: `$${userData.walletBalance.toFixed(2)} disponible`,
      icon: Wallet,
      color: '#10B981',
      badge: userData.walletBalance > 0 ? `$${userData.walletBalance}` : null,
      onPress: () => {
        console.log('Navigate to wallet');
        onClose();
      },
    },
    {
      id: 'settings',
      title: 'Configuración',
      subtitle: 'Ajustes y preferencias',
      icon: Settings,
      color: '#6B7280',
      onPress: () => {
        console.log('Navigate to settings');
        onClose();
      },
    },
    {
      id: 'favorites',
      title: 'Lugares Favoritos',
      subtitle: `${userData.favoriteSpots} lugares guardados`,
      icon: Star,
      color: '#F59E0B',
      onPress: () => {
        console.log('Navigate to favorites');
        onClose();
      },
    },
    {
      id: 'history',
      title: 'Historial',
      subtitle: `${userData.totalTrips} viajes realizados`,
      icon: Clock,
      color: '#8B5CF6',
      onPress: () => {
        console.log('Navigate to history');
        onClose();
      },
    },
  ];

  const secondaryMenuItems = [
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: Bell,
      onPress: () => {
        console.log('Navigate to notifications');
        onClose();
      },
    },
    {
      id: 'privacy',
      title: 'Privacidad y Seguridad',
      icon: Shield,
      onPress: () => {
        console.log('Navigate to privacy');
        onClose();
      },
    },
    {
      id: 'help',
      title: 'Ayuda y Soporte',
      icon: HelpCircle,
      onPress: () => {
        console.log('Navigate to help');
        onClose();
      },
    },
  ];

  // Get signal strength icon and text
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
      {/* Header with User Profile */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.userProfile} activeOpacity={0.7}>
          <Image source={{ uri: userData.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <View style={styles.memberBadge}>
              <User size={12} color="#3B82F6" />
              <Text style={styles.memberText}>Miembro desde {userData.memberSince}</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Wallet Balance Highlight */}
      <View style={styles.walletHighlight}>
        <View style={styles.walletIcon}>
          <Wallet size={24} color="#10B981" />
        </View>
        <View style={styles.walletInfo}>
          <Text style={styles.walletLabel}>Saldo disponible</Text>
          <Text style={styles.walletAmount}>${userData.walletBalance.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.addFundsButton}>
          <Text style={styles.addFundsText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* GPS Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <MapPin size={18} color="#3B82F6" />
          <Text style={styles.statusTitle}>Estado GPS</Text>
          <View style={[
            styles.trackingBadge,
            { backgroundColor: isTracking ? '#10B981' : '#EF4444' }
          ]}>
            <Text style={styles.trackingText}>
              {isTracking ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>

        <View style={styles.statusDetails}>
          <View style={styles.statusRow}>
            {getSignalIcon()}
            <Text style={styles.statusLabel}>Señal: {getSignalText()}</Text>
          </View>
          
          {location && (
            <View style={styles.statusRow}>
              <Target size={14} color="#6B7280" />
              <Text style={styles.statusLabel}>
                Precisión: ±{accuracy?.toFixed(0) || 'N/A'}m
              </Text>
            </View>
          )}

          {location && location.isMoving && location.speed && location.speed > 0.5 && (
            <View style={styles.statusRow}>
              <Activity size={14} color="#3B82F6" />
              <Text style={styles.statusLabel}>
                {(location.speed * 3.6).toFixed(1)} km/h
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Main Menu */}
      <ScrollView style={styles.menuSection} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Menú Principal</Text>
        
        {mainMenuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
              <item.icon size={22} color={item.color} />
            </View>
            <View style={styles.menuContent}>
              <View style={styles.menuTitleRow}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                {item.badge && (
                  <View style={[styles.badge, { backgroundColor: item.color }]}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <ChevronRight size={18} color="#D1D5DB" />
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Más opciones</Text>
        
        {secondaryMenuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.secondaryMenuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <item.icon size={20} color="#6B7280" />
            <Text style={styles.secondaryMenuTitle}>{item.title}</Text>
            <ChevronRight size={16} color="#D1D5DB" />
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.appInfo}>
          <MapPin size={16} color="#3B82F6" />
          <Text style={styles.appName}>ParkingFinder</Text>
          <Text style={styles.appVersion}>v1.0.0</Text>
        </View>
        <Text style={styles.footerText}>
          © 2024 ParkingFinder • {Platform.OS === 'web' ? 'Web' : Platform.OS}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  memberText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 4,
  },
  walletHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  walletIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#DCFCE7',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 2,
  },
  walletAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#065F46',
  },
  addFundsButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addFundsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
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
  statusDetails: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  menuSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  secondaryMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  secondaryMenuTitle: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 16,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
    marginRight: 8,
  },
  appVersion: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});