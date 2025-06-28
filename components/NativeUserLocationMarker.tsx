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
        withTiming(1.2, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
      opacityAnim.value = withTiming(0.6, { duration: 500 });
    } else {
      pulseAnim.value = withRepeat(
        withTiming(1.4, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
      opacityAnim.value = withTiming(1, { duration: 500 });
    }
  }, [location.signalStrength]);

  // FIXED: Smooth rotation animation using smoothed heading
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
      targetScale = 0.8;
    } else if (location.isMoving) {
      targetScale = 1.15;
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
        return '#10B981';
      case 'good':
        return '#22C55E';
      case 'poor':
        return '#F59E0B';
      case 'lost':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  }, [location.signalStrength]);

  const getCircleSize = useMemo(() => {
    if (!location.accuracy) return 32;
    const baseSize = 28;
    const maxSize = 50;
    const scaleFactor = Math.min(location.accuracy / 25, 1);
    return baseSize + (maxSize - baseSize) * scaleFactor;
  }, [location.accuracy]);

  const getCircleOpacity = useMemo(() => {
    switch (location.signalStrength) {
      case 'excellent':
        return 0.4;
      case 'good':
        return 0.35;
      case 'poor':
        return 0.25;
      case 'lost':
        return 0.15;
      default:
        return 0.2;
    }
  }, [location.signalStrength]);

  const signalColor = getSignalColor;
  const circleSize = getCircleSize;
  const circleOpacity = getCircleOpacity;

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: opacityAnim.value,
  }));

  const rotatingStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleAnim.value },
      { rotate: `${rotationAnim.value}deg` },
    ],
    opacity: opacityAnim.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: opacityAnim.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          width: circleSize, 
          height: circleSize,
        },
        containerStyle
      ]}
    >
      {/* Outer pulsing circle */}
      <Animated.View
        style={[
          styles.outerCircle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderColor: signalColor,
            backgroundColor: `${signalColor}${Math.round(circleOpacity * 255).toString(16).padStart(2, '0')}`,
          },
          pulseStyle,
        ]}
      />
      
      {/* Main rotating marker (teardrop shape) */}
      <Animated.View
        style={[
          styles.rotatingContainer,
          rotatingStyle,
        ]}
      >
        {/* Middle circle */}
        <View
          style={[
            styles.middleCircle,
            {
              backgroundColor: signalColor,
              opacity: location.signalStrength === 'lost' ? 0.6 : 0.8,
            },
          ]}
        />
        
        {/* Inner circle (main dot) */}
        <View
          style={[
            styles.innerCircle,
            {
              backgroundColor: signalColor,
            },
          ]}
        />
        
        {/* Direction arrow (teardrop point) */}
        <View
          style={[
            styles.directionArrow,
            {
              borderBottomColor: signalColor,
              opacity: location.signalStrength === 'lost' ? 0.6 : 1,
            },
          ]}
        />

        {/* Movement indicator */}
        {location.isMoving && location.signalStrength !== 'lost' && (
          <View style={[styles.movementIndicator, { backgroundColor: signalColor }]}>
            <View style={styles.movementDot} />
          </View>
        )}

        {/* Signal strength indicator */}
        {location.signalStrength === 'excellent' && (
          <View style={[styles.precisionIndicator, { backgroundColor: signalColor }]}>
            <View style={styles.precisionDot} />
          </View>
        )}

        {/* Signal lost indicator */}
        {location.signalStrength === 'lost' && (
          <View style={[styles.signalLostIndicator, { backgroundColor: signalColor }]}>
            <View style={styles.signalLostDot} />
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    position: 'absolute',
    borderWidth: 2,
  },
  rotatingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  middleCircle: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  innerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 2,
  },
  directionArrow: {
    position: 'absolute',
    top: -12,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1,
  },
  movementIndicator: {
    position: 'absolute',
    bottom: -16,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  movementDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  precisionIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  precisionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  signalLostIndicator: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  signalLostDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});