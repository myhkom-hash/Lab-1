// Фронтенд точка входу - Дошка оголошень
// ✓ Вимога: "Реалізувати виклики fetch() до двох ендпоінтів (список і деталі)"
// ✓ Вимога: "Вивести дані списком/таблицею (мінімум 3–5 полів DTO)"
// ✓ Вимога: "Реалізувати стани: Завантаження, Немає даних, Помилка завантаження"
// ✓ Вимога: "Якщо відповідь не 2xx – показати повідомлення про помилку"
// ✓ Вимога: "Додати форму для створення та редагування"
// ✓ Вимога: "Реалізувати клієнтську валідацію + показ помилок користувачу"
// ✓ Вимога: "Обробляти помилки валідації з бекенду: показати по полях"

import * as apiClient from './apiClient.js';

const form = document.getElementById('postForm');
const tableBody = document.getElementById('postsTableBody');
const tableState = document.getElementById('tableState');
const messageBox = document.getElementById('statusMessage');
const detailsSection = document.getElementById('detailsSection');
const detailsContent = document.getElementById('detailsContent');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const resetBtn = document.getElementById('resetBtn');

// Користувацька форма
const userForm = document.getElementById('userForm');
const userFormTitle = document.getElementById('userFormTitle');
const userStatusMessage = document.getElementById('userStatusMessage');
const userNameInput = document.getElementById('userNameInput');
const userSubmitBtn = document.getElementById('userSubmitBtn');
const userCancelEditBtn = document.getElementById('userCancelEditBtn');
const userResetBtn = document.getElementById('userResetBtn');

// Користувачі таблиця
const usersTableBody = document.getElementById('usersTableBody');
const usersTableState = document.getElementById('usersTableState');

// Коментарі форма
const commentForm = document.getElementById('commentForm');
const commentFormTitle = document.getElementById('commentFormTitle');
const commentStatusMessage = document.getElementById('commentStatusMessage');
const commentPostIdInput = document.getElementById('commentPostIdInput');
const commentUserIdInput = document.getElementById('commentUserIdInput');
const commentBodyInput = document.getElementById('commentBodyInput');
const commentSubmitBtn = document.getElementById('commentSubmitBtn');
const commentCancelEditBtn = document.getElementById('commentCancelEditBtn');
const commentResetBtn = document.getElementById('commentResetBtn');

// Коментарі таблиця
const commentsTableBody = document.getElementById('commentsTableBody');
const commentsTableState = document.getElementById('commentsTableState');

// Пост з найбільшою кількістю коментарів
const topCommentedPost = document.getElementById('topCommentedPost');

//списко усіх користувачів
const currentUsersCount = document.getElementById('currentUsersCount'); 


let editingPostId = null;
let editingUserId = null;
let editingCommentId = null;
let currentUsers = [];
const state = {
  posts: { items: [], isLoading: false },
  users: { items: [], isLoading: false },
  comments: { items: [], isLoading: false }
};

function showMessage(text, type = 'info') {
  messageBox.textContent = text;
  messageBox.className = `status-message ${type}`;
  if (!text) {
    messageBox.className = 'status-message';
  }
}

function clearFieldErrors() {
  document.querySelectorAll('.invalid').forEach((input) => input.classList.remove('invalid'));
  document.querySelectorAll('.error-text').forEach((el) => (el.textContent = ''));
}

function setFormMode(editing = false) {
  editingPostId = editing ? editing : null;
  formTitle.textContent = editing ? 'Редагувати оголошення' : 'Створити оголошення';
  submitBtn.textContent = editing ? 'Оновити' : 'Додати';
  cancelEditBtn.style.display = editing ? 'inline-block' : 'none';
}

function getDtoFromForm() {
  return {
    title: document.getElementById('titleInput').value.trim(),
    category: document.getElementById('categorySelect').value,
    author: document.getElementById('authorInput').value.trim(),
    userId: document.getElementById('userIdInput').value.trim(),
    status: document.getElementById('statusSelect').value,
    body: document.getElementById('bodyInput').value.trim(),
  };
}

