import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DirectionalArrowProps {
  distance?: number;
  bearing: number; // Angle from user to parking (0-360 degrees)
  spaces: number;
  parkingName?: string;
}

export function DirectionalArrow({ distance, bearing, spaces, parkingName }: DirectionalArrowProps) {
  // Calculate arrow rotation to point toward parking
  const arrowRotation = bearing;
  
  // Determine color based on available spaces
  const getSpaceColor = () => {
    if (spaces >= 40) return '#10B981'; // Green - many spaces
    if (spaces >= 20) return '#22C55E'; // Light green - good spaces
    if (spaces >= 10) return '#F59E0B'; // Yellow - moderate spaces
    if (spaces >= 5) return '#EF4444';  // Red - few spaces
    return '#9CA3AF'; // Gray - very few spaces
  };

  const spaceColor = getSpaceColor();

  // Format distance for display
  const formatDistance = () => {
    if (!distance) return '';
    if (distance < 1000) return `${Math.round(distance)}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  return (
    <View style={styles.container}>
      {/* Teardrop-shaped arrow pointing to parking */}
      <View 
        style={[
          styles.teardropArrow, 
          { 
            transform: [{ rotate: `${arrowRotation}deg` }],
            backgroundColor: spaceColor,
          }
        ]} 
      >
        {/* Arrow point */}
        <View 
          style={[
            styles.arrowPoint,
            { borderBottomColor: spaceColor }
          ]} 
        />
        
        {/* Circular base with spaces number */}
        <View style={[styles.circularBase, { backgroundColor: spaceColor }]}>
          <Text style={styles.spacesText}>
            {spaces}
          </Text>
        </View>
      </View>
      
      {/* Distance label below arrow */}
      {distance && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>
            {formatDistance()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 50,
  },
  teardropArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  arrowPoint: {
    position: 'absolute',
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  circularBase: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  spacesText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  distanceContainer: {
    marginTop: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});