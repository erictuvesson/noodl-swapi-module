import { makeRequest, capitalize } from './helper';
import { FilmCollection } from './types';
import { domain } from './config';

import * as Noodl from '@noodl/noodl-sdk';

const defaultCategory = 'Star Wars API';


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
  category: defaultCategory,
  name: 'Get all films',
  color: 'green',
  inputs: {
    Query: {
      group: 'Query',
      type: 'string'
    },
  },
  outputs: {
    Fetched: {
      group: 'Events',
      type: 'signal'
    },
    Error: {
      group: 'Events',
      type: 'signal'
    },
    Count: {
      group: 'Response',
      type: 'string'
    },
    Next: {
      group: 'Response',
      type: 'number'
    },
    Previous: {
      group: 'Response',
      type: 'number'
    },
    Results: {
      group: 'Response',
      type: 'array'
    }
  },
  signals: {
    Fetch: function () {
      let path = '/api/films';

      let body = null;
      let queryParameters = {};

      makeRequest<FilmCollection>('GET', domain + path, body)
        .then(({ json }) => {
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
            }
            else if (typeof newOutput === 'object') {
              this.outputs[newKey] = Noodl.Object.create(newOutput);
            }
            else {
              this.outputs[newKey] = newOutput;
            }

            // Flag that the output have been changed
            this.flagOutputDirty(newKey);
          }

          // Send the signal that we just recieved a response
          this.sendSignalOnOutput('Fetched');
        })
        .catch(({ status, statusText }) => {
          // Send a warning and a signal that we got a http error
          this.sendWarning('swapi-error', `Http Error (${status}): ${statusText}`);
          this.sendSignalOnOutput('Error');
        })
    }
  }
});

Noodl.defineModule({
  nodes: [
    debugLog,
    getFilms,
  ],
  setup: function () {
    // this is called once on startup
  }
});