function validateForm(dto) {
  clearFieldErrors();
  const errors = [];

  if (!dto.title || dto.title.length < 3) {
    errors.push({ field: 'title', message: 'Заголовок має містити мінімум 3 символи' });
  }
  if (!dto.category) {
    errors.push({ field: 'category', message: 'Оберіть категорію' });
  }
  if (!dto.author || dto.author.length < 2) {
    errors.push({ field: 'author', message: 'Автор має містити мінімум 2 символи' });
  }
  if (!dto.userId || !/^[1-9][0-9]*$/.test(dto.userId)) {
    errors.push({ field: 'userId', message: 'ID користувача має бути цілим числом більше 0' });
  }
  if (!dto.body || dto.body.length < 5) {
    errors.push({ field: 'body', message: 'Текст має містити мінімум 5 символів' });
  }
  if (dto.body && dto.body.length > 1000) {
    errors.push({ field: 'body', message: 'Текст не може перевищувати 1000 символів' });
  }

  if (errors.length > 0) {
    errors.forEach(({ field, message }) => {
      const inputElement = document.getElementById(`${field}Input`) || document.getElementById(`${field}Select`);
      const errorElement = document.getElementById(`${field}Error`);
      if (inputElement) inputElement.classList.add('invalid');
      if (errorElement) errorElement.textContent = message;
    });
    return false;
  }

  return true;
}

function resetForm() {
  form.reset();
  clearFieldErrors();
  setFormMode(false);
  detailsSection.hidden = true;
  showMessage('', 'info');
}

function getUserDtoFromForm() {
  return {
    name: userNameInput.value.trim(),
  };
}

function showUserMessage(text, type = 'info') {
  userStatusMessage.textContent = text;
  userStatusMessage.className = `status-message ${type}`;
  if (!text) {
    userStatusMessage.className = 'status-message';
  }
}

function validateUserForm(dto) {
  clearFieldErrors();
  const errors = [];

  if (!dto.name || dto.name.length < 2) {
    errors.push({ field: 'userName', message: 'Ім’я користувача має містити мінімум 2 символи' });
  }

  const existing = currentUsers.find((user) => user.name.toLowerCase() === dto.name.toLowerCase());
  if (existing && String(existing.id) !== String(editingUserId)) {
    errors.push({ field: 'userName', message: 'Користувач з таким ім’ям вже існує' });
  }

  if (errors.length > 0) {
    errors.forEach(({ field, message }) => {
      const inputElement = document.getElementById(`${field}Input`);
      const errorElement = document.getElementById(`${field}Error`);
      if (inputElement) inputElement.classList.add('invalid');
      if (errorElement) errorElement.textContent = message;
    });
    return false;
  }

  return true;
}

function resetUserForm() {
  userForm.reset();
  clearFieldErrors();
  editingUserId = null;
  userFormTitle.textContent = 'Створити користувача';
  userSubmitBtn.textContent = 'Додати';
  userCancelEditBtn.style.display = 'none';
  showUserMessage('', 'info');
}

function fillUserForm(user) {
  userNameInput.value = user.name || '';
  editingUserId = user.id;
  userFormTitle.textContent = 'Редагувати користувача';
  userSubmitBtn.textContent = 'Оновити';
  userCancelEditBtn.style.display = 'inline-block';
}

