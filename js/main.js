const API_URL = "https://booksrental-2jtkn4w3.b4a.run";
// Funções de autenticação
function login(email, password) {
  const token = btoa(`${email}:${password}`);
  return fetch(`${API_URL}/login`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Falha no login");
      return response.json();
    })
    .then((data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      window.location.href = "catalog.html";
    });
}

function register(name, email, phone, password) {
  return fetch(`${API_URL}/user/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, phone, password }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Falha no registro");
      return response.json();
    })
    .then((data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      window.location.href = "catalog.html";
    });
}

// Funções de gerenciamento de livros
function getBooks() {
  const token = localStorage.getItem("token");
  return fetch(`${API_URL}/book/`, {
    headers: {
      Authorization: `Basic ${token}`,
    },
  })
    .then((response) => response.json())
    .then((books) => {
      // Adicionar informação sobre disponibilidade e quem alugou
      return books.map((book) => ({
        ...book,
        available: !book.isRented,
        rentedByCurrentUser:
          book.rentedBy?.id == localStorage.getItem("userId"),
      }));
    });
}

function rentBook(bookId) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  return fetch(`${API_URL}/book/rent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
    body: JSON.stringify({ idBook: bookId, idUser: userId }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Falha ao alugar o livro");
      return response.json();
    })
    .then(() => {
      // Atualizar a interface
      const bookElement = document.querySelector(`[data-book-id="${bookId}"]`);
      if (bookElement) {
        const rentButton = bookElement.querySelector("button:first-of-type");
        const returnButton = bookElement.querySelector("button:last-of-type");
        rentButton.disabled = true;
        rentButton.textContent = "Indisponível";
        returnButton.disabled = false;
        returnButton.textContent = "Devolver";
      }
    });
}

function returnBook(bookId) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  return fetch(`${API_URL}/book/hand-back`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
    body: JSON.stringify({ idBook: bookId, idUser: userId }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Falha ao devolver o livro");
      return response.json();
    })
    .then(() => {
      // Atualizar a interface
      const bookElement = document.querySelector(`[data-book-id="${bookId}"]`);
      if (bookElement) {
        const rentButton = bookElement.querySelector("button:first-of-type");
        const returnButton = bookElement.querySelector("button:last-of-type");
        rentButton.disabled = false;
        rentButton.textContent = "Alugar";
        returnButton.disabled = true;
        returnButton.textContent = "Não alugado por você";
      }
    });
}

function addBook(title, author, image) {
  const token = localStorage.getItem("token");
  return fetch(`${API_URL}/book/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
    body: JSON.stringify({ title, author, image }),
  }).then((response) => {
    if (!response.ok) throw new Error("Falha ao adicionar o livro");
    return response.json();
  });
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerFormElement");
  const showRegisterLink = document.getElementById("showRegister");
  const bookList = document.getElementById("bookList");
  const addBookForm = document.getElementById("addBookForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      login(email, password);
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("regName").value;
      const email = document.getElementById("regEmail").value;
      const phone = document.getElementById("regPhone").value;
      const password = document.getElementById("regPassword").value;
      register(name, email, phone, password);
    });
  }

  if (showRegisterLink) {
    showRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("registerForm").style.display = "block";
    });
  }

  if (bookList) {
    getBooks().then((books) => {
      books.forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.className = "book-item";
        bookElement.setAttribute("data-book-id", book.id);
        bookElement.innerHTML = `
                <img src="${book.image}" alt="${book.title}">
                <h3>${book.title}</h3>
                <p>${book.author}</p>
                <button onclick="rentBook(${book.id})" 
                    ${!book.available ? "disabled" : ""}>
                    ${book.available ? "Alugar" : "Indisponível"}
                </button>
                <button onclick="returnBook(${book.id})" 
                    ${!book.rentedByCurrentUser ? "disabled" : ""}>
                    ${
                      book.rentedByCurrentUser
                        ? "Devolver"
                        : "Não alugado por você"
                    }
                </button>
            `;
        bookList.appendChild(bookElement);
      });
    });
  }

  if (addBookForm) {
    addBookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("title").value;
      const author = document.getElementById("author").value;
      const image = document.getElementById("image").value;
      addBook(title, author, image).then(() => {
        window.location.href = "catalog.html";
      });
    });
  }
});
