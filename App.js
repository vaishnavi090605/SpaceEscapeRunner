import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SHIP_WIDTH = 60;
const MOVE_STEP = 30;

export default function App() {
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shipX, setShipX] = useState((SCREEN_WIDTH - SHIP_WIDTH) / 2);

  const handleStartGame = () => {
    setIsPlaying(true);
    setScore(0);
    setShipX((SCREEN_WIDTH - SHIP_WIDTH) / 2);
  };

  const moveLeft = () => {
    setShipX((prevX) => Math.max(0, prevX - MOVE_STEP));
  };

  const moveRight = () => {
    setShipX((prevX) => Math.min(SCREEN_WIDTH - SHIP_WIDTH, prevX + MOVE_STEP));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>Space Escape Runner</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleStartGame}>
        <Text style={styles.buttonText}>
          {isPlaying ? 'Restart Game' : 'Start Game'}
        </Text>
      </TouchableOpacity>

      {isPlaying && (
        <Text style={styles.statusText}>Game is running...</Text>
      )}

      {/* Spaceship, positioned absolutely so it can float above everything else */}
      <View style={[styles.shipContainer, { left: shipX }]}>
        <View style={styles.shipNose} />
        <View style={styles.shipBody} />
        <View style={styles.wingLeft} />
        <View style={styles.wingRight} />
        <View style={styles.engineGlow} />
      </View>

      {/* Movement controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlButton} onPress={moveLeft}>
          <Text style={styles.controlButtonText}>◀ Move Left</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={moveRight}>
          <Text style={styles.controlButtonText}>Move Right ▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E23',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: 1,
  },
  scoreCard: {
    backgroundColor: '#1A1F3D',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D4270',
  },
  scoreLabel: {
    color: '#8A8FBF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
  },
  scoreValue: {
    color: '#5CE1E6',
    fontSize: 48,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#5CE1E6',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
  },
  buttonText: {
    color: '#0B0E23',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#8A8FBF',
    marginTop: 30,
    fontSize: 14,
  },

  // ---- Spaceship shape ----
  shipContainer: {
    position: 'absolute',
    bottom: 110,
    width: SHIP_WIDTH,
    height: 60,
    alignItems: 'center',
  },
  shipNose: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#5CE1E6',
  },
  shipBody: {
    width: 30,
    height: 24,
    backgroundColor: '#E8ECFB',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    marginTop: -1,
  },
  wingLeft: {
    position: 'absolute',
    bottom: 6,
    left: -2,
    width: 14,
    height: 8,
    backgroundColor: '#3D4270',
    transform: [{ skewY: '25deg' }],
    borderRadius: 2,
  },
  wingRight: {
    position: 'absolute',
    bottom: 6,
    right: -2,
    width: 14,
    height: 8,
    backgroundColor: '#3D4270',
    transform: [{ skewY: '-25deg' }],
    borderRadius: 2,
  },
  engineGlow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B4A',
    marginTop: 2,
  },

  // ---- Controls ----
  controlsRow: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
  },
  controlButton: {
    backgroundColor: '#1A1F3D',
    borderWidth: 1,
    borderColor: '#3D4270',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});