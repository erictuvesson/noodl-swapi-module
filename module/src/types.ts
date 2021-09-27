export type Person = {
  name: string;
  birth_year: string;
  eye_color: string;
  gender: string;
  hair_color: string;
  height: string;
  mass: string;
  skin_color: string;
  homeworld: string;
  url: string;
  created: string;
  edited: string;

  films: Array<number>;
  species: Array<number>;
  starships: Array<number>;
  vehicles: Array<number>;
};

export type PersonCollection = {
  count: number;
  next: number | null;
  previous: number | null;
  results: Array<Person>;
};

export type Starship = {
  name: string;
  model: string;
  starship_class: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  crew: string;
  passengers: string;
  max_atmosphering_speed: string;
  hyperdrive_rating: string;
  MGLT: string;
  cargo_capacity: string;
  consumables: string;
  url: string;
  created: string;
  edited: string;

  /** Extracted from url. */
  id: number;

  films: Array<number>;
  pilots: Array<number>;
};

export type Vehicle = {
  name: string;
  model: string;
  vehicle_class: string;
  manufacturer: string;
  length: string;
  cost_in_credits: string;
  crew: string;
  passengers: string;
  max_atmosphering_speed: string;
  cargo_capacity: string;
  consumables: string;
  url: string;
  created: string;
  edited: string;

  films: Array<number>;
  pilots: Array<number>;
};

export type Species = {
  name: string;
  classification: string;
  designation: string;
  average_height: string;
  average_lifespan: string;
  eye_colors: string;
  hair_colors: string;
  skin_colors: string;
  language: string;
  homeworld: string;
  url: string;
  created: string;
  edited: string;

  people: Array<number>;
  films: Array<number>;
};

export type Planet = {
  name: string;
  birth_year: string;
  eye_color: string;
  gender: string;
  hair_color: string;
  height: string;
  mass: string;
  skin_color: string;
  homeworld: string;
  url: string;
  created: string;
  edited: string;

  films: Array<number>;
  species: Array<number>;
  starships: Array<number>;
  vehicles: Array<number>;
};

export type PlanetCollection = {
  count: number;
  next: number | null;
  previous: number | null;
  results: Array<Planet>;
};

export type Film = {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  url: string;
  created: string;
  edited: string;

  species: Array<number>;
  starships: Array<number>;
  vehicles: Array<number>;
  characters: Array<number>;
  planets: Array<number>;
};

export type FilmCollection = {
  count: number;
  next: number | null;
  previous: number | null;
  results: Array<Film>;
};
