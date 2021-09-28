import {
  makeRequest,
  capitalize
} from './helper';

import {
  domain
} from './config';

import {
  Person,
  PersonCollection,
  Starship,
  Vehicle,
  Species,
  Planet,
  PlanetCollection,
  Film,
  FilmCollection
} from './types';

import * as Noodl from '@noodl/noodl-sdk';

import {
  autoLayoutComponentNode
} from './components';

const debugLog = Noodl.defineNode({
  category: 'Debug',
  name: 'Log',
  color: 'purple',
  inputs: {
    Message: {
      group: 'Input',
      type: '*'
    },
  },
  signals: {
    LogMessage: function () {
      const input = this.inputs.Message;
      console.dir(input);
    }
  }
});

const getFilms = Noodl.defineNode({
  category: 'Star Wars API',
  name: 'Get all films',
  color: 'green',
  initialize: function () {
    this.result = Noodl.Object.create(null);
  },
  inputs: {
    Search: {
      group: 'Query',
      type: 'string'
    },
  },
  outputs: {
    /**
     *
     **/
    Fetched: {
      group: 'Events',
      type: 'signal'
    },

    /**
     *
     **/
    Error: {
      group: 'Events',
      type: 'signal'
    },

    /**
     * 
     *
     * name: count
     * type: integer
     **/
    Count: {
      group: 'Response',
      type: 'number'
    },

    /**
     * 
     *
     * name: next
     * type: integer
     **/
    Next: {
      group: 'Response',
      type: 'number'
    },

    /**
     * 
     *
     * name: previous
     * type: integer
     **/
    Previous: {
      group: 'Response',
      type: 'number'
    },

    /**
     * 
     *
     * name: results
     * type: array
     **/
    Results: {
      group: 'Response',
      type: 'array'
    },
  },
  signals: {
    Fetch: function () {
      let path = '/api/films';

      let body = null;
      let queryParameters: {
        [key: string]: string
      } = {};

      if (this.inputs['Search']) {
        queryParameters['search'] = this.inputs['Search'];
      }

      makeRequest<FilmCollection>('GET', domain + path, queryParameters, body)
        .then(({
          json
        }) => {
          for (const key of Object.keys(json)) {
            // Capitalize to make it more user friendly
            const newKey = capitalize(key);

            // Check if we have something that is not registered
            // then send a warning
            if (!this.hasOutput(newKey)) {
              this.sendWarning('swapi-warning', `Output pin is missing '${newKey}'`);
            }

            // Update the output pin
            // @ts-ignore - bad solution, but nothing we should worry about
            const newOutput = json[key];
            if (Array.isArray(newOutput)) {
              this.outputs[newKey] = Noodl.Array.create(newOutput);
            } else if (typeof newOutput === 'object') {
              this.outputs[newKey] = Noodl.Object.create(newOutput);
            } else {
              this.outputs[newKey] = newOutput;
            }

            // Flag that the output have been changed
            this.flagOutputDirty(newKey);
          }

          // Send the signal that we just recieved a response
          this.sendSignalOnOutput('Fetched');
        })
        .catch(({
          status,
          statusText
        }) => {
          // Send a warning and a signal that we got a http error
          this.sendWarning('swapi-error', `Http Error (${status}): ${statusText}`);
          this.sendSignalOnOutput('Error');
        });
    }
  },
  methods: {
    getResult() {
      return this.result;
    }
  }
});

