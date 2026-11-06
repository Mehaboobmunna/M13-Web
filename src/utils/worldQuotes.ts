export type QuoteCategory =
  | 'Mindset & Grit'
  | 'Habits & Discipline'
  | 'Focus & Deep Work'
  | 'Stoicism & Peace'
  | 'Mindfulness & Purpose'
  | 'Mastery & Craft'
  | 'Philosophy'
  | 'Proverb'
  | 'Literature'
  | 'Science'
  | 'Wisdom';

export interface WorldQuote {
  id: string;
  quote: string;
  author: string;
  origin: string;
  category: QuoteCategory;
  lesson?: string; // Optional takeaway insight like a self-help book note
}

export const WORLD_QUOTES: WorldQuote[] = [
  // --- MINDSET & GRIT ---
  {
    id: "mg-1",
    quote: "Everything can be taken from a man but one thing: the last of the human freedoms—to choose one's attitude in any given set of circumstances.",
    author: "Viktor Frankl",
    origin: "Austria / Man's Search for Meaning",
    category: "Mindset & Grit",
    lesson: "You cannot always control events, but you always control your internal response."
  },
  {
    id: "mg-2",
    quote: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
    origin: "Germany",
    category: "Mindset & Grit",
    lesson: "Clarify your core purpose to build indestructible resilience."
  },
  {
    id: "mg-3",
    quote: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    origin: "Germany",
    category: "Mindset & Grit",
    lesson: "Every problem contains the seed of its own resolution."
  },
  {
    id: "mg-4",
    quote: "The view that abilities can be developed has a profound effect on how you learn and navigate life.",
    author: "Carol Dweck",
    origin: "United States / Growth Mindset",
    category: "Mindset & Grit",
    lesson: "Embrace challenge as fuel for neural adaptation."
  },
  {
    id: "mg-5",
    quote: "Enthusiasm is common. Endurance is rare.",
    author: "Angela Duckworth",
    origin: "United States / Grit",
    category: "Mindset & Grit",
    lesson: "Consistency over time outperforms temporary bursts of inspiration."
  },
  {
    id: "mg-6",
    quote: "Don't stop when you're tired. Stop when you're done.",
    author: "David Goggins",
    origin: "United States / Can't Hurt Me",
    category: "Mindset & Grit",
    lesson: "Your mind surrenders long before your body reaches its true physical limit."
  },
  {
    id: "mg-7",
    quote: "The obstacle in the path becomes the path. Never forget, within every obstacle is an opportunity to improve our condition.",
    author: "Ryan Holiday / Marcus Aurelius",
    origin: "United States / Stoicism",
    category: "Mindset & Grit",
    lesson: "Reframe adversity as mandatory training."
  },
  {
    id: "mg-8",
    quote: "Fall seven times, stand up eight.",
    author: "Japanese Proverb",
    origin: "Japan",
    category: "Mindset & Grit",
    lesson: "Resilience is simply refusing to let defeat have the final word."
  },
  {
    id: "mg-9",
    quote: "Smooth seas do not make skillful sailors.",
    author: "African Proverb",
    origin: "Africa",
    category: "Mindset & Grit",
    lesson: "Trial and friction forge true competence."
  },
  {
    id: "mg-10",
    quote: "Courage is not the absence of fear, but the triumph over it.",
    author: "Nelson Mandela",
    origin: "South Africa",
    category: "Mindset & Grit",
    lesson: "Act in spite of apprehension."
  },
  {
    id: "mg-11",
    quote: "The human mind, once stretched by a new idea, never regains its original dimensions.",
    author: "Oliver Wendell Holmes Jr.",
    origin: "United States",
    category: "Mindset & Grit"
  },
  {
    id: "mg-12",
    quote: "Permanent change occurs only when your self-identity updates to match your target behavior.",
    author: "James Clear",
    origin: "United States / Atomic Habits",
    category: "Mindset & Grit"
  },

  // --- HABITS & DISCIPLINE ---
  {
    id: "hd-1",
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Will Durant / Aristotle",
    origin: "United States / Ancient Greece",
    category: "Habits & Discipline",
    lesson: "Small daily actions compound exponentially over years."
  },
  {
    id: "hd-2",
    quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear",
    origin: "United States / Atomic Habits",
    category: "Habits & Discipline",
    lesson: "Focus 90% of your energy on designing frictionless environment systems."
  },
  {
    id: "hd-3",
    quote: "Discipline equals freedom.",
    author: "Jocko Willink",
    origin: "United States / Extreme Ownership",
    category: "Habits & Discipline",
    lesson: "Structure creates the space for creative freedom."
  },
  {
    id: "hd-4",
    quote: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun",
    origin: "United States",
    category: "Habits & Discipline"
  },
  {
    id: "hd-5",
    quote: "Sow a thought and you reap an action; sow an act and you reap a habit; sow a habit and you reap a character; sow a character and you reap a destiny.",
    author: "Stephen Covey",
    origin: "United States / 7 Habits",
    category: "Habits & Discipline"
  },
  {
    id: "hd-6",
    quote: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
    author: "John C. Maxwell",
    origin: "United States",
    category: "Habits & Discipline"
  },
  {
    id: "hd-7",
    quote: "The secret of your future is hidden in your daily routine.",
    author: "Mike Murdock",
    origin: "United States",
    category: "Habits & Discipline"
  },
  {
    id: "hd-8",
    quote: "Chains of habit are too light to be felt until they are too heavy to be broken.",
    author: "Warren Buffett",
    origin: "United States",
    category: "Habits & Discipline"
  },
  {
    id: "hd-9",
    quote: "First we make our habits, then our habits make us.",
    author: "John Dryden",
    origin: "United Kingdom",
    category: "Habits & Discipline"
  },
  {
    id: "hd-10",
    quote: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
    origin: "Spain",
    category: "Habits & Discipline"
  },

  // --- FOCUS & DEEP WORK ---
  {
    id: "fd-1",
    quote: "If you reorganize your professional life to prioritize depth, you will unlock tremendous economic and creative value.",
    author: "Cal Newport",
    origin: "United States / Deep Work",
    category: "Focus & Deep Work",
    lesson: "Uninterrupted focus is the superpower of the 21st century."
  },
  {
    id: "fd-2",
    quote: "A calm mind, a fit body, a house full of love. These things cannot be bought—they must be earned.",
    author: "Naval Ravikant",
    origin: "India / United States",
    category: "Focus & Deep Work",
    lesson: "Prioritize internal peace and high-leverage mental clarity."
  },
  {
    id: "fd-3",
    quote: "Flow is the state of total immersion where self-consciousness disappears and performance peaks.",
    author: "Mihaly Csikszentmihalyi",
    origin: "Hungary / Flow",
    category: "Focus & Deep Work"
  },
  {
    id: "fd-4",
    quote: "Beware the barrenness of a busy life.",
    author: "Socrates",
    origin: "Ancient Greece",
    category: "Focus & Deep Work",
    lesson: "Do not confuse motion with progress."
  },
  {
    id: "fd-5",
    quote: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca",
    origin: "Ancient Rome",
    category: "Focus & Deep Work",
    lesson: "Ruthlessly eliminate distraction to preserve your life's currency."
  },
  {
    id: "fd-6",
    quote: "Lack of direction, not lack of time, is the problem. We all have twenty-four hour days.",
    author: "Zig Ziglar",
    origin: "United States",
    category: "Focus & Deep Work"
  },
  {
    id: "fd-7",
    quote: "Where your attention goes, your energy flows and your life grows.",
    author: "Tony Robbins",
    origin: "United States",
    category: "Focus & Deep Work"
  },
  {
    id: "fd-8",
    quote: "Starve your distractions, feed your focus.",
    author: "Unknown Author",
    origin: "Wisdom Tradition",
    category: "Focus & Deep Work"
  },
  {
    id: "fd-9",
    quote: "Multitasking is merely the opportunity to screw up more than one thing at a time.",
    author: "Steve Uzzell",
    origin: "United States",
    category: "Focus & Deep Work"
  },
  {
    id: "fd-10",
    quote: "Focus is a matter of deciding what things you're not going to do.",
    author: "John Carmack",
    origin: "United States / Doom & id Software",
    category: "Focus & Deep Work"
  },

  // --- STOICISM & PEACE ---
  {
    id: "sp-1",
    quote: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    origin: "Ancient Rome / Meditations",
    category: "Stoicism & Peace"
  },
  {
    id: "sp-2",
    quote: "Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control.",
    author: "Epictetus",
    origin: "Ancient Greece",
    category: "Stoicism & Peace"
  },
  {
    id: "sp-3",
    quote: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    origin: "Ancient Rome",
    category: "Stoicism & Peace"
  },
  {
    id: "sp-4",
    quote: "The tranquility that comes when you stop caring what others say or think, and focus solely on what you do.",
    author: "Marcus Aurelius",
    origin: "Ancient Rome",
    category: "Stoicism & Peace"
  },
  {
    id: "sp-5",
    quote: "No man is free who is not master of himself.",
    author: "Epictetus",
    origin: "Ancient Greece",
    category: "Stoicism & Peace"
  },
  {
    id: "sp-6",
    quote: "He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.",
    author: "Epictetus",
    origin: "Ancient Greece",
    category: "Stoicism & Peace"
  },
  {
    id: "sp-7",
    quote: "When you arise in the morning think of what a privilege it is to be alive, to think, to enjoy, to love.",
    author: "Marcus Aurelius",
    origin: "Ancient Rome",
    category: "Stoicism & Peace"
  },
  {
    id: "sp-8",
    quote: "If someone is able to show me that what I think or do is not right, I will happily change, for I seek the truth.",
    author: "Marcus Aurelius",
    origin: "Ancient Rome",
    category: "Stoicism & Peace"
  },
  {
    id: "sp-9",
    quote: "Associate with people who are likely to improve you.",
    author: "Seneca",
    origin: "Ancient Rome",
    category: "Stoicism & Peace"
  },
  {
    id: "sp-10",
    quote: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    origin: "Ancient India",
    category: "Stoicism & Peace"
  },

  // --- MINDFULNESS & PURPOSE ---
  {
    id: "mp-1",
    quote: "Realize deeply that the present moment is all you have. Make the NOW the primary focus of your life.",
    author: "Eckhart Tolle",
    origin: "Germany / The Power of Now",
    category: "Mindfulness & Purpose",
    lesson: "Anxiety resides in the future; peace exists only in the current breath."
  },
  {
    id: "mp-2",
    quote: "Until you make the unconscious conscious, it will direct your life and you will call it fate.",
    author: "Carl Jung",
    origin: "Switzerland",
    category: "Mindfulness & Purpose"
  },
  {
    id: "mp-3",
    quote: "Your vision will become clear only when you can look into your own heart. Who looks outside, dreams; who looks inside, awakes.",
    author: "Carl Jung",
    origin: "Switzerland",
    category: "Mindfulness & Purpose"
  },
  {
    id: "mp-4",
    quote: "Life isn't about finding yourself. Life is about creating yourself.",
    author: "George Bernard Shaw",
    origin: "Ireland",
    category: "Mindfulness & Purpose"
  },
  {
    id: "mp-5",
    quote: "The privilege of a lifetime is to become who you truly are.",
    author: "Carl Jung",
    origin: "Switzerland",
    category: "Mindfulness & Purpose"
  },
  {
    id: "mp-6",
    quote: "The meaning of life is to find your gift. The purpose of life is to give it away.",
    author: "Pablo Picasso",
    origin: "Spain",
    category: "Mindfulness & Purpose"
  },
  {
    id: "mp-7",
    quote: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
    author: "Rumi",
    origin: "Persia",
    category: "Mindfulness & Purpose"
  },
  {
    id: "mp-8",
    quote: "Silence is the language of God, all else is poor translation.",
    author: "Rumi",
    origin: "Persia",
    category: "Mindfulness & Purpose"
  },
  {
    id: "mp-9",
    quote: "The wound is the place where the Light enters you.",
    author: "Rumi",
    origin: "Persia",
    category: "Mindfulness & Purpose"
  },
  {
    id: "mp-10",
    quote: "Be like water making its way through cracks. Do not be assertive, but adjust to the object, and you shall find a way around or through it.",
    author: "Bruce Lee",
    origin: "Hong Kong / United States",
    category: "Mindfulness & Purpose"
  },

  // --- MASTERY & CRAFTSMANSHIP ---
  {
    id: "mc-1",
    quote: "The future belongs to those who learn more skills and combine them in creative ways.",
    author: "Robert Greene",
    origin: "United States / Mastery",
    category: "Mastery & Craft"
  },
  {
    id: "mc-2",
    quote: "There are no shortcuts to any place worth going.",
    author: "Beverly Sills",
    origin: "United States",
    category: "Mastery & Craft"
  },
  {
    id: "mc-3",
    quote: "To know ten thousand things, know one well.",
    author: "Miyamoto Musashi",
    origin: "Japan / Book of Five Rings",
    category: "Mastery & Craft"
  },
  {
    id: "mc-4",
    quote: "Fix your mind on one task and complete it with total dedication, without concern for praise or blame.",
    author: "Miyamoto Musashi",
    origin: "Japan",
    category: "Mastery & Craft"
  },
  {
    id: "mc-5",
    quote: "Details create perfection, and perfection is not a detail.",
    author: "Leonardo da Vinci",
    origin: "Italy",
    category: "Mastery & Craft"
  },
  {
    id: "mc-6",
    quote: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    origin: "Italy",
    category: "Mastery & Craft"
  },
  {
    id: "mc-7",
    quote: "Learning never exhausts the mind.",
    author: "Leonardo da Vinci",
    origin: "Italy",
    category: "Mastery & Craft"
  },
  {
    id: "mc-8",
    quote: "Quality is not an act, it is a habit.",
    author: "Aristotle",
    origin: "Ancient Greece",
    category: "Mastery & Craft"
  },
  {
    id: "mc-9",
    quote: "Genius is one percent inspiration and ninety-nine percent perspiration.",
    author: "Thomas Edison",
    origin: "United States",
    category: "Mastery & Craft"
  },
  {
    id: "mc-10",
    quote: "An artist is not paid for his labor but for his vision.",
    author: "James Whistler",
    origin: "United States",
    category: "Mastery & Craft"
  },

  // --- CLASSIC PHILOSOPHY ---
  { id: "ph-1", quote: "Knowing others is intelligence; knowing yourself is true wisdom.", author: "Lao Tzu", origin: "Ancient China", category: "Philosophy" },
  { id: "ph-2", quote: "To know what you know and what you do not know, that is true knowledge.", author: "Confucius", origin: "Ancient China", category: "Philosophy" },
  { id: "ph-3", quote: "The only true wisdom is in knowing you know nothing.", author: "Socrates", origin: "Ancient Greece", category: "Philosophy" },
  { id: "ph-4", quote: "Ignorance is the root and stem of all evil.", author: "Plato", origin: "Ancient Greece", category: "Philosophy" },
  { id: "ph-5", quote: "Patience is bitter, but its fruit is sweet.", author: "Jean-Jacques Rousseau", origin: "France", category: "Philosophy" },
  { id: "ph-6", quote: "Man is born free, and everywhere he is in chains.", author: "Jean-Jacques Rousseau", origin: "France", category: "Philosophy" },
  { id: "ph-7", quote: "I think, therefore I am.", author: "René Descartes", origin: "France", category: "Philosophy" },
  { id: "ph-8", quote: "The unexamined life is not worth living.", author: "Socrates", origin: "Ancient Greece", category: "Philosophy" },
  { id: "ph-9", quote: "He who learns but does not think, is lost. He who thinks but does not learn is in great danger.", author: "Confucius", origin: "Ancient China", category: "Philosophy" },
  { id: "ph-10", quote: "Real knowledge is to know the extent of one's ignorance.", author: "Confucius", origin: "Ancient China", category: "Philosophy" },
  { id: "ph-11", quote: "Happiness is the state of mind in which everything is understandable.", author: "Baruch Spinoza", origin: "Netherlands", category: "Philosophy" },

  // --- GLOBAL PROVERBS ---
  { id: "pr-1", quote: "Turn your face to the sun and the shadows fall behind you.", author: "Maori Proverb", origin: "New Zealand", category: "Proverb" },
  { id: "pr-2", quote: "The bamboo that bends is stronger than the oak that resists.", author: "Japanese Proverb", origin: "Japan", category: "Proverb" },
  { id: "pr-3", quote: "When the root is deep, there is no reason to fear the wind.", author: "Chinese Proverb", origin: "China", category: "Proverb" },
  { id: "pr-4", quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", origin: "China", category: "Proverb" },
  { id: "pr-5", quote: "A tree with strong roots laughs at storms.", author: "Malay Proverb", origin: "Malaysia", category: "Proverb" },
  { id: "pr-6", quote: "When you drink the water, remember the spring.", author: "Chinese Proverb", origin: "China", category: "Proverb" },
  { id: "pr-7", quote: "A bird does not sing because it has an answer, it sings because it has a song.", author: "Chinese Proverb", origin: "China", category: "Proverb" },
  { id: "pr-8", quote: "Patience is a tree whose root is bitter, but its fruit is very sweet.", author: "Persian Proverb", origin: "Persia", category: "Proverb" },
  { id: "pr-9", quote: "We do not inherit the earth from our ancestors, we borrow it from our children.", author: "Native American Proverb", origin: "Native America", category: "Proverb" },
  { id: "pr-10", quote: "Listen to the wind, it talks. Listen to the silence, it speaks. Listen to your heart, it knows.", author: "Native American Proverb", origin: "Native America", category: "Proverb" },
  { id: "pr-11", quote: "Rivers never reverse their flow; neither do words spoken.", author: "Inuit Proverb", origin: "Arctic", category: "Proverb" },
  { id: "pr-12", quote: "He who has health has hope; and he who has hope has everything.", author: "Arabian Proverb", origin: "Middle East", category: "Proverb" },

  // --- LITERATURE & POETRY ---
  { id: "lt-1", quote: "Not all who wander are lost.", author: "J.R.R. Tolkien", origin: "United Kingdom", category: "Literature" },
  { id: "lt-2", quote: "All that we see or seem is but a dream within a dream.", author: "Edgar Allan Poe", origin: "United States", category: "Literature" },
  { id: "lt-3", quote: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson", origin: "United States", category: "Literature" },
  { id: "lt-4", quote: "In the depth of winter, I finally learned that within me there lay an invincible summer.", author: "Albert Camus", origin: "France", category: "Literature" },
  { id: "lt-5", quote: "It is better to be hated for what you are than to be loved for what you are not.", author: "André Gide", origin: "France", category: "Literature" },
  { id: "lt-6", quote: "There is no friend as loyal as a book.", author: "Ernest Hemingway", origin: "United States", category: "Literature" },
  { id: "lt-7", quote: "The fool doth think he is wise, but the wise man knows himself to be a fool.", author: "William Shakespeare", origin: "United Kingdom", category: "Literature" },
  { id: "lt-8", quote: "Whatever our souls are made of, his and mine are the same.", author: "Emily Brontë", origin: "United Kingdom", category: "Literature" },
  { id: "lt-9", quote: "Words are, in my not-so-humble opinion, our most inexhaustible source of magic.", author: "J.K. Rowling", origin: "United Kingdom", category: "Literature" },
  { id: "lt-10", quote: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson", origin: "United States", category: "Literature" },
  { id: "lt-11", quote: "There is beauty in truth, even if it's painful.", author: "John Keats", origin: "United Kingdom", category: "Literature" },

  // --- SCIENCE & CURIOSITY ---
  { id: "sc-1", quote: "Logic will get you from A to B. Imagination will take you everywhere.", author: "Albert Einstein", origin: "Germany / Switzerland", category: "Science" },
  { id: "sc-2", quote: "The important thing is not to stop questioning. Curiosity has its own reason for existing.", author: "Albert Einstein", origin: "Germany", category: "Science" },
  { id: "sc-3", quote: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.", author: "Marie Curie", origin: "Poland / France", category: "Science" },
  { id: "sc-4", quote: "That’s one small step for man, one giant leap for mankind.", author: "Neil Armstrong", origin: "United States", category: "Science" },
  { id: "sc-5", quote: "Somewhere, something incredible is waiting to be known.", author: "Carl Sagan", origin: "United States", category: "Science" },
  { id: "sc-6", quote: "The cosmos is within us. We are made of star-stuff. We are a way for the cosmos to know itself.", author: "Carl Sagan", origin: "United States", category: "Science" },
  { id: "sc-7", quote: "Science is a way of thinking much more than it is a body of knowledge.", author: "Carl Sagan", origin: "United States", category: "Science" },
  { id: "sc-8", quote: "Look up at the stars and not down at your feet. Try to make sense of what you see.", author: "Stephen Hawking", origin: "United Kingdom", category: "Science" },
  { id: "sc-9", quote: "Intelligence is the ability to adapt to change.", author: "Stephen Hawking", origin: "United Kingdom", category: "Science" },
  { id: "sc-10", quote: "The good thing about science is that it's true whether or not you believe in it.", author: "Neil deGrasse Tyson", origin: "United States", category: "Science" },
  { id: "sc-11", quote: "If I have seen further it is by standing on the shoulders of Giants.", author: "Isaac Newton", origin: "United Kingdom", category: "Science" },
  { id: "sc-12", quote: "What we know is a drop, what we don't know is an ocean.", author: "Isaac Newton", origin: "United Kingdom", category: "Science" },

  // --- GENERAL WISDOM ---
  { id: "ws-1", quote: "Vision without action is merely a dream. Action without vision is just passing time. Action with vision can change the world.", author: "Nelson Mandela", origin: "South Africa", category: "Wisdom" },
  { id: "ws-2", quote: "It always seems impossible until it's done.", author: "Nelson Mandela", origin: "South Africa", category: "Wisdom" },
  { id: "ws-3", quote: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi", origin: "India", category: "Wisdom" },
  { id: "ws-4", quote: "An eye for an eye will only make the whole world blind.", author: "Mahatma Gandhi", origin: "India", category: "Wisdom" },
  { id: "ws-5", quote: "Do not count the days, make the days count.", author: "Muhammad Ali", origin: "United States", category: "Wisdom" },
  { id: "ws-6", quote: "Service to others is the rent you pay for your room here on Earth.", author: "Muhammad Ali", origin: "United States", category: "Wisdom" },
  { id: "ws-7", quote: "Forgive your enemies, but never forget their names.", author: "John F. Kennedy", origin: "United States", category: "Wisdom" },
  { id: "ws-8", quote: "Those who dare to fail miserably can achieve greatly.", author: "John F. Kennedy", origin: "United States", category: "Wisdom" },
  { id: "ws-9", quote: "A house divided against itself cannot stand.", author: "Abraham Lincoln", origin: "United States", category: "Wisdom" },
  { id: "ws-10", quote: "The secret of getting ahead is getting started.", author: "Mark Twain", origin: "United States", category: "Wisdom" },
  { id: "ws-11", quote: "Small deeds done are better than great deeds planned.", author: "Peter Marshall", origin: "United States", category: "Wisdom" },
  { id: "ws-12", quote: "Act as if what you do makes a difference. It does.", author: "William James", origin: "United States", category: "Wisdom" },
  { id: "ws-13", quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", origin: "United States", category: "Wisdom" },
  { id: "ws-14", quote: "Keep your eyes on the stars, and your feet on the ground.", author: "Theodore Roosevelt", origin: "United States", category: "Wisdom" },
  { id: "ws-15", quote: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt", origin: "United States", category: "Wisdom" }
];

export function getRandomWorldQuote(categoryFilter?: QuoteCategory): WorldQuote {
  let list = WORLD_QUOTES;
  if (categoryFilter) {
    const filtered = WORLD_QUOTES.filter(q => q.category === categoryFilter);
    if (filtered.length > 0) list = filtered;
  }
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}
