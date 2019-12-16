export type Dict<T> = {[key: string]: T}

export const parseQueryString = (q: string): Dict<string> => {
  return (q || '')
    .substr(1)
    .split('&')
    .map(s => decodeURI(s))
    .filter(s => s.trim())
    .filter(s => s.length)
    .reduce((map: Dict<string>, s) => {
      const [key, value] = s.split('=');
      map[key] = value;
      return map;
    }, {})
}

export const getCookie = (name: string) => {
  const cookies = (document.cookie || '').split(';');
  for (let i=0; i < cookies.length; i++) {
    const [k, v] = cookies[i].trim().split('=');
    if (k === name)
      return v;
  }
  return null;
}