const getFilm = Noodl.defineNode({
  category: 'Star Wars API',
  name: 'Get film by id',
  color: 'green',
  initialize: function () {
    this.result = Noodl.Object.create(null);
  },
  inputs: {
    Id: {
      group: 'Query',
      type: 'string'
    },
  },
  outputs: {
    /**
     *
     **/
    Fetched: {
      group: 'Events',
      type: 'signal'
    },

    /**
     *
     **/
    Error: {
      group: 'Events',
      type: 'signal'
    },

    /**
     * The title of this film
     *
     * name: title
     * type: string
     **/
    Title: {
      group: 'Response',
      type: 'string'
    },

    /**
     * The episode number of this film.
     *
     * name: episode_id
     * type: integer
     **/
    Episode_id: {
      group: 'Response',
      type: 'number'
    },

    /**
     * The opening paragraphs at the beginning of this film.
     *
     * name: opening_crawl
     * type: string
     **/
    Opening_crawl: {
      group: 'Response',
      type: 'string'
    },

    /**
     * The name of the director of this film.
     *
     * name: director
     * type: string
     **/
    Director: {
      group: 'Response',
      type: 'string'
    },

    /**
     * The name(s) of the producer(s) of this film. Comma separated.
     *
     * name: producer
     * type: string
     **/
    Producer: {
      group: 'Response',
      type: 'string'
    },

    /**
     * The ISO 8601 date format of film release at original creator country.
     *
     * name: release_date
     * type: string
     **/
    Release_date: {
      group: 'Response',
      type: 'string'
    },

    /**
     * An array of species resource URLs that are in this film.
     *
     * name: species
     * type: array
     **/
    Species: {
      group: 'Response',
      type: 'array'
    },

    /**
     * An array of starship resource URLs that are in this film.
     *
     * name: starships
     * type: array
     **/
    Starships: {
      group: 'Response',
      type: 'array'
    },

    /**
     * An array of vehicle resource URLs that are in this film.
     *
     * name: vehicles
     * type: array
     **/
    Vehicles: {
      group: 'Response',
      type: 'array'
    },

    /**
     * An array of people resource URLs that are in this film.
     *
     * name: characters
     * type: array
     **/
    Characters: {
      group: 'Response',
      type: 'array'
    },

    /**
     * An array of planet resource URLs that are in this film.
     *
     * name: planets
     * type: array
     **/
    Planets: {
      group: 'Response',
      type: 'array'
    },

    /**
     * the hypermedia URL of this resource.
     *
     * name: url
     * type: string
     **/
    Url: {
      group: 'Response',
      type: 'string'
    },

    /**
     * Extracted from url.
     *
     * name: id
     * type: number
     **/
    Id: {
      group: 'Response',
      type: 'number'
    },

    /**
     * the ISO 8601 date format of the time that this resource was created.
     *
     * name: created
     * type: string
     **/
    Created: {
      group: 'Response',
      type: 'string'
    },

    /**
     * the ISO 8601 date format of the time that this resource was edited.
     *
     * name: edited
     * type: string
     **/
    Edited: {
      group: 'Response',
      type: 'string'
    },
  },
  signals: {
    Fetch: function () {
      let path = '/api/films/{id}';

      let body = null;
      let queryParameters: {
        [key: string]: string
      } = {};

      path = path.replace(
        '{id}',
        `${encodeURIComponent(this.inputs['Id']).toString()}`
      );

      makeRequest<Film>('GET', domain + path, queryParameters, body)
        .then(({
          json
        }) => {
          for (const key of Object.keys(json)) {
            // Capitalize to make it more user friendly
            const newKey = capitalize(key);

            // Check if we have something that is not registered
            // then send a warning
            if (!this.hasOutput(newKey)) {
              this.sendWarning('swapi-warning', `Output pin is missing '${newKey}'`);
            }

            // Update the output pin
            // @ts-ignore - bad solution, but nothing we should worry about
            const newOutput = json[key];
            if (Array.isArray(newOutput)) {
              this.outputs[newKey] = Noodl.Array.create(newOutput);
            } else if (typeof newOutput === 'object') {
              this.outputs[newKey] = Noodl.Object.create(newOutput);
            } else {
              this.outputs[newKey] = newOutput;
            }

            // Flag that the output have been changed
            this.flagOutputDirty(newKey);
          }

          // Send the signal that we just recieved a response
          this.sendSignalOnOutput('Fetched');
        })
        .catch(({
          status,
          statusText
        }) => {
          // Send a warning and a signal that we got a http error
          this.sendWarning('swapi-error', `Http Error (${status}): ${statusText}`);
          this.sendSignalOnOutput('Error');
        });
    }
  },
  methods: {
    getResult() {
      return this.result;
    }
  }
});

