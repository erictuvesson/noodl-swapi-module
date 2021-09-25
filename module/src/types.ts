export type People = {
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

  films: Array<string>;
  species: Array<string>;
  starships: Array<string>;
  vehicles: Array<string>;
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

  films: Array<string>;
  pilots: Array<string>;
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

  films: Array<string>;
  pilots: Array<string>;
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

  people: Array<string>;
  films: Array<string>;
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

  films: Array<string>;
  species: Array<string>;
  starships: Array<string>;
  vehicles: Array<string>;
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

  species: Array<string>;
  starships: Array<string>;
  vehicles: Array<string>;
  characters: Array<string>;
  planets: Array<string>;
};

export type FilmCollection = {
  count: number;
  next: number | null;
  previous: number | null;
  results: Array<Film>;
};
