import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const gridSize = 40; // Tamanho de cada célula
const marginExternal = 80; // Margem externa ao redor do jogo (tela)
const marginInternal = 40; // Margem interna ao redor da gamebox (grade de células)

const SnakeGame = () => {
  const gridWidth = Math.floor(
    (width - marginExternal * 2 - marginInternal * 2) / gridSize
  );
  const gridHeight = Math.floor(
    (height - marginExternal * 2 - marginInternal * 2) / gridSize
  );

  // Função para gerar a posição inicial da cobra
  const generateRandomSnakePosition = () => {
    const randX = Math.floor(Math.random() * gridWidth);
    const randY = Math.floor(Math.random() * gridHeight);
    return [
      { x: randX, y: randY },
      { x: randX, y: randY },
      { x: randX, y: randY },
    ];
  };

  // Função para randomizar a direção inicial
  const generateRandomDirection = () => {
    const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    return directions[Math.floor(Math.random() * directions.length)];
  };

  const [snake, setSnake] = useState(generateRandomSnakePosition());
  const [food, setFood] = useState(generateFood());
  const [gameOver, setGameOver] = useState(false);
  const [snakeSpeed, setSnakeSpeed] = useState(200); // Velocidade inicial da cobra (150ms)
  const [intervalId, setIntervalId] = useState(null); // Estado para o ID do intervalo

  // Usar useRef para armazenar a direção atual
  const directionRef = useRef(generateRandomDirection());
  const lastDirectionChange = useRef(Date.now()); // Armazena o timestamp da última mudança de direção

  // Função para gerar comida em uma posição aleatória
  function generateFood() {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
      };
    } while (
      snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );
    return newFood;
  }

  // Movimenta a cobra de acordo com a direção atual
  const moveSnake = () => {
    if (gameOver) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (directionRef.current) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    // Verificar bordas
    if (head.x < 0) head.x = gridWidth - 1;
    if (head.x >= gridWidth) head.x = 0;
    if (head.y < 0) head.y = gridHeight - 1;
    if (head.y >= gridHeight) head.y = 0;

    // Verificar colisão com o corpo
    if (
      newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      setGameOver(true);
      return;
    }

    // Verificar se pegou a comida
    if (head.x === food.x && head.y === food.y) {
      setFood(generateFood());
      newSnake.unshift(head);
      increaseSnakeSpeed(); // Aumenta a velocidade da cobra
    } else {
      newSnake.unshift(head);
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  // Aumenta a velocidade da cobra ao longo do tempo
  // Função para aumentar a velocidade da cobra progressivamente
const increaseSnakeSpeed = () => {
  setSnakeSpeed((prevSpeed) => {
    // Define a velocidade mínima da cobra (não pode ser menor que 50ms)
    const minSpeed = 20;
    // Multiplica a velocidade por um fator de 1.05 para aumentar gradualmente
    const newSpeed = prevSpeed * 0.95;
    return Math.floor(Math.max(newSpeed, minSpeed)); // Garante que a velocidade não ficará abaixo de 50ms
  });
};

  // Muda a direção da cobra
  const changeDirection = (newDirection) => {
  const now = Date.now();
  const timeDifference = now - lastDirectionChange.current;

  // Impede mudanças de direção rápidas demais
  if (timeDifference < 100) {
    return;
  }

  // Verifica a direção atual e a próxima posição da cabeça
  const head = snake[0];
  const nextHead = { ...head };

  switch (newDirection) {
    case 'UP':
      nextHead.y -= 1;
      break;
    case 'DOWN':
      nextHead.y += 1;
      break;
    case 'LEFT':
      nextHead.x -= 1;
      break;
    case 'RIGHT':
      nextHead.x += 1;
      break;
  }

  // Impede mudanças de direção opostas ou que causariam colisão imediata
  if (
    (directionRef.current === 'UP' && newDirection === 'DOWN') ||
    (directionRef.current === 'DOWN' && newDirection === 'UP') ||
    (directionRef.current === 'LEFT' && newDirection === 'RIGHT') ||
    (directionRef.current === 'RIGHT' && newDirection === 'LEFT') ||
    snake.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y)
  ) {
    return;
  }

  directionRef.current = newDirection;
  lastDirectionChange.current = now; // Atualiza o timestamp da mudança
};


  // Efeito para controlar o movimento da cobra
  useEffect(() => {
    if (gameOver) return;

    // Limpa o intervalo anterior
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Cria um novo intervalo com base na velocidade atual
    const id = setInterval(() => moveSnake(), snakeSpeed);
    setIntervalId(id);

    return () => clearInterval(id); // Limpa o intervalo quando o componente é desmontado
  }, [snake, gameOver, snakeSpeed]); // Atualiza quando a velocidade mudar

  // Função de reiniciar o jogo
  const restartGame = () => {
    setSnake(generateRandomSnakePosition()); // Posição aleatória da cobra
    directionRef.current = generateRandomDirection(); // Direção aleatória
    setFood(generateFood());
    setGameOver(false);
    setSnakeSpeed(200); // Reseta a velocidade para o valor inicial

    // Limpar o intervalo anterior, caso esteja presente
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Iniciar o intervalo novamente com a velocidade inicial
    const id = setInterval(() => moveSnake(), snakeSpeed);
    setIntervalId(id);
  };

  // Lidar com eventos de tecla (para navegadores)
  const handleKeyPress = (e) => {
    switch (e.key) {
      case 'ArrowUp':
        changeDirection('UP');
        break;
      case 'ArrowDown':
        changeDirection('DOWN');
        break;
      case 'ArrowLeft':
        changeDirection('LEFT');
        break;
      case 'ArrowRight':
        changeDirection('RIGHT');
        break;
      case 'r':
        restartGame();
        break;
      case 'x':
        increaseSnakeSpeed();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const keyListener = (e) => handleKeyPress(e);
    window.addEventListener('keydown', keyListener);
    return () => window.removeEventListener('keydown', keyListener);
  }, []);

  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        {gameOver ? (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverText}>Game Over!</Text>
            <TouchableOpacity
              onPress={restartGame}
              style={styles.restartButton}>
              <Text style={styles.restartText}>Restart</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.gameBox,
              {
                width: gridWidth * gridSize + marginInternal * 2,
                height: gridHeight * gridSize + marginInternal * 2,
                margin: marginExternal,
              },
            ]}>
            <View style={styles.textOverlay}>
              <Text style={styles.overlayText}>{snakeSpeed}</Text>
            </View>
            {/* Borda ao redor da gamebox */}
            {Array.from({ length: gridHeight + 2 }, (_, y) =>
              Array.from({ length: gridWidth + 2 }, (_, x) => {
                const isBorder =
                  y === 0 ||
                  y === gridHeight + 1 ||
                  x === 0 ||
                  x === gridWidth + 1;
                return (
                  <View
                    key={`${x}-${y}`}
                    style={[
                      styles.gridCell,
                      isBorder && styles.borderCell,
                      { top: y * gridSize, left: x * gridSize },
                    ]}
                  />
                );
              })
            )}

            {/* Game grid com snake e comida */}
            {Array.from({ length: gridHeight }, (_, y) =>
              Array.from({ length: gridWidth }, (_, x) => {
                const isSnake = snake.some(
                  (segment) => segment.x === x && segment.y === y
                );
                const isFood = food.x === x && food.y === y;
                return (
                  <View
                    key={`${x}-${y}`}
                    style={[
                      styles.gridCell,
                      isSnake && styles.snakeCell,
                      isFood && styles.appleCell,
                      { top: (y + 1) * gridSize, left: (x + 1) * gridSize },
                    ]}
                  />
                );
              })
            )}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E1FCD3',
  },
  gameBox: {
    position: 'relative',
    backgroundColor: '#2B5A48',
    justifyContent: 'relative',
    alignItems: 'relative',
  },
  gridCell: {
    backgroundColor: '#E1FCD3',
    position: 'absolute',
    width: gridSize,
    height: gridSize,
  },
  snakeCell: {
    backgroundColor: '#2B5A48',
    borderWidth: 3,
    borderColor: 'black',
    borderLeftColor: '#092316',
    borderRightColor: '#092316',
  },
  appleCell: {
    backgroundColor: '#A2D39C',
    borderWidth: 2,
  },
  borderCell: {
    backgroundColor: '#A2D39C',
    borderWidth: 6,
    borderTopColor: '#51874D',
    borderRightColor: '#3D706B',
    borderLeftColor: '#2A4C3F',
    borderBottomColor: 'black',
  },
  gameOverContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2B5A48',
    marginBottom: 20,
  },
  restartButton: {
    padding: 10,
    backgroundColor: '#2ECC71',
    borderRadius: 5,
  },
  restartText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  textOverlay: {
  position: 'absolute',
  top: marginInternal - 80,
  zIndex: 10,
},
overlayText: {
  fontSize: 24,
  color: 'green',
  fontWeight: 'bold',
},
});

export default SnakeGame;
