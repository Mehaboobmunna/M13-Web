export interface Quote {
  text: string;
  author: string;
}

export const POPULAR_QUOTES: Quote[] = [
  { text: "It's dangerous to go alone! Take this.", author: "The Legend of Zelda" },
  { text: "The cake is a lie.", author: "Portal" },
  { text: "Stand in the ashes of a trillion dead souls and ask the ghosts if honor matters. The silence is your answer.", author: "Mass Effect 3" },
  { text: "What is a man? A miserable little pile of secrets.", author: "Castlevania: Symphony of the Night" },
  { text: "War never changes.", author: "Fallout" },
  { text: "A hero need not speak. When he is gone, the world will speak for him.", author: "Halo" },
  { text: "Do a barrel roll!", author: "Star Fox 64" },
  { text: "Stay a while and listen.", author: "Diablo II" },
  { text: "Praise the Sun!", author: "Dark Souls" },
  { text: "Would you kindly...", author: "BioShock" },
  { text: "Easy is the path of wisdom for those who seek truth without fear.", author: "Marcus Aurelius" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
  { text: "Fix the cause, not the symptom.", author: "Steve Maguire" },
  { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "Knowledge is power.", author: "Francis Bacon" },
  { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
  { text: "Whatever you are, be a good one.", author: "Abraham Lincoln" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Everything you can imagine is real.", author: "Pablo Picasso" },
  { text: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" },
  { text: "An unexamined life is not worth living.", author: "Socrates" },
  { text: "Whether you think you can or you think you can’t, you’re right.", author: "Henry Ford" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Everything has beauty, but not everyone sees it.", author: "Confucius" },
  { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" }
];

export function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * POPULAR_QUOTES.length);
  return POPULAR_QUOTES[randomIndex];
}
