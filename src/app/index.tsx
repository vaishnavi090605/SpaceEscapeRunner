import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGH_SCORE_KEY = 'SPACE_ESCAPE_HIGH_SCORE';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const SHIP_WIDTH = 60;
const SHIP_HEIGHT = 60;
const SHIP_BOTTOM_OFFSET = 110; // how far the ship sits from the bottom of the screen
const MOVE_STEP = 30;

const ASTEROID_SIZE = 40;
const FALL_SPEED = 10;    // pixels the asteroid moves per tick
const TICK_INTERVAL = 50; // milliseconds between each game loop update

// Generates a random x position for a new asteroid, keeping it fully on-screen
function getRandomAsteroidX() {
  return Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE);
}

// Checks if the ship's box and the asteroid's box overlap (AABB collision)
function checkCollision(shipXPos, asteroidXPos, asteroidYPos) {
  const shipLeft = shipXPos;
  const shipRight = shipXPos + SHIP_WIDTH;
  const shipTop = SCREEN_HEIGHT - SHIP_BOTTOM_OFFSET - SHIP_HEIGHT;
  const shipBottom = SCREEN_HEIGHT - SHIP_BOTTOM_OFFSET;

  const asteroidLeft = asteroidXPos;
  const asteroidRight = asteroidXPos + ASTEROID_SIZE;
  const asteroidTop = asteroidYPos;
  const asteroidBottom = asteroidYPos + ASTEROID_SIZE;

  const horizontalOverlap = shipLeft < asteroidRight && shipRight > asteroidLeft;
  const verticalOverlap = shipTop < asteroidBottom && shipBottom > asteroidTop;

  return horizontalOverlap && verticalOverlap;
}

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shipX, setShipX] = useState((SCREEN_WIDTH - SHIP_WIDTH) / 2);
  const [asteroid, setAsteroid] = useState({ x: getRandomAsteroidX(), y: -ASTEROID_SIZE });

  // Load the saved high score once, when the app first starts
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const savedValue = await AsyncStorage.getItem(HIGH_SCORE_KEY);
        if (savedValue !== null) {
          setHighScore(parseInt(savedValue, 10));
        }
      } catch (error) {
        console.log('Failed to load high score:', error);
      }
    };
    loadHighScore();
  }, []);

  // Whenever the game ends, check if we beat the high score and save it
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString()).catch((error) => {
        console.log('Failed to save high score:', error);
      });
    }
  }, [gameOver]);

  const handleStartGame = () => {
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setShipX((SCREEN_WIDTH - SHIP_WIDTH) / 2);
    setAsteroid({ x: getRandomAsteroidX(), y: -ASTEROID_SIZE });
  };

  const moveLeft = () => {
    setShipX((prevX) => Math.max(0, prevX - MOVE_STEP));
  };

  const moveRight = () => {
    setShipX((prevX) => Math.min(SCREEN_WIDTH - SHIP_WIDTH, prevX + MOVE_STEP));
  };

  // The game loop: runs repeatedly while the game is active
  useEffect(() => {
    if (!isPlaying || gameOver) {
      return; // don't start a timer if the game isn't running
    }

    const intervalId = setInterval(() => {
      setAsteroid((prev) => {
        const newY = prev.y + FALL_SPEED;

        // Check collision first, using the ship's latest known position
        if (checkCollision(shipX, prev.x, newY)) {
          setGameOver(true);
          setIsPlaying(false);
          return prev; // freeze the asteroid where it hit
        }

        // If asteroid passed the bottom of the screen, respawn it and score a point
        if (newY > SCREEN_HEIGHT) {
          setScore((prevScore) => prevScore + 1);
          return { x: getRandomAsteroidX(), y: -ASTEROID_SIZE };
        }

        // Otherwise, just keep falling
        return { x: prev.x, y: newY };
      });
    }, TICK_INTERVAL);

    return () => clearInterval(intervalId); // cleanup when effect re-runs or unmounts
  }, [isPlaying, gameOver, shipX]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>Space Escape Runner</Text>

      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>HIGH SCORE</Text>
          <Text style={styles.highScoreValue}>{highScore}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleStartGame}>
        <Text style={styles.buttonText}>
          {isPlaying ? 'Restart Game' : gameOver ? 'Play Again' : 'Start Game'}
        </Text>
      </TouchableOpacity>

      {isPlaying && (
        <Text style={styles.statusText}>Game is running...</Text>
      )}

      {/* Asteroid */}
      <View style={[styles.asteroid, { left: asteroid.x, top: asteroid.y }]}>
        <View style={styles.craterOne} />
        <View style={styles.craterTwo} />
      </View>

      {/* Spaceship */}
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

      {/* Game Over overlay */}
      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.gameOverText}>GAME OVER</Text>
          <Text style={styles.finalScoreText}>Final Score: {score}</Text>
          <Text style={styles.finalHighScoreText}>High Score: {highScore}</Text>
          <TouchableOpacity style={styles.button} onPress={handleStartGame}>
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  scoreCard: {
    backgroundColor: '#1A1F3D',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 30,
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
  highScoreValue: {
    color: '#FFD86B',
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
    bottom: SHIP_BOTTOM_OFFSET,
    width: SHIP_WIDTH,
    height: SHIP_HEIGHT,
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

  // ---- Asteroid shape ----
  asteroid: {
    position: 'absolute',
    width: ASTEROID_SIZE,
    height: ASTEROID_SIZE,
    borderRadius: ASTEROID_SIZE / 2,
    backgroundColor: '#8B8680',
    borderWidth: 2,
    borderColor: '#5C5850',
  },
  craterOne: {
    position: 'absolute',
    top: 8,
    left: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5C5850',
  },
  craterTwo: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5C5850',
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

  // ---- Game Over overlay ----
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 14, 35, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverText: {
    color: '#FF6B4A',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  finalScoreText: {
    color: '#FFFFFF',
    fontSize: 20,
    marginBottom: 6,
  },
  finalHighScoreText: {
    color: '#FFD86B',
    fontSize: 16,
    marginBottom: 30,
  },
});