function renderTable(posts) {
  if (!posts || posts.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7">Немає даних</td></tr>';
    tableState.textContent = 'Немає оголошень для відображення.';
    return;
  }

  tableState.textContent = '';
  tableBody.innerHTML = posts
    .map((post) => {
      return `
        <tr>
          <td>${post.id}</td>
          <td>${escapeHtml(post.title)}</td>
          <td>${escapeHtml(post.category)}</td>
          <td>${escapeHtml(post.author)}</td>
          <td>${escapeHtml(post.status || '')}</td>
          <td>${formatDateTime(post.createdAt)}</td>
          <td>
            <div class="action-buttons">
              <button type="button" data-action="view" data-id="${post.id}">Переглянути</button>
              <button type="button" data-action="edit" data-id="${post.id}">Редагувати</button>
              <button type="button" data-action="delete" data-id="${post.id}">Видалити</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function escapeHtml(text) {
  return String(text || '').replace(/[&<>"]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  }[tag]));
}

function formatDateTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('uk-UA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function loadPosts() {
  showMessage('Завантаження...', 'info');
  detailsSection.hidden = true;
  try {
    const data = await apiClient.getList();
    state.posts.items = data.items || [];
    renderTable(state.posts.items);
    // ✅ топ пост тепер завантажується окремим запитом до бекенду
    renderTopCommentedPost();
    showMessage('Дані завантажено', 'success');
  } catch (error) {
    showMessage('Помилка завантаження: ' + (error.body?.detail || error.message), 'error');
    tableBody.innerHTML = '<tr><td colspan="7">Помилка завантаження</td></tr>';
    tableState.textContent = '';
    console.error(error);
  }
}

async function loadPostDetails(id) {
  showMessage('Завантаження деталей...', 'info');
  try {
    const result = await apiClient.getDetails(id);
    renderDetails(result.data);
    showMessage('Деталі завантажено', 'success');
  } catch (error) {
    showMessage('Не вдалося завантажити деталі: ' + (error.body?.detail || error.message), 'error');
    console.error(error);
  }
}

function renderDetails(post) {
  if (!post) {
    detailsSection.hidden = true;
    return;
  }
  detailsSection.hidden = false;
  detailsContent.innerHTML = `
    <div class="details-item"><span>ID:</span> ${post.id}</div>
    <div class="details-item"><span>Заголовок:</span> ${escapeHtml(post.title)}</div>
    <div class="details-item"><span>Категорія:</span> ${escapeHtml(post.category)}</div>
    <div class="details-item"><span>Автор:</span> ${escapeHtml(post.author)}</div>
    <div class="details-item"><span>Статус:</span> ${escapeHtml(post.status)}</div>
    <div class="details-item"><span>Текст:</span> ${escapeHtml(post.body)}</div>
    <div class="details-item"><span>Користувач:</span> ${escapeHtml(post.userName || post.userId)}</div>
    <div class="details-item"><span>Коментарів:</span> ${post.commentCount ?? 0}</div>
    <div class="details-item"><span>Створено:</span> ${formatDateTime(post.createdAt)}</div>
  `;
}

function fillForm(post) {
  document.getElementById('titleInput').value = post.title || '';
  document.getElementById('categorySelect').value = post.category || '';
  document.getElementById('authorInput').value = post.author || '';
  document.getElementById('userIdInput').value = post.userId || '';
  document.getElementById('statusSelect').value = post.status || 'draft';
  document.getElementById('bodyInput').value = post.body || '';
}

async function deletePost(id) {
  showMessage('Видалення...', 'info');
  try {
    await apiClient.deletePost(id);
    resetForm();
    await loadPosts();
    showMessage('Оголошення видалено', 'success');
  } catch (error) {
    handleError(error);
  }
}

function handleError(error) {
  clearFieldErrors();

  const body = error.body || {};
  const errors = Array.isArray(body.errors) ? body.errors : [];

  if (errors.length) {
    errors.forEach(({ field, message }) => {
      const formFieldName = field === 'name' ? 'userName' : field;
      const input = document.getElementById(`${formFieldName}Input`) || document.getElementById(`${formFieldName}Select`);
      const errorEl = document.getElementById(`${formFieldName}Error`);
      if (input) input.classList.add('invalid');
      if (errorEl) errorEl.textContent = message;
    });
  }

  const detail = body.detail || body.error?.message || error.message || 'Помилка сервера';
  showMessage(detail, 'error');
  console.error(error);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const dto = getDtoFromForm();

  if (!validateForm(dto)) {
    showMessage('Будь ласка, виправте помилки в формі', 'error');
    return;
  }

  try {
    if (editingPostId) {
      await apiClient.updatePost(editingPostId, dto);
      showMessage('Оголошення оновлено', 'success');
    } else {
      await apiClient.createPost(dto);
      showMessage('Оголошення створено', 'success');
    }

    resetForm();
    await loadPosts();
  } catch (error) {
    handleError(error);
  }
});

cancelEditBtn.addEventListener('click', () => {
  resetForm();
});

resetBtn.addEventListener('click', () => {
  resetForm();
});

userForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const dto = getUserDtoFromForm();

  if (!validateUserForm(dto)) {
    showUserMessage('Будь ласка, виправте помилки в формі користувача', 'error');
    return;
  }

  try {
    if (editingUserId) {
      await apiClient.updateUser(editingUserId, dto);
      showUserMessage('Користувача оновлено', 'success');
    } else {
      await apiClient.createUser(dto);
      showUserMessage('Користувача створено', 'success');
    }

    resetUserForm();
    await loadUsers();
  } catch (error) {
    handleError(error);
    showUserMessage(error.body?.detail || error.message || 'Помилка сервера', 'error');
  }
});

userCancelEditBtn.addEventListener('click', () => {
  resetUserForm();
});

userResetBtn.addEventListener('click', () => {
  resetUserForm();
});

tableBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!id) return;

  if (action === 'view') {
    await loadPostDetails(id);
  }
  if (action === 'edit') {
    try {
      const result = await apiClient.getById(id);
      fillForm(result.data);
      setFormMode(id);
      showMessage('Завантажено дані для редагування', 'info');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      handleError(error);
    }
  }
  if (action === 'delete') {
    if (confirm('Видалити це оголошення?')) {
      await deletePost(id);
    }
  }
});

usersTableBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!id) return;

  if (action === 'edit-user') {
    try {
      const result = await apiClient.getUserById(id);
      fillUserForm(result.data);
      showUserMessage('Завантажено дані користувача для редагування', 'info');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      showUserMessage(error.body?.detail || error.message || 'Помилка завантаження користувача', 'error');
      console.error(error);
    }
  }
  if (action === 'delete-user') {
    if (confirm('Видалити цього користувача?')) {
      await deleteUser(id);
    }
  }
});

// Користувачі таблиця - рендеринг
function renderUsersTable(users) {
  if (!users || users.length === 0) {
    usersTableBody.innerHTML = '<tr><td colspan="3">Немає даних</td></tr>';
    usersTableState.textContent = 'Немає користувачів для відображення.';
    return;
  }

  usersTableState.textContent = '';
  usersTableBody.innerHTML = users
    .map((user) => {
      return `
        <tr>
          <td>${escapeHtml(user.name)}</td>
          <td>${user.id}</td>
          <td>
            <div class="action-buttons">
              <button type="button" data-action="edit-user" data-id="${user.id}">Редагувати</button>
              <button type="button" data-action="delete-user" data-id="${user.id}">Видалити</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

// Користувачі таблиця - завантаження
async function loadUsers() {
  try {
    const data = await apiClient.getAllUsers();
    currentUsers = data.items || [];
    renderUsersTable(currentUsers);
    // ✅ ЗМІНА: кількість користувачів тепер обчислюється на бекенді через окремий ендпоінт
    await loadUsersCount();
  } catch (error) {
    usersTableBody.innerHTML = '<tr><td colspan="3">Помилка завантаження</td></tr>';
    usersTableState.textContent = 'Не вдалося завантажити користувачів';
    console.error(error);
  }
}

// ✅ НОВА ФУНКЦІЯ: завантажує кількість користувачів з бекенду (GET /api/v1/users/stats/count)
async function loadUsersCount() {
  try {
    const result = await apiClient.getUsersCount();
    renderTotalUsers(result.count);
  } catch (error) {
    console.error('Не вдалося завантажити кількість користувачів:', error);
  }
}

// Користувачі таблиця - видалення
async function deleteUser(id) {
  try {
    await apiClient.deleteUser(id);
    await loadUsers();
  } catch (error) {
    alert('Помилка видалення користувача: ' + (error.message || 'невідома помилка'));
    console.error(error);
  }
}

// ===== COMMENTS LOGIC =====

function getCommentDtoFromForm() {
  return {
    postId: commentPostIdInput.value.trim(),
    userId: commentUserIdInput.value.trim(),
    body: commentBodyInput.value.trim(),
  };
}

function showCommentMessage(text, type = 'info') {
  commentStatusMessage.textContent = text;
  commentStatusMessage.className = `status-message ${type}`;
  if (!text) {
    commentStatusMessage.className = 'status-message';
  }
}

function validateCommentForm(dto) {
  clearFieldErrors();
  const errors = [];

  if (!dto.postId || !/^[1-9][0-9]*$/.test(dto.postId)) {
    errors.push({ field: 'commentPostId', message: 'ID посту має бути цілим числом більше 0' });
  }
  if (!dto.userId || !/^[1-9][0-9]*$/.test(dto.userId)) {
    errors.push({ field: 'commentUserId', message: 'ID користувача має бути цілим числом більше 0' });
  }
  if (!dto.body || dto.body.length < 3) {
    errors.push({ field: 'commentBody', message: 'Текст коментаря має містити мінімум 3 символи' });
  }

  if (errors.length > 0) {
    errors.forEach(({ field, message }) => {
      const inputElement = document.getElementById(`${field}Input`);
      const errorElement = document.getElementById(`${field}Error`);
      if (inputElement) inputElement.classList.add('invalid');
      if (errorElement) errorElement.textContent = message;
    });
    return false;
  }

  return true;
}

function resetCommentForm() {
  commentForm.reset();
  clearFieldErrors();
  editingCommentId = null;
  commentFormTitle.textContent = 'Створити коментар';
  commentSubmitBtn.textContent = 'Додати';
  commentCancelEditBtn.style.display = 'none';
  showCommentMessage('', 'info');
}

function fillCommentForm(comment) {
  commentPostIdInput.value = comment.postId || '';
  commentUserIdInput.value = comment.userId || '';
  commentBodyInput.value = comment.body || '';
  editingCommentId = comment.id;
  commentFormTitle.textContent = 'Редагувати коментар';
  commentSubmitBtn.textContent = 'Оновити';
  commentCancelEditBtn.style.display = 'inline-block';
}

function renderCommentsTable(comments) {
  if (!comments || comments.length === 0) {
    commentsTableBody.innerHTML = '<tr><td colspan="6">Немає даних</td></tr>';
    commentsTableState.textContent = 'Немає коментарів для відображення.';
    // ✅ топ пост оновлюється окремо через loadComments → renderTopCommentedPost()
    return;
  }

  commentsTableState.textContent = '';
  commentsTableBody.innerHTML = comments
    .map((comment, index) => {
      const post = (state.posts.items || []).find((p) => String(p.id) === String(comment.postId));
      const user = (currentUsers || []).find((u) => String(u.id) === String(comment.userId));
      const postTitle = post ? post.title : `#${comment.postId}`;
      const userName = user ? user.name : `#${comment.userId}`;
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(postTitle)}</td>
          <td>${escapeHtml(userName)}</td>
          <td>${escapeHtml(comment.body.substring(0, 50))}${comment.body.length > 50 ? '...' : ''}</td>
          <td>${formatDateTime(comment.createdAt)}</td>
          <td>
            <div class="action-buttons">
              <button type="button" data-action="edit-comment" data-id="${comment.id}">Редагувати</button>
              <button type="button" data-action="delete-comment" data-id="${comment.id}">Видалити</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderTotalUsers(count) {
  if (currentUsersCount) {
    currentUsersCount.textContent = count;
  }
}

// ✅ ЗМІНА: топ пост тепер обчислюється на бекенді через GET /api/v1/comments/stats/top-post
async function renderTopCommentedPost() {
  if (!topCommentedPost) return;

  try {
    const result = await apiClient.getTopCommentedPost();
    const post = result.data;

    if (!post) {
      topCommentedPost.textContent = 'Немає даних';
      return;
    }

    topCommentedPost.innerHTML = `Пост "${escapeHtml(post.title)}" (ID ${post.id}) — ${post.commentCount} коментарів`;
  } catch (error) {
    topCommentedPost.textContent = 'Немає даних';
    console.error('Не вдалося завантажити топ пост:', error);
  }
}

async function loadComments() {
  try {
    const data = await apiClient.getAllComments();
    state.comments.items = data.items || [];
    renderCommentsTable(state.comments.items);
    renderTopCommentedPost();
  } catch (error) {
    commentsTableBody.innerHTML = '<tr><td colspan="6">Помилка завантаження</td></tr>';
    commentsTableState.textContent = 'Не вдалося завантажити коментарі';
    console.error(error);
  }
}

async function deleteComment(id) {
  try {
    await apiClient.deleteComment(id);
    resetCommentForm();
    await loadComments();
    showCommentMessage('Коментар видалено', 'success');
  } catch (error) {
    showCommentMessage('Помилка видалення: ' + (error.body?.detail || error.message), 'error');
    console.error(error);
  }
}

commentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const dto = getCommentDtoFromForm();

  if (!validateCommentForm(dto)) {
    showCommentMessage('Будь ласка, виправте помилки в формі', 'error');
    return;
  }

  try {
    if (editingCommentId) {
      await apiClient.updateComment(editingCommentId, { body: dto.body });
      showCommentMessage('Коментар оновлено', 'success');
    } else {
      await apiClient.createComment({
        postId: Number(dto.postId),
        userId: Number(dto.userId),
        body: dto.body,
      });
      showCommentMessage('Коментар створено', 'success');
    }

    resetCommentForm();
    await loadComments();
  } catch (error) {
    const body = error.body || {};
    const errors = Array.isArray(body.errors) ? body.errors : [];
    
    if (errors.length) {
      errors.forEach(({ field, message }) => {
        const formFieldName = field === 'postId' ? 'commentPostId' : field === 'userId' ? 'commentUserId' : field === 'body' ? 'commentBody' : field;
        const input = document.getElementById(`${formFieldName}Input`);
        const errorEl = document.getElementById(`${formFieldName}Error`);
        if (input) input.classList.add('invalid');
        if (errorEl) errorEl.textContent = message;
      });
    }
    
    const detail = body.detail || body.error?.message || error.message || 'Помилка сервера';
    showCommentMessage(detail, 'error');
    console.error(error);
  }
});

commentCancelEditBtn.addEventListener('click', () => {
  resetCommentForm();
});

commentResetBtn.addEventListener('click', () => {
  resetCommentForm();
});

commentsTableBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!id) return;

  if (action === 'edit-comment') {
    try {
      const result = await apiClient.getCommentById(id);
      fillCommentForm(result.data);
      showCommentMessage('Коментар завантажено для редагування', 'info');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      showCommentMessage(error.body?.detail || error.message || 'Помилка завантаження коментаря', 'error');
      console.error(error);
    }
  }
  if (action === 'delete-comment') {
    if (confirm('Видалити цей коментар?')) {
      await deleteComment(id);
    }
  }
});

setFormMode(false);
(async function init() {
  try {
    await loadPosts();
    await loadUsers();
    await loadComments();
  } catch (err) {
    console.error('Initialization error:', err);
  }
})();