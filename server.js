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
const QUESTIONS_PER_GAME = 10;


const movieQuestions = [
  // Frozen Questions
  {
    id: 1,
    question: "What movie is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757104530/you-are-lucky-wasnt-heart_i48u0g.mp4",
    answers: ["Tangled", "Moana", "Frozen", "Brave"],
    correctAnswer: 2,
    movie: "Frozen",
    year: 2013
  },
  {
    id: 2,
    question: "What did the troll leave of the magic?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757104530/you-are-lucky-wasnt-heart_i48u0g.mp4",
    answers: ["The joy", "The fun", "The memories", "The beauty"],
    correctAnswer: 1,
    movie: "Frozen",
    year: 2013
  },
  {
    id: 3,
    question: "What color are the kingdom's flags in the clip?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757104530/you-are-lucky-wasnt-heart_i48u0g.mp4",
    answers: ["Blue", "Green", "Red", "Yellow"],
    correctAnswer: 2,
    movie: "Frozen",
    year: 2013
  },
  // Spirited Away Questions
  {
    id: 4,
    question: "What movie is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757104219/i-guess-i-turned-off-too-soon_1920p_clip_gnhkw2.mp4",
    answers: ["My Neighbor Totoro", "Spirited Away", "Princess Mononoke", "Howl's Moving Castle"],
    correctAnswer: 1,
    movie: "Spirited Away",
    year: 2001
  },
  {
    id: 5,
    question: "What is the little girl holding?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757104219/i-guess-i-turned-off-too-soon_1920p_clip_gnhkw2.mp4",
    answers: ["A doll", "A book", "A snack", "Flowers"],
    correctAnswer: 3,
    movie: "Spirited Away",
    year: 2001
  },
  {
    id: 6,
    question: "What kind of car are they in?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757104219/i-guess-i-turned-off-too-soon_1920p_clip_gnhkw2.mp4",
    answers: ["BMW", "Audi", "Mercedes", "Volkswagen"],
    correctAnswer: 1,
    movie: "Spirited Away",
    year: 2001
  },
  {
    id: 7,
    question: "What is the license plate number?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757104219/i-guess-i-turned-off-too-soon_1920p_clip_gnhkw2.mp4",
    answers: ["13-08", "22-05", "19-01", "17-02"],
    correctAnswer: 2,
    movie: "Spirited Away",
    year: 2001
  },
  {
    id: 8,
    question: "What colors are the little girl's sweater?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757104219/i-guess-i-turned-off-too-soon_1920p_clip_gnhkw2.mp4",
    answers: ["Pink and white", "Yellow and blue", "Red and white", "White and green"],
    correctAnswer: 3,
    movie: "Spirited Away",
    year: 2001
  },
  // Westworld Questions
  {
    id: 9,
    question: "What show is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757103864/dreams-dont-mean-anything-dolores_ugrffd.mp4",
    answers: ["The Handmaid's Tale", "Black Mirror", "Westworld", "The Expanse"],
    correctAnswer: 2,
    movie: "Westworld",
    year: 2016
  },
  {
    id: 10,
    question: "What is the woman's name?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757103864/dreams-dont-mean-anything-dolores_ugrffd.mp4",
    answers: ["Maeve", "Clementine", "Theresa", "Dolores"],
    correctAnswer: 3,
    movie: "Westworld",
    year: 2016
  },
  {
    id: 11,
    question: "What color is the woman's dress?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757103864/dreams-dont-mean-anything-dolores_ugrffd.mp4",
    answers: ["White", "Blue", "Pink", "Yellow"],
    correctAnswer: 1,
    movie: "Westworld",
    year: 2016
  },
  {
    id: 12,
    question: "According to the clip, dreams are just what?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757103864/dreams-dont-mean-anything-dolores_ugrffd.mp4",
    answers: ["Memories", "Static", "Code", "Noise"],
    correctAnswer: 3,
    movie: "Westworld",
    year: 2016
  },
  // Friends Questions
  {
    id: 13,
    question: "What show is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757103437/did-really-say-that_1920p_clip_cpxno1.mp4",
    answers: ["Seinfeld", "Frasier", "Friends", "How I Met Your Mother"],
    correctAnswer: 2,
    movie: "Friends",
    year: 1994
  },
  {
    id: 14,
    question: "What is on Monica's shirt?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757103437/did-really-say-that_1920p_clip_cpxno1.mp4",
    answers: ["A heart", "A moon", "A sun", "A star"],
    correctAnswer: 3,
    movie: "Friends",
    year: 1994
  },
  {
    id: 15,
    question: "What color is Monica's bag?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757103437/did-really-say-that_1920p_clip_cpxno1.mp4",
    answers: ["Blue", "Red", "Green", "Yellow"],
    correctAnswer: 1,
    movie: "Friends",
    year: 1994
  },
  // Inception Questions
  {
    id: 16,
    question: "What is the name of this movie?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757103141/cobb-what-the-most-resilient-parasite_d3uoio.mp4",
    answers: ["The Matrix", "Shutter Island", "Inception", "Interstellar"],
    correctAnswer: 2,
    movie: "Inception",
    year: 2010
  },
  {
    id: 17,
    question: "Who does Leonardo DiCaprio play in this scene?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757103141/cobb-what-the-most-resilient-parasite_d3uoio.mp4",
    answers: ["Mr. Arthur", "Mr. Cobb", "Mr. Eames", "Mr. Saito"],
    correctAnswer: 1,
    movie: "Inception",
    year: 2010
  },
  {
    id: 18,
    question: "What three parasites does the man list?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757103141/cobb-what-the-most-resilient-parasite_d3uoio.mp4",
    answers: ["A flea, a tick, and a leech", "A fungus, a mold, and a spore", "A bacteria, a virus, and an intestinal worm", "A mosquito, a fly, and a gnat"],
    correctAnswer: 2,
    movie: "Inception",
    year: 2010
  },
  // Game of Thrones Questions
  {
    id: 19,
    question: "What show is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757101420/we-shouldnt-be-out-here-alone_eoua2o.mp4",
    answers: ["The Witcher", "The Lord of the Rings", "Game of Thrones", "House of the Dragon"],
    correctAnswer: 2,
    movie: "Game of Thrones",
    year: 2011
  },
  // Jurassic Park Questions
  {
    id: 20,
    question: "What is the name of this movie?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757101267/you-shouldnt-use-name_1080p_clip_jblr6d.mp4",
    answers: ["Independence Day", "The Lost World", "Jurassic Park", "Terminator 2"],
    correctAnswer: 2,
    movie: "Jurassic Park",
    year: 1993
  },
  {
    id: 21,
    question: "Who directed this movie?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757101267/you-shouldnt-use-name_1080p_clip_jblr6d.mp4",
    answers: ["James Cameron", "Steven Spielberg", "George Lucas", "Michael Crichton"],
    correctAnswer: 1,
    movie: "Jurassic Park",
    year: 1993
  },
  {
    id: 22,
    question: "What is the name of the man in the red shirt?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757101267/you-shouldnt-use-name_1080p_clip_jblr6d.mp4",
    answers: ["Dodgson", "Muldoon", "Gennaro", "Dobson"],
    correctAnswer: 0,
    movie: "Jurassic Park",
    year: 1993
  },
  {
    id: 23,
    question: "How much money was being offered for the embryos?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757101267/you-shouldnt-use-name_1080p_clip_jblr6d.mp4",
    answers: ["$500,000", "$1 million", "$2 million", "$1.5 million"],
    correctAnswer: 3,
    movie: "Jurassic Park",
    year: 1993
  },
  {
    id: 24,
    question: "How many species were on the original island?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757101267/you-shouldnt-use-name_1080p_clip_jblr6d.mp4",
    answers: ["10", "12", "15", "20"],
    correctAnswer: 2,
    movie: "Jurassic Park",
    year: 1993
  },
  // The Office Questions
  {
    id: 25,
    question: "What show is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757100912/i-owe-an-apology-s7_agkmql.mp4",
    answers: ["Parks and Recreation", "The Office", "30 Rock", "Arrested Development"],
    correctAnswer: 1,
    movie: "The Office",
    year: 2005
  },
  {
    id: 26,
    question: "What does the plaque on the desk say?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757100912/i-owe-an-apology-s7_agkmql.mp4",
    answers: ["Information", "Front Desk", "Reception", "Welcome"],
    correctAnswer: 2,
    movie: "The Office",
    year: 2005
  },
  {
    id: 27,
    question: "What actor does the man name?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757100912/i-owe-an-apology-s7_agkmql.mp4",
    answers: ["Meryl Streep", "Judi Dench", "Helen Mirren", "Glenn Close"],
    correctAnswer: 0,
    movie: "The Office",
    year: 2005
  },
  {
    id: 28,
    question: "What does the poster on the wall say?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757100912/i-owe-an-apology-s7_agkmql.mp4",
    answers: ["LEADERSHIP", "TEAMWORK", "INTEGRITY", "SUCCESS"],
    correctAnswer: 1,
    movie: "The Office",
    year: 2005
  },
  // Everything Everywhere All at Once Questions
  {
    id: 29,
    question: "What movie is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757100555/in-world-you-a-brilliant-woman_wvsssi.mp4",
    answers: ["Everything Everywhere All at Once", "The Matrix", "Doctor Strange", "Spider-Man: Into the Spider-Verse"],
    correctAnswer: 0,
    movie: "Everything Everywhere All at Once",
    year: 2022
  },
  {
    id: 30,
    question: "What does the cardboard sign say?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757100555/in-world-you-a-brilliant-woman_wvsssi.mp4",
    answers: ["Praise Bagel", "Hail Bagel", "Love Bagel", "Fear Bagel"],
    correctAnswer: 1,
    movie: "Everything Everywhere All at Once",
    year: 2022
  },
  {
    id: 31,
    question: "What three things could the link access?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757100555/in-world-you-a-brilliant-woman_wvsssi.mp4",
    answers: ["Hopes, dreams, and fears", "Past, present, and future", "Memories, skills, and emotions", "Thoughts, feelings, and desires"],
    correctAnswer: 2,
    movie: "Everything Everywhere All at Once",
    year: 2022
  },
  {
    id: 32,
    question: "What movie was the male actor in?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757100555/in-world-you-a-brilliant-woman_wvsssi.mp4",
    answers: ["E.T. the Extra-Terrestrial", "The Goonies", "Stand by Me", "The Karate Kid"],
    correctAnswer: 1,
    movie: "Everything Everywhere All at Once",
    year: 2022
  },
  // The Last Man on Earth Questions
  {
    id: 33,
    question: "Who does the woman in the car mention?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757089685/pamela-bye-jeremy-says-bye_hybvk6.mp4",
    answers: ["Jason", "Kevin", "Jeremy", "Michael"],
    correctAnswer: 2,
    movie: "The Last Man on Earth",
    year: 2015
  },
  {
    id: 34,
    question: "What is the name of this show?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757089685/pamela-bye-jeremy-says-bye_hybvk6.mp4",
    answers: ["Zombieland", "The Last Man on Earth", "Community", "The Good Place"],
    correctAnswer: 1,
    movie: "The Last Man on Earth",
    year: 2015
  },
  {
    id: 35,
    question: "What is the name of the main actor shown?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757089685/pamela-bye-jeremy-says-bye_hybvk6.mp4",
    answers: ["Jason Sudeikis", "Bill Hader", "Will Forte", "Andy Samberg"],
    correctAnswer: 2,
    movie: "The Last Man on Earth",
    year: 2015
  },
  {
    id: 36,
    question: "Not counting the two people in the car, how many people are shown in the clip?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757089685/pamela-bye-jeremy-says-bye_hybvk6.mp4",
    answers: ["5", "6", "8", "7"],
    correctAnswer: 3,
    movie: "The Last Man on Earth",
    year: 2015
  },
  {
    id: 37,
    question: "What movie is referenced in this scene?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757089685/pamela-bye-jeremy-says-bye_hybvk6.mp4",
    answers: ["The Shawshank Redemption", "The Green Mile", "Forrest Gump", "Pulp Fiction"],
    correctAnswer: 0,
    movie: "The Last Man on Earth",
    year: 2015
  },
  // The Shawshank Redemption Questions
  {
    id: 38,
    question: "What movie is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757090102/there-must-be-a-con-like-in-every-prison-in-america-s1_kqjyfa.mp4",
    answers: ["The Green Mile", "The Shawshank Redemption", "Cool Hand Luke", "Escape from Alcatraz"],
    correctAnswer: 1,
    movie: "The Shawshank Redemption",
    year: 1994
  },
  {
    id: 39,
    question: "Who is the main actor talking?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757090102/there-must-be-a-con-like-in-every-prison-in-america-s1_kqjyfa.mp4",
    answers: ["Tim Robbins", "Clancy Brown", "Bob Gunton", "Morgan Freeman"],
    correctAnswer: 3,
    movie: "The Shawshank Redemption",
    year: 1994
  },
  {
    id: 40,
    question: "What drink is mentioned in the clip?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757090102/there-must-be-a-con-like-in-every-prison-in-america-s1_kqjyfa.mp4",
    answers: ["Whiskey", "Brandy", "Beer", "Scotch"],
    correctAnswer: 1,
    movie: "The Shawshank Redemption",
    year: 1994
  },
  {
    id: 41,
    question: "What event does the man say might call for a special bottle of alcohol?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757090102/there-must-be-a-con-like-in-every-prison-in-america-s1_kqjyfa.mp4",
    answers: ["A wedding", "A kid's high school graduation", "A birthday", "An anniversary"],
    correctAnswer: 1,
    movie: "The Shawshank Redemption",
    year: 1994
  },
  {
    id: 42,
    question: "What store does the man compare himself to?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757090102/there-must-be-a-con-like-in-every-prison-in-america-s1_kqjyfa.mp4",
    answers: ["J.C. Penney", "Montgomery Ward", "Sears and Roebuck", "Macy's"],
    correctAnswer: 2,
    movie: "The Shawshank Redemption",
    year: 1994
  },
  // The Godfather Questions
  {
    id: 43,
    question: "Who are they waiting on?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757090840/wheres-michael-dont-worry-hell-be-here_vzjqtb.mp4",
    answers: ["Sonny", "Fredo", "Michael", "Tom"],
    correctAnswer: 2,
    movie: "The Godfather",
    year: 1972
  },
  {
    id: 44,
    question: "What is the name of the movie?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757090840/wheres-michael-dont-worry-hell-be-here_vzjqtb.mp4",
    answers: ["Goodfellas", "Casino", "The Godfather", "Scarface"],
    correctAnswer: 2,
    movie: "The Godfather",
    year: 1972
  },
  {
    id: 45,
    question: "Who directed this movie?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757090840/wheres-michael-dont-worry-hell-be-here_vzjqtb.mp4",
    answers: ["Martin Scorsese", "Brian De Palma", "Sergio Leone", "Francis Ford Coppola"],
    correctAnswer: 3,
    movie: "The Godfather",
    year: 1972
  },
  {
    id: 46,
    question: "What color are the little girl's bows?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757090840/wheres-michael-dont-worry-hell-be-here_vzjqtb.mp4",
    answers: ["Red", "Pink", "White", "Blue"],
    correctAnswer: 1,
    movie: "The Godfather",
    year: 1972
  },
  {
    id: 47,
    question: "What flower does the larger man have on his lapel?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757090840/wheres-michael-dont-worry-hell-be-here_vzjqtb.mp4",
    answers: ["Carnation", "Rose", "Daisy", "Tulip"],
    correctAnswer: 1,
    movie: "The Godfather",
    year: 1972
  },
  // Alien Questions
  {
    id: 48,
    question: "Who directed this movie?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091218/well-some-of-may-have-figured-out-were-not-home-yet-s1_jfpggy.mp4",
    answers: ["James Cameron", "Ridley Scott", "David Fincher", "Jean-Pierre Jeunet"],
    correctAnswer: 1,
    movie: "Alien",
    year: 1979
  },
  {
    id: 49,
    question: "What is the name of the movie?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091218/well-some-of-may-have-figured-out-were-not-home-yet-s1_jfpggy.mp4",
    answers: ["The Thing", "Predator", "Alien", "Event Horizon"],
    correctAnswer: 2,
    movie: "Alien",
    year: 1979
  },
  {
    id: 50,
    question: "What is the name of the AI that controls the ship?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091218/well-some-of-may-have-figured-out-were-not-home-yet-s1_jfpggy.mp4",
    answers: ["Father", "HAL 9000", "GERTY", "Mother"],
    correctAnswer: 3,
    movie: "Alien",
    year: 1979
  },
  {
    id: 51,
    question: "Who played Ripley in this movie?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091218/well-some-of-may-have-figured-out-were-not-home-yet-s1_jfpggy.mp4",
    answers: ["Sigourney Weaver", "Linda Hamilton", "Carrie Fisher", "Jamie Lee Curtis"],
    correctAnswer: 0,
    movie: "Alien",
    year: 1979
  },
  // Community Questions
  {
    id: 52,
    question: "Where was the man robbed?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091572/senor-chang_r3w57e.mp4",
    answers: ["The Library", "The Park", "The YMCA", "The Mall"],
    correctAnswer: 2,
    movie: "Community",
    year: 2009
  },
  {
    id: 53,
    question: "What does the sign on the door say?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091572/senor-chang_r3w57e.mp4",
    answers: ["Do Not Interrupt Classes", "Please Be Quiet", "No Food or Drink", "Welcome Students"],
    correctAnswer: 0,
    movie: "Community",
    year: 2009
  },
  {
    id: 54,
    question: "What show is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091572/senor-chang_r3w57e.mp4",
    answers: ["The Office", "Parks and Recreation", "Community", "Brooklyn Nine-Nine"],
    correctAnswer: 2,
    movie: "Community",
    year: 2009
  },
  {
    id: 55,
    question: "What two types of classrooms are shown?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091572/senor-chang_r3w57e.mp4",
    answers: ["Biology and Art History", "Spanish and Pottery", "Chemistry and English", "Math and Physical Education"],
    correctAnswer: 1,
    movie: "Community",
    year: 2009
  },
  {
    id: 56,
    question: "What classic comedian is briefly shown in a sailor's hat?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091572/senor-chang_r3w57e.mp4",
    answers: ["Bill Murray", "Steve Martin", "Dan Aykroyd", "Chevy Chase"],
    correctAnswer: 3,
    movie: "Community",
    year: 2009
  },
  {
    id: 57,
    question: "What rapper is shown in a blue sweater?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091572/senor-chang_r3w57e.mp4",
    answers: ["Childish Gambino", "Ice Cube", "Will Smith", "Common"],
    correctAnswer: 0,
    movie: "Community",
    year: 2009
  },
  // The Dark Knight Questions
  {
    id: 58,
    question: "Who directed this movie?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091876/all-right-everybody-hands-up-heads-down_oapnxq.mp4",
    answers: ["Tim Burton", "Zack Snyder", "Christopher Nolan", "Joss Whedon"],
    correctAnswer: 2,
    movie: "The Dark Knight",
    year: 2008
  },
  {
    id: 59,
    question: "What movie is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091876/all-right-everybody-hands-up-heads-down_oapnxq.mp4",
    answers: ["Batman Begins", "The Dark Knight", "The Dark Knight Rises", "Joker"],
    correctAnswer: 1,
    movie: "The Dark Knight",
    year: 2008
  },
  {
    id: 60,
    question: "What superhero appears in this movie?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091876/all-right-everybody-hands-up-heads-down_oapnxq.mp4",
    answers: ["Superman", "Batman", "Spider-Man", "Iron Man"],
    correctAnswer: 1,
    movie: "The Dark Knight",
    year: 2008
  },
  {
    id: 61,
    question: "Who is the main villain of the movie?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091876/all-right-everybody-hands-up-heads-down_oapnxq.mp4",
    answers: ["The Riddler", "The Penguin", "Bane", "The Joker"],
    correctAnswer: 3,
    movie: "The Dark Knight",
    year: 2008
  },
  {
    id: 62,
    question: "What city does this movie take place in?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091876/all-right-everybody-hands-up-heads-down_oapnxq.mp4",
    answers: ["Metropolis", "Gotham", "Star City", "Central City"],
    correctAnswer: 1,
    movie: "The Dark Knight",
    year: 2008
  },
  {
    id: 63,
    question: "What real-life city is Gotham based on?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757091876/all-right-everybody-hands-up-heads-down_oapnxq.mp4",
    answers: ["New York", "Los Angeles", "Chicago", "Detroit"],
    correctAnswer: 2,
    movie: "The Dark Knight",
    year: 2008
  },
  // The Wolf of Wall Street Questions
  {
    id: 64,
    question: "What movie is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757092690/yep-on-a-daily-basis-i-consume-enough-drugs_tomsnp.mp4",
    answers: ["The Wolf of Wall Street", "Boiler Room", "Wall Street", "The Big Short"],
    correctAnswer: 0,
    movie: "The Wolf of Wall Street",
    year: 2013
  },
  {
    id: 65,
    question: "What three places does the character mention?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757092690/yep-on-a-daily-basis-i-consume-enough-drugs_tomsnp.mp4",
    answers: ["Brooklyn, The Bronx, and Staten Island", "Manhattan, Long Island, and Queens", "New Jersey, Connecticut, and Pennsylvania", "Boston, Philadelphia, and Washington D.C."],
    correctAnswer: 1,
    movie: "The Wolf of Wall Street",
    year: 2013
  },
  {
    id: 66,
    question: "What does the character say he takes for back pain?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757092690/yep-on-a-daily-basis-i-consume-enough-drugs_tomsnp.mp4",
    answers: ["Xanax", "Adderall", "Cocaine", "Quaaludes"],
    correctAnswer: 3,
    movie: "The Wolf of Wall Street",
    year: 2013
  },
  {
    id: 67,
    question: "How many different drugs are mentioned?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757092690/yep-on-a-daily-basis-i-consume-enough-drugs_tomsnp.mp4",
    answers: ["4", "5", "6", "7"],
    correctAnswer: 2,
    movie: "The Wolf of Wall Street",
    year: 2013
  },
  {
    id: 68,
    question: "What is the main character's name?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757092690/yep-on-a-daily-basis-i-consume-enough-drugs_tomsnp.mp4",
    answers: ["Mr. Hanna", "Mr. Porush", "Mr. Jones", "Mr. Jordan"],
    correctAnswer: 3,
    movie: "The Wolf of Wall Street",
    year: 2013
  },
  {
    id: 69,
    question: "What is the driver's name?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757092690/yep-on-a-daily-basis-i-consume-enough-drugs_tomsnp.mp4",
    answers: ["John", "Steve", "Blake", "Mark"],
    correctAnswer: 2,
    movie: "The Wolf of Wall Street",
    year: 2013
  },
  // Shrek Questions
  {
    id: 70,
    question: "What movie is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757097402/you-didnt-slay-the-dragon_1080p_clip_ywsj46.mp4",
    answers: ["Shrek", "Ice Age", "Madagascar", "Kung Fu Panda"],
    correctAnswer: 0,
    movie: "Shrek",
    year: 2001
  },
  {
    id: 71,
    question: "What is the name of the main character?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757097402/you-didnt-slay-the-dragon_1080p_clip_ywsj46.mp4",
    answers: ["Donkey", "Lord Farquaad", "Puss in Boots", "Shrek"],
    correctAnswer: 3,
    movie: "Shrek",
    year: 2001
  },
  {
    id: 72,
    question: "What is the name of the princess?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757097402/you-didnt-slay-the-dragon_1080p_clip_ywsj46.mp4",
    answers: ["Cinderella", "Fiona", "Snow White", "Aurora"],
    correctAnswer: 1,
    movie: "Shrek",
    year: 2001
  },
  {
    id: 73,
    question: "Who voices Shrek?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757097402/you-didnt-slay-the-dragon_1080p_clip_ywsj46.mp4",
    answers: ["Eddie Murphy", "Mike Myers", "John Lithgow", "Chris Farley"],
    correctAnswer: 1,
    movie: "Shrek",
    year: 2001
  },
  {
    id: 74,
    question: "Who voices the princess?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757097402/you-didnt-slay-the-dragon_1080p_clip_ywsj46.mp4",
    answers: ["Cameron Diaz", "Drew Barrymore", "Lucy Liu", "Kristen Wiig"],
    correctAnswer: 0,
    movie: "Shrek",
    year: 2001
  },
  {
    id: 75,
    question: "What is the subject of the large book shown in the background of the scene?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757097402/you-didnt-slay-the-dragon_1080p_clip_ywsj46.mp4",
    answers: ["Dragon Slaying", "Knightly Treats", "Castle Architecture", "Fairy Tales"],
    correctAnswer: 1,
    movie: "Shrek",
    year: 2001
  },
  // Scooby-Doo Questions
  {
    id: 76,
    question: "What was the subtitle of this movie's sequel?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757097848/you-guys-look-i-know-im-just-the-dude-carries-the-bags_lpl087.mp4",
    answers: ["The Mystery Begins", "Monsters Unleashed", "Curse of the Lake Monster", "Return of the Phantosaur"],
    correctAnswer: 1,
    movie: "Scooby-Doo",
    year: 2002
  },
  {
    id: 77,
    question: "What is the name of the van that the group uses?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757097848/you-guys-look-i-know-im-just-the-dude-carries-the-bags_lpl087.mp4",
    answers: ["The Mystery Machine", "The Ghost Chaser", "The Spooky Mobile", "The Ghoul Getter"],
    correctAnswer: 0,
    movie: "Scooby-Doo",
    year: 2002
  },
  {
    id: 78,
    question: "What kind of sauce is Velma?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757097848/you-guys-look-i-know-im-just-the-dude-carries-the-bags_lpl087.mp4",
    answers: ["Ketchup", "Mustard", "Mayonnaise", "Relish"],
    correctAnswer: 1,
    movie: "Scooby-Doo",
    year: 2002
  },
  {
    id: 79,
    question: "What color is Daphne's scarf?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757097848/you-guys-look-i-know-im-just-the-dude-carries-the-bags_lpl087.mp4",
    answers: ["Purple", "Blue", "Green", "Pink"],
    correctAnswer: 2,
    movie: "Scooby-Doo",
    year: 2002
  },
  {
    id: 80,
    question: "What is the name of the toy company they are standing in front of?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757097848/you-guys-look-i-know-im-just-the-dude-carries-the-bags_lpl087.mp4",
    answers: ["Wow-O", "Toy Town", "Fun Factory", "Play Place"],
    correctAnswer: 0,
    movie: "Scooby-Doo",
    year: 2002
  },
  {
    id: 81,
    question: "What does the license plate of the van say?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757097848/you-guys-look-i-know-im-just-the-dude-carries-the-bags_lpl087.mp4",
    answers: ["MYST INC", "SCOOBY", "GHOSTS", "ZOINKS"],
    correctAnswer: 0,
    movie: "Scooby-Doo",
    year: 2002
  },
  {
    id: 82,
    question: "What town is the group from?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757097848/you-guys-look-i-know-im-just-the-dude-carries-the-bags_lpl087.mp4",
    answers: ["Crystal Cove", "Coolsville", "Spookyville", "Monsterton"],
    correctAnswer: 1,
    movie: "Scooby-Doo",
    year: 2002
  },
  // Stranger Things Questions
  {
    id: 83,
    question: "What show is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757098454/i-told-you-keep-quiet_nvkkyx.mp4",
    answers: ["Stranger Things", "The Goonies", "E.T. the Extra-Terrestrial", "It"],
    correctAnswer: 0,
    movie: "Stranger Things",
    year: 2016
  },
  {
    id: 84,
    question: "What is the creature in the containment box called?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757098454/i-told-you-keep-quiet_nvkkyx.mp4",
    answers: ["The Tadpole", "The Pollywog", "The Slug", "The Larva"],
    correctAnswer: 1,
    movie: "Stranger Things",
    year: 2016
  },
  {
    id: 85,
    question: "What is the name of the turtle?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757098454/i-told-you-keep-quiet_nvkkyx.mp4",
    answers: ["Myrtle", "Sheldon", "Squirtle", "Yurtle"],
    correctAnswer: 3,
    movie: "Stranger Things",
    year: 2016
  },
  {
    id: 86,
    question: "What kind of uniform is the boy wearing?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757098454/i-told-you-keep-quiet_nvkkyx.mp4",
    answers: ["Karate Kid", "Star Wars", "Ghostbusters", "Indiana Jones"],
    correctAnswer: 2,
    movie: "Stranger Things",
    year: 2016
  },
  // Pulp Fiction Questions
  {
    id: 87,
    question: "What movie is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757098855/you-came-close-you-never-made-it_m01jeq.mp4",
    answers: ["Reservoir Dogs", "Pulp Fiction", "Goodfellas", "Fargo"],
    correctAnswer: 1,
    movie: "Pulp Fiction",
    year: 1994
  },
  {
    id: 88,
    question: "Who directed this movie?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757098855/you-came-close-you-never-made-it_m01jeq.mp4",
    answers: ["Martin Scorsese", "The Coen Brothers", "Robert Rodriguez", "Quentin Tarantino"],
    correctAnswer: 3,
    movie: "Pulp Fiction",
    year: 1994
  },
  // Breaking Bad Questions
  {
    id: 89,
    question: "What show is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757099097/say-understand_qugl0q.mp4",
    answers: ["The Sopranos", "The Wire", "Breaking Bad", "Mad Men"],
    correctAnswer: 2,
    movie: "Breaking Bad",
    year: 2008
  },
  {
    id: 90,
    question: "What alias does the main character use in this show?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757099097/say-understand_qugl0q.mp4",
    answers: ["Schrödinger", "Oppenheimer", "Einstein", "Heisenberg"],
    correctAnswer: 3,
    movie: "Breaking Bad",
    year: 2008
  },
  {
    id: 91,
    question: "What is the name of this character's lawyer?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757099097/say-understand_qugl0q.mp4",
    answers: ["Saul Goodman", "Perry Mason", "Atticus Finch", "Matlock"],
    correctAnswer: 0,
    movie: "Breaking Bad",
    year: 2008
  },
  {
    id: 92,
    question: "What kind of car does the character drive?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757099097/say-understand_qugl0q.mp4",
    answers: ["Chrysler PT Cruiser", "Pontiac Aztek", "Chevrolet HHR", "Ford Pinto"],
    correctAnswer: 1,
    movie: "Breaking Bad",
    year: 2008
  },
  {
    id: 93,
    question: "Where does the majority of this show take place?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757099097/say-understand_qugl0q.mp4",
    answers: ["Phoenix", "El Paso", "Santa Fe", "Albuquerque"],
    correctAnswer: 3,
    movie: "Breaking Bad",
    year: 2008
  },
  // Mr. Robot Questions
  {
    id: 94,
    question: "What show is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757099461/to-replace-the-syrian-president_synvhm.mp4",
    answers: ["Black Mirror", "Silicon Valley", "Mr. Robot", "Person of Interest"],
    correctAnswer: 2,
    movie: "Mr. Robot",
    year: 2015
  },
  {
    id: 95,
    question: "What country does the news say might be annexed?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757099461/to-replace-the-syrian-president_synvhm.mp4",
    answers: ["Nigeria", "The Congo", "Sudan", "Ethiopia"],
    correctAnswer: 1,
    movie: "Mr. Robot",
    year: 2015
  },
  {
    id: 96,
    question: "What news channel is being shown?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757099461/to-replace-the-syrian-president_synvhm.mp4",
    answers: ["WABC-TV", "CNN", "MSNBC", "NY1"],
    correctAnswer: 3,
    movie: "Mr. Robot",
    year: 2015
  },
  // Parasite Questions
  {
    id: 97,
    question: "What movie is this?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757099775/acting-one-thing-but-family-so-gullible-right-s1_efaoy5.mp4",
    answers: ["Roma", "Oldboy", "Parasite", "The Handmaiden"],
    correctAnswer: 2,
    movie: "Parasite",
    year: 2019
  },
  {
    id: 98,
    question: "Counting the dog, how many living beings are in the room?",
    videoUrl: "https://res.cloudinary.com/dj6f471nj/video/upload/v1757099775/acting-one-thing-but-family-so-gullible-right-s1_efaoy5.mp4",
    answers: ["3", "4", "5", "6"],
    correctAnswer: 2,
    movie: "Parasite",
    year: 2019
  }
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

    const questionsByMovie = {};
    for (const q of movieQuestions) {
      if (!questionsByMovie[q.movie]) {
        questionsByMovie[q.movie] = [];
      }
      questionsByMovie[q.movie].push(q);
    }

    const uniqueMovies = Object.keys(questionsByMovie);
    const shuffledMovies = uniqueMovies.sort(() => 0.5 - Math.random());
    
    const gameQuestions = [];
    const moviesForGame = shuffledMovies.slice(0, QUESTIONS_PER_GAME);

    for (const movie of moviesForGame) {
      const questionsForMovie = questionsByMovie[movie];
      const randomQuestion = questionsForMovie[Math.floor(Math.random() * questionsForMovie.length)];
      gameQuestions.push(randomQuestion);
    }

    games[code] = {
      mainScreenId: socket.id,
      players: {},
      currentQuestionIndex: 0,
      gameState: 'waiting',
      questions: gameQuestions,
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

    const questionTimer = 10;
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
