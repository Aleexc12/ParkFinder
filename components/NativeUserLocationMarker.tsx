import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

interface LocationData {
  latitude: number;
  longitude: number;
  heading: number;
  smoothedHeading: number;
  accuracy?: number;
  speed?: number;
  isMoving: boolean;
  signalStrength: 'excellent' | 'good' | 'poor' | 'lost';
}

interface NativeUserLocationMarkerProps {
  location: LocationData;
}

export function NativeUserLocationMarker({ location }: NativeUserLocationMarkerProps) {
  // Animation values
  const pulseAnim = useSharedValue(1);
  const rotationAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const opacityAnim = useSharedValue(1);

  // Pulse animation based on signal strength
  useEffect(() => {
    if (location.signalStrength === 'lost') {
      pulseAnim.value = withRepeat(
        withTiming(1.3, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
      opacityAnim.value = withTiming(0.6, { duration: 500 });
    } else {
      pulseAnim.value = withRepeat(
        withTiming(1.5, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
      opacityAnim.value = withTiming(1, { duration: 500 });
    }
  }, [location.signalStrength]);

  // Smooth rotation animation using smoothed heading
  useEffect(() => {
    const targetHeading = location.smoothedHeading;
    const currentHeading = rotationAnim.value;
    
    // Calculate shortest rotation path to avoid 359° -> 0° jumps
    let diff = targetHeading - currentHeading;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    
    const newHeading = currentHeading + diff;
    
    // Smooth spring animation for rotation
    rotationAnim.value = withSpring(newHeading, {
      damping: 15,
      stiffness: 100,
      mass: 0.8,
    });
  }, [location.smoothedHeading]);

  // Scale animation based on movement and signal strength
  useEffect(() => {
    let targetScale = 1;
    
    if (location.signalStrength === 'lost') {
      targetScale = 0.85;
    } else if (location.isMoving) {
      targetScale = 1.1;
    }
    
    scaleAnim.value = withSpring(targetScale, {
      damping: 12,
      stiffness: 150,
    });
  }, [location.isMoving, location.signalStrength]);

  // Determine colors based on signal strength
  const getSignalColor = useMemo(() => {
    switch (location.signalStrength) {
      case 'excellent':
        return '#1E88E5'; // Google Maps blue
      case 'good':
        return '#1976D2';
      case 'poor':
        return '#FB8C00';
      case 'lost':
        return '#E53935';
      default:
        return '#9E9E9E';
    }
  }, [location.signalStrength]);

  const getAccuracyCircleSize = useMemo(() => {
    if (!location.accuracy) return 40;
    const baseSize = 35;
    const maxSize = 60;
    const scaleFactor = Math.min(location.accuracy / 30, 1);
    return baseSize + (maxSize - baseSize) * scaleFactor;
  }, [location.accuracy]);

  const signalColor = getSignalColor;
  const accuracyCircleSize = getAccuracyCircleSize;

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: 0.2,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleAnim.value },
      { rotate: `${rotationAnim.value}deg` },
    ],
    opacity: opacityAnim.value,
  }));

  return (
    <View style={styles.markerContainer}>
      {/* Accuracy circle (pulsing background) */}
      <Animated.View
        style={[
          styles.accuracyCircle,
          {
            width: accuracyCircleSize,
            height: accuracyCircleSize,
            borderRadius: accuracyCircleSize / 2,
            backgroundColor: signalColor,
          },
          pulseStyle,
        ]}
      />
      
      {/* Main marker with integrated arrow (Waze/Google Maps style) */}
      <Animated.View style={[styles.markerBody, containerStyle]}>
        {/* Teardrop/chevron shape pointing forward */}
        <View style={[styles.chevronContainer, { backgroundColor: signalColor }]}>
          {/* Main circular body */}
          <View style={[styles.mainCircle, { backgroundColor: signalColor }]}>
            {/* Inner white dot */}
            <View style={styles.innerDot} />
            
            {/* Movement indicator ring */}
            {location.isMoving && location.signalStrength !== 'lost' && (
              <View style={[styles.movementRing, { borderColor: signalColor }]} />
            )}
          </View>
          
          {/* Directional chevron/arrow pointing forward */}
          <View style={[styles.directionChevron, { borderBottomColor: signalColor }]} />
        </View>

        {/* Signal quality indicator */}
        {location.signalStrength === 'excellent' && (
          <View style={[styles.qualityIndicator, { backgroundColor: signalColor }]} />
        )}
        
        {/* Signal lost warning */}
        {location.signalStrength === 'lost' && (
          <View style={[styles.warningIndicator, { backgroundColor: '#FF5722' }]} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
  },
  accuracyCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  markerBody: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 44, // Taller to accommodate the chevron
  },
  chevronContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 36,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  movementRing: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  directionChevron: {
    position: 'absolute',
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  qualityIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  warningIndicator: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});