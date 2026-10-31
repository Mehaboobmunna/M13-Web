export interface WorldQuote {
  quote: string;
  author: string;
  origin: string;
  category: 'Philosophy' | 'Proverb' | 'Literature' | 'Science' | 'Wisdom';
}

export const WORLD_QUOTES: WorldQuote[] = [
  // Philosophy & Ancient Wisdom
  {
    quote: "The unexamined life is not worth living.",
    author: "Socrates",
    origin: "Ancient Greece",
    category: "Philosophy"
  },
  {
    quote: "Knowing others is intelligence; knowing yourself is true wisdom.",
    author: "Lao Tzu",
    origin: "Ancient China",
    category: "Philosophy"
  },
  {
    quote: "We are shaped by our thoughts; we become what we think.",
    author: "Buddha",
    origin: "Ancient India",
    category: "Wisdom"
  },
  {
    quote: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
    origin: "Germany",
    category: "Philosophy"
  },
  {
    quote: "Happiness depends upon ourselves.",
    author: "Aristotle",
    origin: "Ancient Greece",
    category: "Philosophy"
  },
  {
    quote: "An eye for an eye will only make the whole world blind.",
    author: "Mahatma Gandhi",
    origin: "India",
    category: "Wisdom"
  },
  {
    quote: "Be the change that you wish to see in the world.",
    author: "Mahatma Gandhi",
    origin: "India",
    category: "Wisdom"
  },
  {
    quote: "To know what you know and what you do not know, that is true knowledge.",
    author: "Confucius",
    origin: "Ancient China",
    category: "Philosophy"
  },
  {
    quote: "Turn your face to the sun and the shadows fall behind you.",
    author: "Maori Proverb",
    origin: "New Zealand",
    category: "Proverb"
  },
  {
    quote: "Fall seven times, stand up eight.",
    author: "Japanese Proverb",
    origin: "Japan",
    category: "Proverb"
  },

  // Global Proverbs & Traditions
  {
    quote: "Smooth seas do not make skillful sailors.",
    author: "African Proverb",
    origin: "Africa",
    category: "Proverb"
  },
  {
    quote: "If you want to go fast, go alone. If you want to go far, go together.",
    author: "African Proverb",
    origin: "Africa",
    category: "Proverb"
  },
  {
    quote: "A journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
    origin: "Ancient China",
    category: "Proverb"
  },
  {
    quote: "The bamboo that bends is stronger than the oak that resists.",
    author: "Japanese Proverb",
    origin: "Japan",
    category: "Proverb"
  },
  {
    quote: "When the root is deep, there is no reason to fear the wind.",
    author: "Chinese Proverb",
    origin: "China",
    category: "Proverb"
  },
  {
    quote: "Not all who wander are lost.",
    author: "J.R.R. Tolkien",
    origin: "United Kingdom",
    category: "Literature"
  },
  {
    quote: "Dwell not on the past, do not dream of the future, concentrate the mind on the present moment.",
    author: "Buddha",
    origin: "Ancient India",
    category: "Wisdom"
  },
  {
    quote: "Vision without action is merely a dream. Action without vision is just passing time. Action with vision can change the world.",
    author: "Nelson Mandela",
    origin: "South Africa",
    category: "Wisdom"
  },
  {
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    origin: "South Africa",
    category: "Wisdom"
  },
  {
    quote: "Excellence is not an act, but a habit.",
    author: "Will Durant / Aristotle",
    origin: "Greece / USA",
    category: "Philosophy"
  },

  // Literature & Art
  {
    quote: "All that we see or seem is but a dream within a dream.",
    author: "Edgar Allan Poe",
    origin: "United States",
    category: "Literature"
  },
  {
    quote: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    author: "Ralph Waldo Emerson",
    origin: "United States",
    category: "Literature"
  },
  {
    quote: "In the depth of winter, I finally learned that within me there lay an invincible summer.",
    author: "Albert Camus",
    origin: "France",
    category: "Literature"
  },
  {
    quote: "It is better to be hated for what you are than to be loved for what you are not.",
    author: "André Gide",
    origin: "France",
    category: "Literature"
  },
  {
    quote: "There is no friend as loyal as a book.",
    author: "Ernest Hemingway",
    origin: "United States",
    category: "Literature"
  },
  {
    quote: "The fool doth think he is wise, but the wise man knows himself to be a fool.",
    author: "William Shakespeare",
    origin: "United Kingdom",
    category: "Literature"
  },
  {
    quote: "Whatever our souls are made of, his and mine are the same.",
    author: "Emily Brontë",
    origin: "United Kingdom",
    category: "Literature"
  },
  {
    quote: "Logic will get you from A to B. Imagination will take you everywhere.",
    author: "Albert Einstein",
    origin: "Germany / Switzerland",
    category: "Science"
  },
  {
    quote: "The important thing is not to stop questioning. Curiosity has its own reason for existing.",
    author: "Albert Einstein",
    origin: "Germany",
    category: "Science"
  },
  {
    quote: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
    author: "Marie Curie",
    origin: "Poland / France",
    category: "Science"
  },

  // Science, Exploration & Modern Wisdom
  {
    quote: "That’s one small step for man, one giant leap for mankind.",
    author: "Neil Armstrong",
    origin: "United States",
    category: "Science"
  },
  {
    quote: "Castles in the air may cost nothing, but their construction may cost lives.",
    author: "François Mauriac",
    origin: "France",
    category: "Literature"
  },
  {
    quote: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    origin: "Italy",
    category: "Wisdom"
  },
  {
    quote: "Learning never exhausts the mind.",
    author: "Leonardo da Vinci",
    origin: "Italy",
    category: "Wisdom"
  },
  {
    quote: "Be curious, not judgmental.",
    author: "Walt Whitman",
    origin: "United States",
    category: "Literature"
  },
  {
    quote: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
    author: "Rumi",
    origin: "Persia",
    category: "Philosophy"
  },
  {
    quote: "The wound is the place where the Light enters you.",
    author: "Rumi",
    origin: "Persia",
    category: "Philosophy"
  },
  {
    quote: "Silence is the language of God, all else is poor translation.",
    author: "Rumi",
    origin: "Persia",
    category: "Philosophy"
  },
  {
    quote: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    author: "Buddha",
    origin: "Ancient India",
    category: "Wisdom"
  },
  {
    quote: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    origin: "Ancient India",
    category: "Wisdom"
  },

  // Additional World Proveds & Maxims
  {
    quote: "A bird does not sing because it has an answer, it sings because it has a song.",
    author: "Chinese Proverb",
    origin: "China",
    category: "Proverb"
  },
  {
    quote: "Patience is a tree whose root is bitter, but its fruit is very sweet.",
    author: "Persian Proverb",
    origin: "Persia",
    category: "Proverb"
  },
  {
    quote: "He who learns but does not think, is lost. He who thinks but does not learn is in great danger.",
    author: "Confucius",
    origin: "Ancient China",
    category: "Philosophy"
  },
  {
    quote: "Real knowledge is to know the extent of one's ignorance.",
    author: "Confucius",
    origin: "Ancient China",
    category: "Philosophy"
  },
  {
    quote: "We do not inherit the earth from our ancestors, we borrow it from our children.",
    author: "Native American Proverb",
    origin: "Native America",
    category: "Proverb"
  },
  {
    quote: "Listen to the wind, it talks. Listen to the silence, it speaks. Listen to your heart, it knows.",
    author: "Native American Proverb",
    origin: "Native America",
    category: "Proverb"
  },
  {
    quote: "Every flower is a soul blossoming in nature.",
    author: "Gerard De Nerval",
    origin: "France",
    category: "Literature"
  },
  {
    quote: "Rivers never reverse their flow; neither do words spoken.",
    author: "Inuit Proverb",
    origin: "Arctic",
    category: "Proverb"
  },
  {
    quote: "A house divided against itself cannot stand.",
    author: "Abraham Lincoln",
    origin: "United States",
    category: "Wisdom"
  },
  {
    quote: "Courage is resistance to fear, mastery of fear—not absence of fear.",
    author: "Mark Twain",
    origin: "United States",
    category: "Literature"
  },
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    origin: "United States",
    category: "Wisdom"
  },
  {
    quote: "To live is the rarest thing in the world. Most people exist, that is all.",
    author: "Oscar Wilde",
    origin: "Ireland",
    category: "Literature"
  }
];

export function getRandomWorldQuote(): WorldQuote {
  const index = Math.floor(Math.random() * WORLD_QUOTES.length);
  return WORLD_QUOTES[index];
}
