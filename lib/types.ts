export type Session = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  start: string | null;
  end: string | null;
  venue: string | null;
  hall: string | null;
  categories: string[];
  genres: string[];
  img: string | null;
  featured: boolean;
  trending: boolean;
  canceled: boolean;
  score: number;
  reasons: string[];
};

export type Meta = {
  days: string[];
  categories: [string, number][];
  venues: [string, number][];
  total: number;
};
