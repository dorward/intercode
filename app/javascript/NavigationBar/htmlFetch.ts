import fetch from 'unfetch';

export default function htmlFetch(url: string, { headers, ...otherProps }: RequestInit) {
  const csrfToken = document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content;
  return fetch(url, {
    headers: {
      Accept: 'text/html',
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...headers,
    },
    ...otherProps,
  });
}