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
const QUESTIONS_PER_GAME = 5; 

const movieQuestions = [
  // Scott Pilgrim vs. the World Questions
  { 
    id: 1, 
    question: "What letters are on the maroon collared t-shirt?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756588714/Scott_Pilgrim_vs_the_World_Funny_Scene._HD_-_1080p_-_SandmannLV_1080p_h264_tkjwl2.mp4", 
    answers: ["SHRP", "SASS", "SARS", "STAR"], 
    correctAnswer: 2, 
    movie: "Scott Pilgrim vs. the World", 
    year: 2010 
  },
  { 
    id: 2, 
    question: "What color is the door?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756588714/Scott_Pilgrim_vs_the_World_Funny_Scene._HD_-_1080p_-_SandmannLV_1080p_h264_tkjwl2.mp4", 
    answers: ["Red", "Green", "Blue", "Yellow"], 
    correctAnswer: 2, 
    movie: "Scott Pilgrim vs. the World", 
    year: 2010 
  },
  { 
    id: 3, 
    question: "Who is the caller?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756588714/Scott_Pilgrim_vs_the_World_Funny_Scene._HD_-_1080p_-_SandmannLV_1080p_h264_tkjwl2.mp4", 
    answers: ["Wallace", "Ramona", "Scott", "Knives"], 
    correctAnswer: 3, 
    movie: "Scott Pilgrim vs. the World", 
    year: 2010 
  },
  { 
    id: 4, 
    question: "What are the letters on the blue shirt?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756588714/Scott_Pilgrim_vs_the_World_Funny_Scene._HD_-_1080p_-_SandmannLV_1080p_h264_tkjwl2.mp4", 
    answers: ["S.P.", "W.W.", "X.P.", "V.S."], 
    correctAnswer: 1, 
    movie: "Scott Pilgrim vs. the World", 
    year: 2010 
  },
  { 
    id: 5, 
    question: "Who does Knives ask for?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756588714/Scott_Pilgrim_vs_the_World_Funny_Scene._HD_-_1080p_-_SandmannLV_1080p_h264_tkjwl2.mp4", 
    answers: ["Wallace", "Kim", "The caller", "Scott"], 
    correctAnswer: 3, 
    movie: "Scott Pilgrim vs. the World", 
    year: 2010 
  },
  { 
    id: 6, 
    question: "What number is on the white t-shirt?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756588714/Scott_Pilgrim_vs_the_World_Funny_Scene._HD_-_1080p_-_SandmannLV_1080p_h264_tkjwl2.mp4", 
    answers: ["1", "2", "3", "4"], 
    correctAnswer: 2, 
    movie: "Scott Pilgrim vs. the World", 
    year: 2010 
  },

  // Titanic Questions
  { 
    id: 7, 
    question: "What are they eating?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756586510/Titanic_3D_First_Class_Dinner_Official_Clip_HD_-_20th_Century_Studios_UK_480p_h264_jtdobl.mp4", 
    answers: ["Soup", "Salad", "Bread", "Oysters"], 
    correctAnswer: 2, 
    movie: "Titanic", 
    year: 1997 
  },
  { 
    id: 8, 
    question: "What letters are in front of the name 'Titanic'?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756586510/Titanic_3D_First_Class_Dinner_Official_Clip_HD_-_20th_Century_Studios_UK_480p_h264_jtdobl.mp4", 
    answers: ["USS", "HMS", "RMS", "SS"], 
    correctAnswer: 2, 
    movie: "Titanic", 
    year: 1997 
  },
  { 
    id: 9, 
    question: "How did Jack get a ticket for the Titanic?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756586510/Titanic_3D_First_Class_Dinner_Official_Clip_HD_-_20th_Century_Studios_UK_480p_h264_jtdobl.mp4", 
    answers: ["It was a gift", "Won it in a poker game", "Bought the last one", "Worked for passage"], 
    correctAnswer: 1, 
    movie: "Titanic", 
    year: 1997 
  },
  { 
    id: 10, 
    question: "Real men make what?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756586510/Titanic_3D_First_Class_Dinner_Official_Clip_HD_-_20th_Century_Studios_UK_480p_h264_jtdobl.mp4", 
    answers: ["Their own rules", "A good impression", "Their own luck", "A respectable living"], 
    correctAnswer: 2, 
    movie: "Titanic", 
    year: 1997 
  },
  { 
    id: 11, 
    question: "What is Jack's last name?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756586510/Titanic_3D_First_Class_Dinner_Official_Clip_HD_-_20th_Century_Studios_UK_480p_h264_jtdobl.mp4", 
    answers: ["Dawson", "Hockley", "Bukater", "DeWitt"], 
    correctAnswer: 0, 
    movie: "Titanic", 
    year: 1997 
  },
  { 
    id: 12, 
    question: "What two things does Jack have?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756586510/Titanic_3D_First_Class_Dinner_Official_Clip_HD_-_20th_Century_Studios_UK_480p_h264_jtdobl.mp4", 
    answers: ["A lucky coin and a photo", "A sketchbook and pencils", "A warm coat and some boots", "Air in his lungs, a few blank sheets of paper"], 
    correctAnswer: 3, 
    movie: "Titanic", 
    year: 1997 
  },
  { 
    id: 13, 
    question: "What are they drinking?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756586510/Titanic_3D_First_Class_Dinner_Official_Clip_HD_-_20th_Century_Studios_UK_480p_h264_jtdobl.mp4", 
    answers: ["Red wine", "Champagne", "Water", "Whiskey"], 
    correctAnswer: 1, 
    movie: "Titanic", 
    year: 1997 
  },

  // Billy Madison Questions
  { 
    id: 14, 
    question: "Who is the caller?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756587768/Billy_Madison_1995_-_Billy_apologizes_Movie_Moments_-_Movie_Moments_720p_h264_lidhdl.mp4", 
    answers: ["Danny McGrath", "Veronica Vaughn", "Eric Gordon", "Billy Madison"], 
    correctAnswer: 3, 
    movie: "Billy Madison", 
    year: 1995 
  },
  { 
    id: 15, 
    question: "What color is the caller's robe?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756587768/Billy_Madison_1995_-_Billy_apologizes_Movie_Moments_-_Movie_Moments_720p_h264_lidhdl.mp4", 
    answers: ["Blue", "Red", "Black", "Green"], 
    correctAnswer: 1, 
    movie: "Billy Madison", 
    year: 1995 
  },
  { 
    id: 16, 
    question: "What year did Danny McGrath graduate?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756587768/Billy_Madison_1995_-_Billy_apologizes_Movie_Moments_-_Movie_Moments_720p_h264_lidhdl.mp4", 
    answers: ["1994", "1988", "1984", "1990"], 
    correctAnswer: 2, 
    movie: "Billy Madison", 
    year: 1995 
  },
  { 
    id: 17, 
    question: "What is Billy leaning on?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756587768/Billy_Madison_1995_-_Billy_apologizes_Movie_Moments_-_Movie_Moments_720p_h264_lidhdl.mp4", 
    answers: ["A basketball", "A football", "A stack of books", "A globe"], 
    correctAnswer: 1, 
    movie: "Billy Madison", 
    year: 1995 
  },
  { 
    id: 18, 
    question: "Who else is on Danny's 'People to Kill' list?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756587768/Billy_Madison_1995_-_Billy_apologizes_Movie_Moments_-_Movie_Moments_720p_h264_lidhdl.mp4", 
    answers: ["Jack Simms", "Perry Blake", "Mikey Rutledge", "Carl Herbert"], 
    correctAnswer: 1, 
    movie: "Billy Madison", 
    year: 1995 
  },

  // The Big Lebowski Questions
  { 
    id: 19, 
    question: "Who bowls first?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756590547/ssvid.net---The-Big-Lebowski-1998-You-re-Entering-a-World-of_1080p_bxzqkh.mp4", 
    answers: ["Walter", "The Dude", "Donny", "Jesus"], 
    correctAnswer: 2, 
    movie: "The Big Lebowski", 
    year: 1998 
  },
  { 
    id: 20, 
    question: "What does Donny's shirt say?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756590547/ssvid.net---The-Big-Lebowski-1998-You-re-Entering-a-World-of_1080p_bxzqkh.mp4", 
    answers: ["Dude", "Ray", "Walter", "Donny"], 
    correctAnswer: 1, 
    movie: "The Big Lebowski", 
    year: 1998 
  },

  // Superbad Questions
  { 
    id: 21, 
    question: "What is the bus number?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756591024/Superbad_-_McLovin_s_Fake_ID_Scene_HD_-_MOVIEPREPARE_1080p_h264_drd5qc.mp4", 
    answers: ["3015", "2115", "3051", "2011"], 
    correctAnswer: 0, 
    movie: "Superbad", 
    year: 2007 
  },
  { 
    id: 22, 
    question: "What is the name of the liquor store?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756591024/Superbad_-_McLovin_s_Fake_ID_Scene_HD_-_MOVIEPREPARE_1080p_h264_drd5qc.mp4", 
    answers: ["The Best Stop", "The Corner Mart", "The Good Shopper", "The Liquor Barn"], 
    correctAnswer: 2, 
    movie: "Superbad", 
    year: 2007 
  },
  { 
    id: 23, 
    question: "What character does Seth say McLovin looks like in the vest?", 
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756591024/Superbad_-_McLovin_s_Fake_ID_Scene_HD_-_MOVIEPREPARE_1080p_h264_drd5qc.mp4", 
    answers: ["Aladdin", "Peter Pan", "A hobbit", "Pinocchio"], 
    correctAnswer: 3, 
    movie: "Superbad", 
    year: 2007 
  },
  
  // Sinners Questions
  {
    id: 24,
    question: "Whose guitar was it said to be?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756591144/ssvid.net--We-Gon-Make-Some-Money-Sinners-Movie-Clip-2025_360p_sg9otg.mp4",
    answers: ["Robert Johnson", "B.B. King", "Charley Patton", "Muddy Waters"],
    correctAnswer: 2,
    movie: "Sinners",
    year: 2025
  },
  {
    id: 25,
    question: "What colors are the two main characters wearing?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1756591144/ssvid.net--We-Gon-Make-Some-Money-Sinners-Movie-Clip-2025_360p_sg9otg.mp4",
    answers: ["Blue and Green", "Red and Yellow", "Black and White", "Orange and Purple"],
    correctAnswer: 1,
    movie: "Sinners",
    year: 2025
  },
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
