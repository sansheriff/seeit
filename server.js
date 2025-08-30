const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const games = {};
const QUESTIONS_PER_GAME = 2; 

const movieQuestions = [
  { id: 1, question: "What movie is this iconic opening scene from?", videoUrl: "/videos/clip1.mp4", answers: ["The Lord of the Rings", "The Hobbit", "The Two Towers", "Return of the King"], correctAnswer: 0, movie: "The Lord of the Rings: The Fellowship of the Ring", year: 2001 },
  { id: 2, question: "Which film features the quote: 'I'll have what she's having'?", videoUrl: "/videos/clip1.mp4", answers: ["Sleepless in Seattle", "When Harry Met Sally...", "You've Got Mail", "Jerry Maguire"], correctAnswer: 1, movie: "When Harry Met Sally...", year: 1989 },
  { id: 3, question: "This murder mystery's cast includes Daniel Craig and Chris Evans.", videoUrl: "/videos/clip1.mp4", answers: ["Knives Out", "Glass Onion", "Murder on the Orient Express", "Death on the Nile"], correctAnswer: 0, movie: "Knives Out", year: 2019 },
  { id: 4, question: "This 90s classic stars John Travolta and Samuel L. Jackson.", videoUrl: "/videos/clip1.mp4", answers: ["Forrest Gump", "Pulp Fiction", "The Shawshank Redemption", "Good Will Hunting"], correctAnswer: 1, movie: "Pulp Fiction", year: 1994 },
  { id: 5, question: "Which Pixar movie features a robot love story in a post-apocalyptic world?", videoUrl: "/videos/clip1.mp4", answers: ["Toy Story", "Up", "WALL-E", "Inside Out"], correctAnswer: 2, movie: "WALL-E", year: 2008 },
  { id: 6, question: "This Christopher Nolan film involves dreams within dreams.", videoUrl: "/videos/clip1.mp4", answers: ["Inception", "Dunkirk", "The Dark Knight Rises", "Tenet"], correctAnswer: 0, movie: "Inception", year: 2010 },
  { id: 7, question: "What is the primary setting for this fantasy epic?", videoUrl: "/videos/clip1.mp4", answers: ["Narnia", "Westeros", "Middle-earth", "Hogwarts"], correctAnswer: 2, movie: "The Lord of the Rings", year: 2001 },
  { id: 8, question: "The line 'Here's looking at you, kid' is from which classic film?", videoUrl: "/videos/clip1.mp4", answers: ["The Maltese Falcon", "Citizen Kane", "It's a Wonderful Life", "Casablanca"], correctAnswer: 3, movie: "Casablanca", year: 1942 },
  { id: 9, question: "Which of these is a famous line from 'The Godfather'?", videoUrl: "/videos/clip1.mp4", answers: ["I'll be back.", "Leave the gun, take the cannoli.", "Show me the money!", "I am your father."], correctAnswer: 1, movie: "The Godfather", year: 1972 },
  { id: 10, question: "This Stanley Kubrick film is known for its groundbreaking visual effects.", videoUrl: "/videos/clip1.mp4", answers: ["Star Wars", "Blade Runner", "2001: A Space Odyssey", "Alien"], correctAnswer: 2, movie: "2001: A Space Odyssey", year: 1968 },
  { id: 11, question: "Which director is famous for the 'Reservoir Dogs' and 'Pulp Fiction'?", videoUrl: "/videos/clip1.mp4", answers: ["Martin Scorsese", "Francis Ford Coppola", "Steven Spielberg", "Quentin Tarantino"], correctAnswer: 3, movie: "Pulp Fiction", year: 1994 },
  { id: 12, question: "What type of animal is 'Babe' in the film of the same name?", videoUrl: "/videos/clip1.mp4", answers: ["A dog", "A pig", "A sheep", "A duck"], correctAnswer: 1, movie: "Babe", year: 1995 },
  { id: 13, question: "In 'The Matrix', what color pill does Neo take?", videoUrl: "/videos/clip1.mp4", answers: ["The red pill", "The blue pill", "The green pill", "The yellow pill"], correctAnswer: 0, movie: "The Matrix", year: 1999 },
  { id: 14, question: "Which film won the first-ever Academy Award for Best Picture?", videoUrl: "/videos/clip1.mp4", answers: ["The Jazz Singer", "Metropolis", "Wings", "Sunrise"], correctAnswer: 2, movie: "Wings", year: 1927 },
  { id: 15, question: "What is the name of the friendly ghost in the 1995 film?", videoUrl: "/videos/clip1.mp4", answers: ["Slimer", "Beetlejuice", "Casper", "Moaning Myrtle"], correctAnswer: 2, movie: "Casper", year: 1995 }
];

function generateGameCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function getPlayersData(game) {
  if (!game || !game.players) return [];
  return Object.values(game.players).map(p => ({
    name: p.name,
    score: p.score,
    connected: p.connected
  }));
}

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  socket.on('createGame', () => {
    let code = generateGameCode();
    while (games[code]) {
      code = generateGameCode();
    }
    
    const shuffledQuestions = [...movieQuestions].sort(() => 0.5 - Math.random());

    games[code] = {
      mainScreenId: socket.id,
      players: {},
      currentQuestionIndex: 0,
      gameState: 'waiting',
      questions: shuffledQuestions.slice(0, QUESTIONS_PER_GAME),
      lastActivity: Date.now()
    };
    
    socket.join(code);
    socket.gameCode = code;
    
    console.log(`New game created by main screen: ${code}`);

    socket.emit('gameCreated', {
      gameCode: code
    });
  });

  socket.on('joinGame', (data) => {
    const { gameCode, playerName } = data;
    const code = gameCode;

    if (!games[code]) {
      socket.emit('error', { message: 'Game not found! Please check the code.' });
      return;
    }

    const game = games[code];
    
    const oldSocketId = Object.keys(game.players).find(id => game.players[id].name.toLowerCase() === playerName.toLowerCase());
    const existingPlayer = oldSocketId ? game.players[oldSocketId] : null;

    if (existingPlayer) {
        if (existingPlayer.connected) {
            socket.emit('error', { message: 'Name already taken! Choose another.' });
            return;
        } else {
            console.log(`${playerName} is reconnecting.`);
            delete game.players[oldSocketId];
            
            existingPlayer.connected = true;
            game.players[socket.id] = existingPlayer;
        }
    } else {
        if (game.gameState !== 'waiting') {
            socket.emit('error', { message: 'Game has already started. Cannot join now.' });
            return;
        }
        game.players[socket.id] = {
            name: playerName,
            score: 0,
            answered: false,
            connected: true,
            lastAnswer: null
        };
    }
    
    game.lastActivity = Date.now();
    socket.join(code);
    socket.gameCode = code;
    socket.playerName = playerName;
    
    io.to(code).emit('updatePlayers', {
      players: getPlayersData(game),
    });

    socket.emit('joinedGame', { 
      gameCode: code,
      playerName,
      gameState: game.gameState,
      players: getPlayersData(game),
    });
    
    console.log(`${playerName} joined game ${code} (${Object.keys(game.players).length} players)`);
    
    const playerCount = Object.values(game.players).filter(p => p.connected).length;
    if (playerCount >= 1) {
      io.to(game.mainScreenId).emit('canStartGame', { playerCount });
    }
  });

  socket.on('startGame', () => {
    const code = socket.gameCode;
    if (!code || !games[code]) return;
    
    const game = games[code];
    if (game.mainScreenId !== socket.id) {
      socket.emit('error', { message: 'Only the main screen can start the game!' });
      return;
    }
    
    if (Object.values(game.players).filter(p => p.connected).length === 0) {
      socket.emit('error', { message: 'Need at least 1 player to start!' });
      return;
    }
    
    game.gameState = 'playing';
    game.currentQuestionIndex = 0;
    
    console.log(`Game ${code} started.`);
    
    io.to(code).emit('gameStarted');
    
    setTimeout(() => {
      sendQuestion(code);
    }, 2000);
  });

  function sendQuestion(gameCode) {
    const game = games[gameCode];
    if (!game || game.currentQuestionIndex >= game.questions.length) {
      endGame(gameCode);
      return;
    }

    Object.values(game.players).forEach(player => {
      player.lastAnswer = null;
    });

    io.to(gameCode).emit('showVideo', {
      videoUrl: game.questions[game.currentQuestionIndex].videoUrl,
    });
  }
  
  socket.on('videoFinished', () => {
    const code = socket.gameCode;
    if (!code || !games[code]) return;
    const game = games[code];
    if (socket.id !== game.mainScreenId) return;

    const questionTimer = 30;
    const currentQuestion = game.questions[game.currentQuestionIndex];

    io.to(code).emit('newQuestion', {
      question: currentQuestion.question,
      answers: currentQuestion.answers,
      timer: questionTimer,
      questionNumber: game.currentQuestionIndex + 1,
    });

    game.questionTimeout = setTimeout(() => {
      revealAnswer(code);
    }, (questionTimer + 1) * 1000);
  });


  socket.on('submitAnswer', (data) => {
    const { answerIndex, responseTime } = data;
    const code = socket.gameCode;
    if (!code || !games[code]) return;
    
    const game = games[code];
    const player = game.players[socket.id];
    if (!player) return;
    
    const question = game.questions[game.currentQuestionIndex];
    let correct = (answerIndex === question.correctAnswer);
    
    player.lastAnswer = {
        index: answerIndex,
        isCorrect: correct,
        responseTime: responseTime
    };

    socket.emit('answerReceived');
  });

  function revealAnswer(gameCode) {
    const game = games[gameCode];
    if (!game) return;

    clearTimeout(game.questionTimeout);

    const question = game.questions[game.currentQuestionIndex];
    const correctAnswerIndex = question.correctAnswer;
    const correctAnswerText = question.answers[correctAnswerIndex];

    const isAnswerTheMovie = question.movie.toLowerCase().includes(correctAnswerText.toLowerCase()) || 
                             correctAnswerText.toLowerCase().includes(question.movie.toLowerCase());

    const payload = {
        correctAnswer: correctAnswerIndex,
        movie: question.movie,
        year: question.year,
        correctAnswerText: correctAnswerText,
        isAnswerTheMovie: isAnswerTheMovie
    };
    
    io.to(game.mainScreenId).emit('revealAnswer', payload);
    
    Object.keys(game.players).forEach(playerId => {
        const player = game.players[playerId];
        if (player.connected) {
            const lastAnswer = player.lastAnswer || {};
            let pointsEarned = 0;

            if (lastAnswer.isCorrect) {
                pointsEarned = Math.max(100, Math.floor(1000 - (lastAnswer.responseTime * 30)));
                player.score += pointsEarned;
            }

            io.to(playerId).emit('revealAnswer', { 
                ...payload,
                yourAnswer: lastAnswer.index,
                wasCorrect: lastAnswer.isCorrect,
                pointsEarned: pointsEarned
            });
        }
    });

    io.to(game.mainScreenId).emit('updateScores', { 
        scores: getPlayersData(game)
    });

    game.currentQuestionIndex++;
    
    setTimeout(() => {
      const isGameOver = game.currentQuestionIndex >= game.questions.length;
      if (isGameOver) {
        endGame(gameCode);
        return;
      }
      
      const scores = getPlayersData(game).sort((a, b) => b.score - a.score);
      io.to(gameCode).emit('showInterstitialScores', { scores: scores });

      setTimeout(() => {
        sendQuestion(gameCode);
      }, 5000);

    }, 7000);
  }

  function endGame(gameCode) {
    const game = games[gameCode];
    if (!game) return;
    
    game.gameState = 'finished';
    
    const finalScores = getPlayersData(game).sort((a, b) => b.score - a.score);
    
    io.to(gameCode).emit('gameEnded', { 
      finalScores,
      gameCode: gameCode
    });
  }

  socket.on('leaveGame', () => {
    handleDisconnect(socket);
  });

  socket.on('disconnect', () => {
    handleDisconnect(socket);
  });

  function handleDisconnect(socket) {
    const code = socket.gameCode;
    if (!code || !games[code]) return;

    const game = games[code];
    if (socket.id === game.mainScreenId) {
        io.to(code).emit('mainScreenDisconnected');
        delete games[code];
        console.log(`Main screen disconnected, game ${code} deleted.`);
    } else {
        const player = game.players[socket.id];
        if (!player) return;
        
        console.log(`${player.name} disconnected from game ${code}`);
        player.connected = false;
        
        io.to(game.mainScreenId).emit('updatePlayers', {
          players: getPlayersData(game),
        });
    }
  }
});

setInterval(() => {
  const now = Date.now();
  Object.keys(games).forEach(code => {
    if (now - games[code].lastActivity > 3600000) {
      delete games[code];
      console.log(`Game ${code} deleted due to inactivity`);
    }
  });
}, 600000);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Movie Quiz Game Server running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
});