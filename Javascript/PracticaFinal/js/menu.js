/* Script para generar la Navbar y toda la logica en ella */

/*  Event Listeners  */
document.addEventListener('DOMContentLoaded', () => {
    updateMenu();  
    const logoutBtn = document.getElementById('logoutButton');      // Logout Button
    if (!logoutBtn) return;      
    logoutBtn.addEventListener('click', (e) => {
         e.preventDefault();  
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('pokemonFilters');
        location.href = 'index.html';
    });
});

/*  Fnciones y Helpers*/
function updateMenu() {         // Funcion que genera la Navbar
    const menu = document.getElementById('mainMenu');
        menu.innerHTML = `<div class="navbar-left">
                <a href="index.html"><img src="../img/pokedex-uoc.png"></a>
            </div>
            <ul class="navbar-right">
                <li><a href="index.html">Pokemons</a></li>
                <li><a href="listas.html">Listas
                    <div class="menu-icons">
                    <div class="menu-icon">
                        <i class="fa-solid fa-user"></i> <span id="myTeamCount"></span>
                    </div>
                    <div class="menu-icon">
                        <i class="fa-solid fa-heart"></i> <span id="wishesCount"></span>
                    </div>
                    </div>
                <li><a href="video.html">Video</a></li>
                <li class="dropdown">
                    <a href="#" class="dropbtn" id="menuButton">Usuario</a>
                    <div class="dropdown-content">
                        <a href="#" id="logoutButton">Logout</a>
                    </div>
                </li>
            </ul>`
    ;    
    updateMenuCounters(); 
}

function updateMenuCounters() {         // Funcion que actualiza los Lists Counters
    const user = getCurrentUser();
    if (!user) return;

    const myTeamCountEl = document.getElementById('myTeamCount');
    const wishesCountEl = document.getElementById('wishesCount');

    if (myTeamCountEl) myTeamCountEl.textContent = user.myTeam.length;
    if (wishesCountEl) wishesCountEl.textContent = user.wishes.length;
}