const getPeople = Noodl.defineNode({
  category: 'Star Wars API',
  name: 'Get all people',
  color: 'green',
  initialize: function () {
    this.result = Noodl.Object.create(null);
  },
  inputs: {

  },
  outputs: {
    /**
     *
     **/
    Fetched: {
      group: 'Events',
      type: 'signal'
    },

    /**
     *
     **/
    Error: {
      group: 'Events',
      type: 'signal'
    },

    /**
     * 
     *
     * name: count
     * type: integer
     **/
    Count: {
      group: 'Response',
      type: 'number'
    },

    /**
     * 
     *
     * name: next
     * type: integer
     **/
    Next: {
      group: 'Response',
      type: 'number'
    },

    /**
     * 
     *
     * name: previous
     * type: integer
     **/
    Previous: {
      group: 'Response',
      type: 'number'
    },

    /**
     * 
     *
     * name: results
     * type: array
     **/
    Results: {
      group: 'Response',
      type: 'array'
    },
  },
  signals: {
    Fetch: function () {
      let path = '/api/people';

      let body = null;
      let queryParameters: {
        [key: string]: string
      } = {};

      makeRequest<PersonCollection>('GET', domain + path, queryParameters, body)
        .then(({
          json
        }) => {
          for (const key of Object.keys(json)) {
            // Capitalize to make it more user friendly
            const newKey = capitalize(key);

            // Check if we have something that is not registered
            // then send a warning
            if (!this.hasOutput(newKey)) {
              this.sendWarning('swapi-warning', `Output pin is missing '${newKey}'`);
            }

            // Update the output pin
            // @ts-ignore - bad solution, but nothing we should worry about
            const newOutput = json[key];
            if (Array.isArray(newOutput)) {
              this.outputs[newKey] = Noodl.Array.create(newOutput);
            } else if (typeof newOutput === 'object') {
              this.outputs[newKey] = Noodl.Object.create(newOutput);
            } else {
              this.outputs[newKey] = newOutput;
            }

            // Flag that the output have been changed
            this.flagOutputDirty(newKey);
          }

          // Send the signal that we just recieved a response
          this.sendSignalOnOutput('Fetched');
        })
        .catch(({
          status,
          statusText
        }) => {
          // Send a warning and a signal that we got a http error
          this.sendWarning('swapi-error', `Http Error (${status}): ${statusText}`);
          this.sendSignalOnOutput('Error');
        });
    }
  },
  methods: {
    getResult() {
      return this.result;
    }
  }
});

const getPerson = Noodl.defineNode({
  category: 'Star Wars API',
  name: 'Get person by id',
  color: 'green',
  initialize: function () {
    this.result = Noodl.Object.create(null);
  },
  inputs: {
    Id: {
      group: 'Query',
      type: 'string'
    },
  },
  outputs: {
    /**
     *
     **/
    Fetched: {
      group: 'Events',
      type: 'signal'
    },

    /**
     *
     **/
    Error: {
      group: 'Events',
      type: 'signal'
    },

    /**
     * Unique identifier representing a specific person for a given character persona.
     *
     * name: id
     * type: number
     **/
    Id: {
      group: 'Response',
      type: 'number'
    },

    /**
     * Display name of person.
     *
     * name: name
     * type: string
     **/
    Name: {
      group: 'Response',
      type: 'string'
    },

    /**
     * Indetifier of the planet the person is from.
     *
     * name: homeWorldId
     * type: integer
     **/
    HomeWorldId: {
      group: 'Response',
      type: 'number'
    },

    /**
     * Which side or team the person has an allegiance.
     *
     * name: allegiance
     * type: string
     **/
    Allegiance: {
      group: 'Response',
      type: 'string'
    },
  },
  signals: {
    Fetch: function () {
      let path = '/api/people/{id}';

      let body = null;
      let queryParameters: {
        [key: string]: string
      } = {};

      path = path.replace(
        '{id}',
        `${encodeURIComponent(this.inputs['Id']).toString()}`
      );

      makeRequest<Person>('GET', domain + path, queryParameters, body)
        .then(({
          json
        }) => {
          for (const key of Object.keys(json)) {
            // Capitalize to make it more user friendly
            const newKey = capitalize(key);

            // Check if we have something that is not registered
            // then send a warning
            if (!this.hasOutput(newKey)) {
              this.sendWarning('swapi-warning', `Output pin is missing '${newKey}'`);
            }

            // Update the output pin
            // @ts-ignore - bad solution, but nothing we should worry about
            const newOutput = json[key];
            if (Array.isArray(newOutput)) {
              this.outputs[newKey] = Noodl.Array.create(newOutput);
            } else if (typeof newOutput === 'object') {
              this.outputs[newKey] = Noodl.Object.create(newOutput);
            } else {
              this.outputs[newKey] = newOutput;
            }

            // Flag that the output have been changed
            this.flagOutputDirty(newKey);
          }

          // Send the signal that we just recieved a response
          this.sendSignalOnOutput('Fetched');
        })
        .catch(({
          status,
          statusText
        }) => {
          // Send a warning and a signal that we got a http error
          this.sendWarning('swapi-error', `Http Error (${status}): ${statusText}`);
          this.sendSignalOnOutput('Error');
        });
    }
  },
  methods: {
    getResult() {
      return this.result;
    }
  }
});

