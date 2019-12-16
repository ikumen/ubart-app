const _scriptCache: {[key: string]: Promise<HTMLScriptElement>} = {};

export const loadScript = (src: string): Promise<HTMLScriptElement> => {
  if (!_scriptCache[src]) {
    _scriptCache[src] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.onload = (e: any) => resolve(script);
      script.onerror = (e: any) => reject({status: 'error', src});
      script.src = src;
      document.getElementsByTagName('body')[0].append(script);
    });
  }
  return _scriptCache[src];
}