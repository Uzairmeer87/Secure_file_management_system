const API = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function fetchApi(path, { method = 'GET', body, headers } = {}) {
  headers = headers || {};
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  let opts = { method, headers };
  if (body) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(API + path, opts);

  // If fetching raw file content (GET /files/:name), handle as text
  const isFileContent = method === 'GET' && /^\/files\/[^/]+$/.test(path);
  if (isFileContent && res.ok) {
    return await res.text();
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

const api = {
  get: (path) => fetchApi(path),
  post: (path, body) => fetchApi(path, { method: 'POST', body }),
  put: (path, body) => fetchApi(path, { method: 'PUT', body }),
  delete: (path) => fetchApi(path, { method: 'DELETE' }),
  createFile: (name, content) => fetchApi('/files/create', { method: 'POST', body: { name, content } }),
};

export default api;
