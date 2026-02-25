/*  Funciones Comunes en todos los archivos.js  */
function getCurrentUser() {         // Funcion para regenerar el objeto user a partir del username
    const username = localStorage.getItem('currentUser');
    if (!username) return null;

    const users = JSON.parse(localStorage.getItem('usersList')) || [];
    const userData = users.find(u => u.username === username);

    return userData ? User.fromJSON(userData) : null;
}