const getPlanets = Noodl.defineNode({
  category: 'Star Wars API',
  name: 'Get all planets',
  color: 'green',
  initialize: function () {
    this.result = Noodl.Object.create(null);
  },
  inputs: {

  },
  outputs: {
    /**
     *
     **/
    Fetched: {
      group: 'Events',
      type: 'signal'
    },

    /**
     *
     **/
    Error: {
      group: 'Events',
      type: 'signal'
    },

    /**
     * 
     *
     * name: count
     * type: integer
     **/
    Count: {
      group: 'Response',
      type: 'number'
    },

    /**
     * 
     *
     * name: next
     * type: integer
     **/
    Next: {
      group: 'Response',
      type: 'number'
    },

    /**
     * 
     *
     * name: previous
     * type: integer
     **/
    Previous: {
      group: 'Response',
      type: 'number'
    },

    /**
     * 
     *
     * name: results
     * type: array
     **/
    Results: {
      group: 'Response',
      type: 'array'
    },
  },
  signals: {
    Fetch: function () {
      let path = '/api/planets';

      let body = null;
      let queryParameters: {
        [key: string]: string
      } = {};

      makeRequest<PlanetCollection>('GET', domain + path, queryParameters, body)
        .then(({
          json
        }) => {
          for (const key of Object.keys(json)) {
            // Capitalize to make it more user friendly
            const newKey = capitalize(key);

            // Check if we have something that is not registered
            // then send a warning
            if (!this.hasOutput(newKey)) {
              this.sendWarning('swapi-warning', `Output pin is missing '${newKey}'`);
            }

            // Update the output pin
            // @ts-ignore - bad solution, but nothing we should worry about
            const newOutput = json[key];
            if (Array.isArray(newOutput)) {
              this.outputs[newKey] = Noodl.Array.create(newOutput);
            } else if (typeof newOutput === 'object') {
              this.outputs[newKey] = Noodl.Object.create(newOutput);
            } else {
              this.outputs[newKey] = newOutput;
            }

            // Flag that the output have been changed
            this.flagOutputDirty(newKey);
          }

          // Send the signal that we just recieved a response
          this.sendSignalOnOutput('Fetched');
        })
        .catch(({
          status,
          statusText
        }) => {
          // Send a warning and a signal that we got a http error
          this.sendWarning('swapi-error', `Http Error (${status}): ${statusText}`);
          this.sendSignalOnOutput('Error');
        });
    }
  },
  methods: {
    getResult() {
      return this.result;
    }
  }
});

const getPlanet = Noodl.defineNode({
  category: 'Star Wars API',
  name: 'Get planet by id',
  color: 'green',
  initialize: function () {
    this.result = Noodl.Object.create(null);
  },
  inputs: {
    Id: {
      group: 'Query',
      type: 'string'
    },
  },
  outputs: {
    /**
     *
     **/
    Fetched: {
      group: 'Events',
      type: 'signal'
    },

    /**
     *
     **/
    Error: {
      group: 'Events',
      type: 'signal'
    },

    /**
     * Unique identifier representing a specific planet.
     *
     * name: id
     * type: integer
     **/
    Id: {
      group: 'Response',
      type: 'number'
    },

    /**
     * Display name of planet.
     *
     * name: name
     * type: string
     **/
    Name: {
      group: 'Response',
      type: 'string'
    },
  },
  signals: {
    Fetch: function () {
      let path = '/api/planets/{id}';

      let body = null;
      let queryParameters: {
        [key: string]: string
      } = {};

      path = path.replace(
        '{id}',
        `${encodeURIComponent(this.inputs['Id']).toString()}`
      );

      makeRequest<Planet>('GET', domain + path, queryParameters, body)
        .then(({
          json
        }) => {
          for (const key of Object.keys(json)) {
            // Capitalize to make it more user friendly
            const newKey = capitalize(key);

            // Check if we have something that is not registered
            // then send a warning
            if (!this.hasOutput(newKey)) {
              this.sendWarning('swapi-warning', `Output pin is missing '${newKey}'`);
            }

            // Update the output pin
            // @ts-ignore - bad solution, but nothing we should worry about
            const newOutput = json[key];
            if (Array.isArray(newOutput)) {
              this.outputs[newKey] = Noodl.Array.create(newOutput);
            } else if (typeof newOutput === 'object') {
              this.outputs[newKey] = Noodl.Object.create(newOutput);
            } else {
              this.outputs[newKey] = newOutput;
            }

            // Flag that the output have been changed
            this.flagOutputDirty(newKey);
          }

          // Send the signal that we just recieved a response
          this.sendSignalOnOutput('Fetched');
        })
        .catch(({
          status,
          statusText
        }) => {
          // Send a warning and a signal that we got a http error
          this.sendWarning('swapi-error', `Http Error (${status}): ${statusText}`);
          this.sendSignalOnOutput('Error');
        });
    }
  },
  methods: {
    getResult() {
      return this.result;
    }
  }
});




Noodl.defineModule({
  reactNodes: [
    autoLayoutComponentNode,
  ],
  nodes: [
    debugLog,
    getFilms,
    getFilm,
    getPeople,
    getPerson,
    getPlanets,
    getPlanet,
  ],
  setup() {
    // this is called once on startup
  }
});
