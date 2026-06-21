// Адреса нашого працюючого сервера
const API_URL = 'http://localhost:3000/api/posts';

// Пошук елементів DOM
const form = document.getElementById('postForm');
const tableBody = document.getElementById('postsTableBody');
const resetBtn = document.getElementById('resetBtn');

// 1. Отримання постів з сервера (Замість локального масиву)
async function fetchPosts() {
    try {
        const response = await fetch(API_URL); // Робимо GET-запит
        const data = await response.json();    // Декодуємо JSON
        renderTable(data.items);               // Відмальовуємо масив, який прийшов з сервера
    } catch (error) {
        console.error("Помилка при завантаженні постів:", error);
    }
}

// 2. Додавання нового поста (Відправляємо POST-запит)
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Зупиняємо перезавантаження сторінки

    // Збираємо дані з форми у DTO (Data Transfer Object)
    const dto = {
        title: document.getElementById('titleInput').value.trim(),
        category: document.getElementById('categorySelect').value,
        author: document.getElementById('authorInput').value.trim(),
        body: document.getElementById('bodyInput').value.trim()
    };

    // Спочатку перевіряємо валідацію на стороні клієнта
    if (!validate(dto)) return;

    try {
        // Відправляємо дані на сервер
        const response = await fetch(API_URL, {
            method: 'POST', // Метод для створення
            headers: {
                'Content-Type': 'application/json' // Кажемо серверу, що це JSON
            },
            body: JSON.stringify(dto) // Перетворюємо наш об'єкт у текстовий JSON
        });

        if (response.ok) {
            form.reset(); // Очищаємо форму
            fetchPosts(); // Завантажуємо оновлений список з сервера!
        } else {
            // Якщо сервер повернув 400 (помилка валідації сервера)
            const errData = await response.json();
            alert("Помилка сервера: " + errData.error.message);
        }
    } catch (error) {
        console.error("Помилка при створенні:", error);
    }
});

// 3. Видалення поста (Відправляємо DELETE-запит)
// Зверни увагу: тепер ми передаємо справжній ID (uuid), а не індекс масиву
async function deletePost(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchPosts(); // Оновлюємо таблицю після видалення
        }
    } catch (error) {
        console.error("Помилка при видаленні:", error);
    }
}

// 4. Функція для відмальовування таблиці
function renderTable(posts) {
    const rowsHtml = posts.map((post, index) => {
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${post.title}</td>
                <td>${post.category}</td>
                <td>${post.author}</td>
                <td>${post.body}</td>
                <td>${post.createdAt}</td>
                <td><button onclick="deletePost('${post.id}')">Видалити</button></td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rowsHtml;
}

// ---------------------------------------------------------
// ФУНКЦІЇ ВАЛІДАЦІЇ
// ---------------------------------------------------------

function validate(dto) {
    clearAllErrors();
    let isValid = true;

    if (dto.title === "") {
        showError("titleInput", "titleError", "Заголовок обов'язковий");
        isValid = false;
    }
    if (dto.category !== "Події" && dto.category !== "Навчання" && dto.category !== "Різне") {
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

resetBtn.addEventListener('click', () => {
    form.reset();
    clearAllErrors();
});

// ---------------------------------------------------------
// ЗАПУСК: Завантажуємо пости відразу при відкритті сторінки
// ---------------------------------------------------------
fetchPosts();