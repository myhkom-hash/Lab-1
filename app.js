// Масив для зберігання
let posts = [];

// Пошук елементів DOM
const form = document.getElementById('postForm');
const tableBody = document.getElementById('postsTableBody');
const resetBtn = document.getElementById('resetBtn');

// Обробка форми
form.addEventListener('submit', (event) => {
    // Скасовуємо стандартне перезавантаження сторінки
    event.preventDefault();

    // 1. Зчитування
    const dto = {
        title: document.getElementById('titleInput').value.trim(),
        category: document.getElementById('categorySelect').value,
        author: document.getElementById('authorInput').value.trim(),
        body: document.getElementById('bodyInput').value.trim()
    };

    // 2. Валідація
    const isValid = validate(dto);
    if (!isValid) return; // Стоп мені не приємно

    // 3. Додаємо запис у масив
    const newPost = {
        title: dto.title,
        category: dto.category,
        author: dto.author,
        body: dto.body,
        createdAt: new Date().toLocaleString() // Авто дата
    };
    posts.push(newPost);

    // 4. Оновлення table
    renderTable();

    // Очищаємо форму
    form.reset();
});

// Кнопка очищення
resetBtn.addEventListener('click', () => {
    form.reset();
    clearAllErrors();
});

// Функція валідації
function validate(dto) {
    clearAllErrors();
    let isValid = true;

    if (dto.title === "") {
        showError("titleInput", "titleError", "Заголовок обов'язковий");
        isValid = false;
    }

    if (dto.category === "") {
        showError("categorySelect", "categoryError", "Оберіть категорію");
        isValid = false;
    }

    if (dto.author === "") {
        showError("authorInput", "authorError", "Вкажіть автора");
        isValid = false;
    }

    if (dto.body.length < 5) {
        showError("bodyInput", "bodyError", "Текст має містити мінімум 5 символів");
        isValid = false;
    }

    return isValid;
}

// Допоміжні функції
function showError(inputId, errorId, message) {
    document.getElementById(inputId).classList.add("invalid");
    document.getElementById(errorId).innerText = message;
}

function clearAllErrors() {
    const inputs = document.querySelectorAll('.invalid');
    inputs.forEach(input => input.classList.remove('invalid'));

    const errorTexts = document.querySelectorAll('.error-text');
    errorTexts.forEach(p => p.innerText = "");
}

// Функція для відмальовування таблиці
function renderTable() {
    // Форматування рядку
    const rowsHtml = posts.map((post, index) => {
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${post.title}</td>
                <td>${post.category}</td>
                <td>${post.author}</td>
                <td>${post.body}</td>
                <td>${post.createdAt}</td>
            </tr>
        `;
    }).join(''); // Об'єднуємо масиви

    // Вставляємо у table
    tableBody.innerHTML = rowsHtml;
}