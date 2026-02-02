/* Script principal del Login que esta en la pagina Index. Si no hay usuario logeado, muestra login */

/* Event Listeners */
document.addEventListener('DOMContentLoaded', () => {       
    const currentUser = localStorage.getItem('currentUser');
    if(currentUser) {                                       // Comprobamos si hay un usuario logeado y mostramos indice de Pokemons si true
        document.getElementById('index-section').classList.remove('hidden');
        document.querySelector('header').classList.remove('hidden');
    } else {
        document.getElementById('login-section').classList.remove('hidden');
    }

    document.getElementById('newUser').addEventListener('click', () => {
        window.location.href = 'newUser.html';
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {                                        // Validacion de usuario
        loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (!usernameInput || !passwordInput) return;

        const username = usernameInput.value;
        const password = passwordInput.value;
        const usersList = getUsersList();
        const user = usersList.find(u => u.username === username && u.password === password);
        if(user) {                                          // A partir de aqui trabajaremos solo con el username, cuando lo necesitemos, regeneraremos el objeto user
            localStorage.setItem('currentUser', user.username);         
            updateMenu();
            document.getElementById('login-section').classList.add('hidden');
            document.getElementById('index-section').classList.remove('hidden');
            document.querySelector('header').classList.remove('hidden');
        } else {
        alert('Usuario o contraseña incorrectos');
        }
        e.target.reset();
        location.reload();
        });
        }
});

/*  Funciones y Helpers */
function getUsersList() {
    return JSON.parse(localStorage.getItem('usersList')) || [];
}