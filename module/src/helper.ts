export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestCallbackDefaultResponseType = { [key: string]: any } | any[];
export type RequestCallback<TResponse = RequestCallbackDefaultResponseType> = {
  content: string;
  json: TResponse;
  xhr: XMLHttpRequest;
};

export function makeRequest<TResponse = RequestCallbackDefaultResponseType>(
  method: HttpMethod,
  url: string,
  queryParameters: { [key: string]: any } | undefined = undefined,
  body: any | undefined = undefined
): Promise<RequestCallback<TResponse>> {
  return new Promise<RequestCallback<TResponse>>(function (
    resolve: (arg: RequestCallback<TResponse>) => void,
    reject: (arg: { status: number, statusText: string }) => void
  ) {
    var xhr = new XMLHttpRequest();

    let finalUrl = url;
    if (queryParameters) {
      const urlParams = new URLSearchParams(queryParameters).toString();
      if (urlParams.length > 0) {
        finalUrl += "?" + urlParams;
      }
    }

    xhr.open(method, finalUrl);
    
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve({
          content: xhr.responseText,
          json: updateResponse<TResponse>(JSON.parse(xhr.responseText)),
          xhr
        });
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send(JSON.stringify(body));
  });
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function extractNumber(value: string): number {
  return Number(value.match(/\d+/g).join(''));
}

/**
 * This is a very very bad function,
 * but since everything is generated this was
 * a quick solution to get it working.
 * 
 * @param json 
 */
function updateResponse<T>(json: any): T {
  json = updatePartialResponse(json);
  
  if (json.results) {
    // @ts-ignore
    json.results = json.results.map(x => updatePartialResponse(x));
  }

  return json;
}

function updatePartialResponse(value: any): any {
  if (value.url) {
    value.id = extractNumber(value.url);
  }

  // homeworld

  if (Array.isArray(value.characters) && value.characters.length > 0) { value.characters = value.characters.map(extractNumber); }
  if (Array.isArray(value.planets) && value.planets.length > 0) { value.planets = value.planets.map(extractNumber); }
  if (Array.isArray(value.species) && value.species.length > 0) { value.species = value.species.map(extractNumber); }
  if (Array.isArray(value.vehicles) && value.vehicles.length > 0) { value.vehicles = value.vehicles.map(extractNumber); }
  if (Array.isArray(value.starships) && value.starships.length > 0) { value.starships = value.starships.map(extractNumber); }
  if (Array.isArray(value.people) && value.people.length > 0) { value.people = value.people.map(extractNumber); }
  if (Array.isArray(value.residents) && value.residents.length > 0) { value.residents = value.residents.map(extractNumber); }
  if (Array.isArray(value.pilots) && value.pilots.length > 0) { value.pilots = value.pilots.map(extractNumber); }
  if (Array.isArray(value.films) && value.films.length > 0) { value.films = value.films.map(extractNumber); }

  return value;
}