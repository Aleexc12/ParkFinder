import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Shield, Navigation, Target } from 'lucide-react-native';

interface LocationPermissionScreenProps {
  onRetry: () => void;
}

export function LocationPermissionScreen({ onRetry }: LocationPermissionScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MapPin size={64} color="#3B82F6" />
        </View>
        
        <Text style={styles.title}>Ubicación requerida</Text>
        
        <Text style={styles.description}>
          ParkingFinder necesita acceso a tu ubicación para funcionar correctamente.
          Esta aplicación está diseñada específicamente para dispositivos móviles con GPS.
        </Text>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Navigation size={20} color="#3B82F6" />
            <Text style={styles.featureText}>
              Seguimiento GPS en tiempo real
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Target size={20} color="#3B82F6" />
            <Text style={styles.featureText}>
              Detección precisa de orientación
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Shield size={20} color="#3B82F6" />
            <Text style={styles.featureText}>
              Datos seguros y privados
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Permitir ubicación</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          Tu ubicación solo se usa dentro de la aplicación y nunca se comparte.
          Para la mejor experiencia, usa esta app en un dispositivo iOS o Android.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#EFF6FF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featureList: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});