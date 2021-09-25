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
  body: any | undefined = undefined
): Promise<RequestCallback<TResponse>> {
  return new Promise<RequestCallback<TResponse>>(function (
    resolve: (arg: RequestCallback<TResponse>) => void,
    reject: (arg: { status: number, statusText: string }) => void
  ) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve({
          content: xhr.responseText,
          json: JSON.parse(xhr.responseText),
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
