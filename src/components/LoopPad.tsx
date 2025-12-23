import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
  Animated,
} from 'react-native';
import { COLORS, APP_CONFIG } from '../config/constants';
import { PadState } from '../types';
import { audioService } from '../services/audio';

interface LoopPadProps {
  pads: PadState[];
  onPadPress: (index: number) => void;
  onPadLongPress?: (index: number) => void;
}

const { width } = Dimensions.get('window');
const PAD_SIZE = (width - 50) / 4;

const LoopPad: React.FC<LoopPadProps> = ({ pads, onPadPress, onPadLongPress }) => {
  const [animatedValues] = useState(
    Array(APP_CONFIG.LOOP_PAD_GRID_SIZE)
      .fill(0)
      .map(() => new Animated.Value(1))
  );

  const handlePadPress = async (index: number) => {
    const pad = pads[index];
    
    // Animate pad press
    Animated.sequence([
      Animated.timing(animatedValues[index], {
        toValue: 0.85,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger sound if assigned
    if (pad.soundId) {
      await audioService.playSound(pad.soundId);
    }

    onPadPress(index);
  };

  const renderPad = (index: number) => {
    const pad = pads[index];
    const scale = animatedValues[index];

    return (
      <Animated.View
        key={index}
        style={[
          styles.padWrapper,
          { transform: [{ scale }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.pad,
            {
              backgroundColor: pad.soundId ? pad.color : COLORS.card,
              opacity: pad.isPlaying ? 1 : 0.7,
            },
          ]}
          onPress={() => handlePadPress(index)}
          onLongPress={() => onPadLongPress?.(index)}
          activeOpacity={0.8}
        >
          <Text style={styles.padNumber}>{index + 1}</Text>
          {pad.isPlaying && (
            <View style={styles.playingIndicator}>
              <View style={styles.playingDot} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {Array(APP_CONFIG.LOOP_PAD_GRID_SIZE)
          .fill(0)
          .map((_, index) => renderPad(index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width - 20,
    justifyContent: 'center',
  },
  padWrapper: {
    margin: 5,
  },
  pad: {
    width: PAD_SIZE - 10,
    height: PAD_SIZE - 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  padNumber: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  playingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  playingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
});

export default LoopPad;
