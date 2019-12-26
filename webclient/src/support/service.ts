
const APP_MIMETYPE = 'application/json';

function checkForErrors(resp: Response) {
  const {status} = resp;
  if (status >= 400) {
    console.error(resp);
    //window.location.replace(`/errors/${status}`);
  }
  return resp;  
}


export abstract class Service<T, ID> {

  constructor(protected baseEndPoint: string) {}

  async doFetch(url: string, opts = {}) {
    return await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': APP_MIMETYPE,
          'Accept': APP_MIMETYPE
        }, ...opts})
      .then(checkForErrors)
      .then(resp => resp.json())
      .catch(console.error);
  }

  buildQueryString(params: {[key: string]: any}) {
    let query = '';
    const keys: Array<string> = Object.keys(params);
    if (keys.length) {
      query = '?';
      keys.forEach((k,i) => {
        query += k + '=' + params[k];
        if (i < keys.length-1)
          query += '&';
      });
    }
    return query;
  }

  get(id: ID, params = {}, opts = {}) {
    const query = this.buildQueryString(params);
    return this.doFetch(`${this.baseEndPoint}/${id}${query}`, opts);
  }

  list(params = {}, opts = {}) {
    const query = this.buildQueryString(params);
    return this.doFetch(`${this.baseEndPoint}${query}`, opts);
  }

  create(data: T, opts = {}) {
    return this.doFetch(this.baseEndPoint, {
      method: 'POST', 
      body: JSON.stringify(data), 
      ...opts
    });
  }

  update(id: ID, data: T, opts = {}) {
    return this.doFetch(`${this.baseEndPoint}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...opts
    });
  }

  delete(id: ID, opts = {}) {
    return this.doFetch(`${this.baseEndPoint}/${id}`, {
      method: 'DELETE', ...opts
    });
  }  
}