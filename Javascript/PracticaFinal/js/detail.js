/*  Este script carga la información del Pokemon seleccionado y la muestra en la página de detalles.  */

/*  Pasamos el ID del pokemon por URL y regeneramos el objeto pokemon a partir de ese dato  */
const params = new URLSearchParams(window.location.search);
const pokemonId = params.get('id');
const pokemonsData = JSON.parse(localStorage.getItem('pokemonsData'));
const pokemon = pokemonsData.find(p => p.id == pokemonId);
const currentPokemon = Pokemon.fromJSON(pokemon);
const storedUser = localStorage.getItem('currentUser');

/*  Event Listeners  */
document.addEventListener('DOMContentLoaded', () => {           // Control del boton de Home
    const homeIcon = document.querySelector('.home-icon');
    if (homeIcon) {
        homeIcon.addEventListener('click', () => {
            location.href = 'index.html';
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {       //  Se pinta la card una vez cargado el DOM
    renderDetail();
    });

/*  Funciones y Helpers*/
function renderDetail() {                   // Funcion para pintar la card y añadirle las clases in-team o in-wish
    const user = getCurrentUser();
    if (!user) return;
    const container = document.getElementById('pokemonDetail');
    if (!currentPokemon) {
        container.innerHTML = `<p>Pokémon no encontrado.</p>`;
        return;
    }

    const isInTeam = user.myTeam.includes(currentPokemon.id);
    const isInWish = user.wishes.includes(currentPokemon.id);

    container.className = `pokemon-card ${isInTeam ? 'in-team' : ''} ${isInWish ? 'in-wish' : ''}`;

    container.innerHTML = `
            <div class="detail-card-upper">
            <div class="upper-left">
                <div class="card-header">
                    <h2 class="pokemon-name">${currentPokemon.displayName}</h2>
                    <p><strong>#${currentPokemon.id.toString().padStart(3,'0')}</strong></p>
                </div>
            </div>
            <div class="upper-right">
                <img src="${currentPokemon.sprites.other["official-artwork"].front_default}" alt="${currentPokemon.name}"> 
                <!--img src="${currentPokemon.sprites.front_default}" alt="${currentPokemon.name}"-->
            </div>
            </div>
            <div class="detail-text">
                <p><strong>Altura:</strong> ${currentPokemon.height}</p>
                <p><strong>Peso:</strong> ${currentPokemon.weight}</p>
                <p><strong>Tipos:</strong> ${currentPokemon.types.join(', ')}</p>
                <p><strong>Habilidades:</strong> ${currentPokemon.abilities.join(', ')}</p>
                <p><strong>Experiencia Base:</strong> ${currentPokemon.baseExperience}</p>
                <p ><strong>Stats:</strong></p>
                    <ul class="detail-stats">
                        ${currentPokemon.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join('')}
                    </ul>
            </div>            
        <div class="detail-card-lower">
            <p class="pokemon-description">${currentPokemon.description}</p>       
            <div class="card-icons">
                <i class="fa-solid ${isInTeam ? 'fa-minus' : 'fa-plus'} team-icon" title="Mi equipo"></i>
                <i class="fa-solid fa-heart wish-icon ${isInWish ? 'active' : ''}" title="Favoritos"></i>
            </div>
        </div>
    `;

    attachDetailListeners(container, currentPokemon);
}

function attachDetailListeners(card, pokemon) {             //  Funcion para controlar los listeners de los buttons add/remove de la card
    const teamIcon = card.querySelector('.team-icon');
    const wishIcon = card.querySelector('.wish-icon');

    teamIcon.addEventListener('click', (e) => {
        const user = getCurrentUser();
        if (!user) return;
        e.stopPropagation();                                // Evitamos propagacion de comportamiento al resto de la card
        const action = user.myTeam.includes(pokemon.id) ? 'remove' : 'add';
        const result = user.manageList(pokemon, 'myTeam', action);                  // Calculamos add o remove y pasamos el metodo a manageList (clases) para actualizar listas. 

        if (!result.success) {
            alert(result.message);
            return;
        }
        if (action === 'add') {
            alert(`${pokemon.displayName} añadido a tu equipo.`);
        } else {
            alert(`${pokemon.displayName} eliminado de tu equipo.`);
        }

        card.classList.toggle('in-team', action === 'add');
        teamIcon.classList.toggle('fa-plus', action === 'remove');
        teamIcon.classList.toggle('fa-minus', action === 'add');                    // Actualizamo CSS clases y fa-icons

        updateMenuCounters();           // Al finalizar, se actualizan los menuCounters
    });

    wishIcon.addEventListener('click', (e) => {
        const user = getCurrentUser();
        if (!user) return;
        e.stopPropagation();
        const action = user.wishes.includes(pokemon.id) ? 'remove' : 'add';
        const result = user.manageList(pokemon, 'wishes', action);
        
        if (!result.success) {
            alert(result.message);
            return;
        }
        if (action === 'add') {
            alert(`${pokemon.displayName} añadido a tu lista de deseos.`);
        } else {
            alert(`${pokemon.displayName} eliminado de tu lista de deseos.`);
        }

        card.classList.toggle('in-wish', action === 'add');
        wishIcon.classList.toggle('active', action === 'add');

        updateMenuCounters();
    });
}
