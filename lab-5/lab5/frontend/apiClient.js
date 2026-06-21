// Тонкий шар доступу до API (API Client)

const BASE_URL = 'http://localhost:3000/api/v1';
const POSTS_URL = `${BASE_URL}/posts`;
const USERS_URL = `${BASE_URL}/users`;
const COMMENTS_URL = `${BASE_URL}/comments`;

async function request(path = '', options = {}) {
  const response = await fetch(path, {
    ...options, 
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type');
  const body = contentType && contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(body?.detail || body?.error?.message || 'Помилка HTTP');
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

// Posts functions
export async function getList() {
  return request(POSTS_URL);
}

export async function getById(id) {
  return request(`${POSTS_URL}/${id}`);
}

export async function getDetails(id) {
  return request(`${POSTS_URL}/${id}/details`);
}

export async function createPost(data) {
  return request(POSTS_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePost(id, data) {
  return request(`${POSTS_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePost(id) {
  return request(`${POSTS_URL}/${id}`, {
    method: 'DELETE',
  });
}

// Users functions
export async function getAllUsers() {
  return request(USERS_URL);
}

export async function getUsersCount() {
  return request(`${USERS_URL}/stats/count`);
}

export async function getUserById(id) {
  return request(`${USERS_URL}/${id}`);
}

export async function createUser(data) {
  return request(USERS_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function currentUsers(id) {
  return request(`${USERS_URL}/${id}`);
}

export async function updateUser(id, data) {
  return request(`${USERS_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id) {
  return request(`${USERS_URL}/${id}`, {
    method: 'DELETE',
  });
}

// Comments functions
export async function getAllComments() {
  return request(COMMENTS_URL);
}

export async function getTopCommentedPost() {
  return request(`${COMMENTS_URL}/stats/top-post`);
}

export async function getCommentById(id) {
  return request(`${COMMENTS_URL}/${id}`);
}

export async function createComment(data) {
  return request(COMMENTS_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateComment(id, data) {
  return request(`${COMMENTS_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteComment(id) {
  return request(`${COMMENTS_URL}/${id}`, {
    method: 'DELETE',
  });
}
//Лаб №5 — Сценарій В: IDOR
// Заголовок X-Demo-UserId передається явно в кожному запиті до /notes
const NOTES_URL = `${BASE_URL}/notes`;

function notesRequest(path, options = {}, userId) {
  return request(path, {
    ...options,
    headers: { ...(options.headers || {}), 'X-Demo-UserId': String(userId) },
  });
}

export async function getNotes(userId) {
  return notesRequest(NOTES_URL, {}, userId);
}

export async function getNoteById(id, userId) {
  return notesRequest(`${NOTES_URL}/${id}`, {}, userId);
}

export async function createNote(data, userId) {
  return notesRequest(NOTES_URL, { method: 'POST', body: JSON.stringify(data) }, userId);
}

export async function updateNote(id, data, userId) {
  return notesRequest(`${NOTES_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }, userId);
}

export async function deleteNote(id, userId) {
  return notesRequest(`${NOTES_URL}/${id}`, { method: 'DELETE' }, userId);
}

// Лаб 5 — Сценарій А: SQLi — пошук із параметром search
export async function searchPosts(search) {
  const params = new URLSearchParams({ search });
  return request(`${POSTS_URL}?${params}`);
}
