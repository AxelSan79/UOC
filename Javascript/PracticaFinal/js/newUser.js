/* Script para el registro de usuarios nuevos. Validación de datos y autocompletado de campos */
/* Event Listeners */
document.addEventListener('DOMContentLoaded', () => {           // Esperamos a pagina cargada
    const nameInput = document.getElementById('name');
    const surnameInput = document.getElementById('surname');
    const emailInput = document.getElementById('email');
    const form = document.getElementById('registerForm');
    const citySelect = document.getElementById('city');
    const postalInput = document.getElementById('postalCode');
    const loginButton = document.getElementById('loginButton');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordFeedback = document.getElementById('passwordFeedback');
    const confirmPasswordFeedback = document.getElementById('confirmPasswordFeedback');

    if(!form) return;               // Evitamos error al cargar newUser.js en index.html

    nameInput.addEventListener('input', () => {             // Listener para admitir solo letras en name
        nameInput.value = nameInput.value.replace(/[^A-Za-zÁÉÍÓÚÀÈÒáéíóúàèòÏÜïüÑñ\s-]/g, '');
    });

    surnameInput.addEventListener('input', () => {          // Listener para admitir solo letras en surname
        surnameInput.value = surnameInput.value.replace(/[^A-Za-zÁÉÍÓÚÀÈÒáéíóúàèòÏÜïüÑñ\s-]/g, '');
    });

    citiesData.forEach(city => {            // Creamos variables para el Select del formulario de registro
        const option = document.createElement('option');
        option.value = city.name;
        option.textContent = city.name;
        citySelect.appendChild(option);
    })

    citySelect.addEventListener('change', () => {       // Listener para el autocompletado de Postalcode
        const selected = citiesData.find(c => c.name === citySelect.value);
        if (selected) {
            postalInput.value = selected.postalCodes[0];
        }
    });

    emailInput.addEventListener('input', () => {    // Listener para autocompletado del campo email con @uoc.edu
        if (emailInput.value.includes('@')) {
            emailInput.value = emailInput.value.replace(/@.*/, '@uoc.edu');
        }
    });

    passwordInput.addEventListener('input', () => {
        const passwordInputErrors = checkPassword(passwordInput.value);

        if (passwordInputErrors.length > 0) {
            passwordFeedback.innerHTML = `<i class="fa-solid fa-circle-xmark" style="color:red;"></i>`;
        } else {
            passwordFeedback.innerHTML = `<i class="fa-solid fa-circle-check" style="color:green;"></i>`;
        }

        if (confirmPasswordInput.value.trim() !== "") {
            validatePasswordMatch();
        }
    });

    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    
    function validatePasswordMatch() {
    if (confirmPasswordInput.value !== passwordInput.value) {
        confirmPasswordFeedback.innerHTML = `<i class="fa-solid fa-circle-xmark" style="color:red;"></i>`;
    } else {
        confirmPasswordFeedback.innerHTML = `<i class="fa-solid fa-circle-check" style="color:green;"></i>`;
    }
}

    loginButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    form.addEventListener('submit', (e) => {    // Listener para pasar los datos del formulario primero para checker y luego registrarlos en User
        e.preventDefault();
        const userData = {
        name : document.getElementById('name').value.trim(),
        surname : document.getElementById('surname').value.trim(),
        address : document.getElementById('address').value.trim(),
        city : document.getElementById('city').value.trim(),
        postalCode : document.getElementById('postalCode').value.trim(),
        email : document.getElementById('email').value.trim(),
        username : document.getElementById('username').value.trim(),
        password : document.getElementById('password').value.trim()
        };
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        if (!checkFormErrors(userData, confirmPassword)) return;
        registerUser(userData);
        form.reset();
        passwordFeedback.innerHTML = '';
        confirmPasswordFeedback.innerHTML = '';
    });
});

/* Funciones y helpers */
function checkFormErrors(userData, confirmPassword) {    // Comprobamos todos los posibles errores del formulario
    const errors = []

    const usersList = getUsersList();
    const userExist = usersList.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
    const errorsList = document.getElementById('errorsList');
    const cityObj = citiesData.find(c => c.name === userData.city);
    errorsList.innerHTML = '';
    const emailErrors = checkEmail(userData.email);
    const passwordErrors = checkPassword(userData.password);

    if (!userData.name) errors.push('El nombre es obligatorio');
    if (!userData.surname) errors.push('Los apellidos son obligatorios');
    if (!userData.address) errors.push('La dirección es obligatoria');
    if (!cityObj) {
        errors.push('La ciudad seleccionada no es válida');
    } else if (!cityObj.postalCodes.includes(userData.postalCode)) {
        errors.push('El código postal no coincide con la ciudad seleccionada');
    }
    if (!userData.username) errors.push('El usuario es obligatorio');
    if (userData.username && userExist) errors.push('Nombre de usuario ya existente');
    errors.push(...emailErrors);
    errors.push(...passwordErrors);
    if (userData.password !== confirmPassword) {
        errors.push('Las contraseñas no coinciden');
    }
    if (errors.length > 0) {    // Si hay errores en el formulario, construimos un listado <ul> con todos los avisos
        errorsList.classList.remove('hidden');
        errors.forEach(err => {
            const li = document.createElement('li');
            li.textContent = err;
            errorsList.appendChild(li);
        });

        return false;
    }

    errorsList.classList.add('hidden');
    return true;
}

function checkEmail(email) {    // Funcion validadora de email 
    const mailErrors = [];
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) mailErrors.push('El email no tiene un formato válido');
    if (!email.endsWith('@uoc.edu')) mailErrors.push('El email debe terminar en @uoc.edu');
    return mailErrors;
}

function checkPassword(password) {  // Funcion validadora de password
    const passwErrors = [];
    if (password.length < 8) passwErrors.push('La contraseña debe tener al menos 8 caracteres');
    if (!/[A-Za-z]/.test(password)) passwErrors.push('La contraseña debe contener letras');
    if (!/[0-9]/.test(password)) passwErrors.push('La contraseña debe contener números');
    if (!/[^A-Za-z0-9]/.test(password)) passwErrors.push('La contraseña debe contener al menos un carácter especial');
    return passwErrors;
}

function getUsersList() {       
    return JSON.parse(localStorage.getItem('usersList')) || [];
}

function saveUsersList(usersList) {
    localStorage.setItem('usersList', JSON.stringify(usersList));
}

function registerUser(userData) {
    const usersList = getUsersList();
    const newUser = new User(userData);
    usersList.push(newUser);
    saveUsersList(usersList);
    alert('Usuario registrado con éxito');
    window.location.href = 'index.html';
}