/* Script para generar el array principal de objetos Pokemon. Si no existe en localStorage, llama a la API. De lo contrario, se trabaja siempre con los 151 Pokemons ya almacenados*/
/* Este Script controla la paginacion y filtrado de index.html asi como la logica de añadir o quitar Pokemons de las listas*/

let allPokemons = [];
let filteredPokemons = [];
let currentIndex = 0;
let pageSize = 12;
let currentURL = config.apiBaseUrl;
let user = null;


const filtersState = {
    types: [],
    search: '',
    weightMin: null,
    weightMax: null,
    sort: 'idAsc',
    scrollY: 0
};

/* Event Listeners */
window.addEventListener("pageshow", async (event) => {          // Listener para mantener datos de filtrado y menuCountes aun viniendo desde browser back button    
    if (event.persisted) {
        user = getCurrentUser();
        allPokemons = await loadPokemons();
        filteredPokemons = [...allPokemons];

        restoreFilters();
        applyFilters();
        updateMenuCounters();
    }
});

document.addEventListener('DOMContentLoaded', async () => {         // Con documento cargado, llamamos a allPokemons, cargamos usuario, iniciamos filtros y renderizamos las cards
    user = getCurrentUser();
    allPokemons = await loadPokemons();
    filteredPokemons = [...allPokemons];
    const searchForm = document.getElementById('search-form');
    restoreFilters();
    initTypeFilters();
    initSearchFilters();
    initSortFilter();
    renderPokemons(true);

    document.getElementById('loadMore')
        .addEventListener('click', () => renderPokemons());         // Listener para el boton de cargar mas Pokemons

    searchForm.addEventListener('submit', (e) => {          // Listener para alicar los filtros del formulario con submit
        e.preventDefault(); 
        applyFilters();
          
    });

    document.getElementById("resetFilters").addEventListener("click", () => {       // Listener para el boton de resetear filtros
    resetFilters();
    });

    document.getElementById('pageSizeSelect').addEventListener('change', (e) => {       // Listener para el select de "Mostrando X de Y"
    pageSize = parseInt(e.target.value);
    renderPokemons(true); 
    });
});  

/* Funciones y Helpers */
async function loadPokemons() {             // Funciona para cargar Pokemons. Solo si no estan cacheados llamamos a API
    const storageKey = 'pokemonsData';
    try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {                // Comprobamos cache
            try {
                const parsed = JSON.parse(cached);
                if (parsed.length > 0) {
                    return parsed.map(p => Pokemon.fromJSON(p));     // Reconstruimos objetos Pokemon con fromJSON
                }
            } catch (error) {
                console.error("Error parseando localStorage:", error);
            }
        }

        mostrarLoader();

        const response = await fetch(currentURL);                             //  Si no hay cache llamamos a la API
        if (!response.ok) throw new Error("Error en la llamada a la API");
        const data = await response.json();
        const results = data.results;

        const detailPromises = results.map(r =>         // Obtenemos datos de los 151 Pokemons en paralelo y no en serie
            fetch(r.url).then(res => {
                if (!res.ok) throw new Error(`Error en detalle de ${r.name}`);
                return res.json();
            })
        );
        const detailsArray = await Promise.all(detailPromises);     

        const descriptionPromises = detailsArray.map(d =>       // Obtenemos descripciones de los 151 Pokemons en paralelo y no en serie
            getPokemonDescription(d.species.url)
        );
        const descriptions = await Promise.all(descriptionPromises);

        const apiPokemons = detailsArray.map((details, index) =>        // Construimos los 151 objetos Pokemon con "fromAPI"
            Pokemon.fromAPI(details, descriptions[index])
        );

        localStorage.setItem(storageKey, JSON.stringify(apiPokemons.map(p => p.toJSON())));      // Guardamos datos en localStorage  
        return apiPokemons;
        
    } catch (error) {
        console.error("Error general en loadPokemons:", error);
        return [];
    }

    finally {
        
        ocultarLoader();
    }
}

async function getPokemonDescription(speciesUrl) {          // Funcion para obtener las descripciones de Pokemons
    try {
        const response = await fetch(speciesUrl);
        if (response.ok) {
            const speciesData = await response.json();
            
            const spanishEntry = speciesData.flavor_text_entries.find(          // Busca descripción en español
                entry => entry.language.name === 'es'
            );
            
            return spanishEntry ? 
                spanishEntry.flavor_text.replace(/\n/g, ' ').replace(/\f/g, ' ') : 
                "Descripción no disponible en español";
        }
        
    } catch (error) {
        console.error('Error crítico en getPokemonDescription:', error);
        return "Error al cargar descripción";
    }
}

function applyFilters(saveState = true) {                   //  Funcion para aplicar los filtros del formulario y del sort y guardar estado en sessionStorage  si es necesario
    filteredPokemons = allPokemons.filter(pokemon => {

        if (filtersState.types.length) {                        // Filtro por tipos. Para la typeList
            const match = filtersState.types.some(t =>
                pokemon.types.includes(t)
            );
            if (!match) return false;
        }

        if (filtersState.search) {                              // Filtro por nombre o numero
            const s = filtersState.search.toLowerCase();
            if (
                !pokemon.name.toLowerCase().includes(s) &&
                pokemon.id.toString() !== s
            ) return false;
        }

        if (filtersState.weightMin !== null && pokemon.weight < filtersState.weightMin)             // Filtros por peso
            return false;

        if (filtersState.weightMax !== null && pokemon.weight > filtersState.weightMax)
            return false;

        return true;
    });

    applySort();

    currentIndex = 0;
    renderPokemons(true);

    if (saveState) {
        sessionStorage.setItem('pokemonFilters', JSON.stringify(filtersState));
    }
}

function applySort() {                  // Funcion para controlar el sort select. Por defecto idAsc
    const s = filtersState.sort;

    filteredPokemons.sort((a, b) => {
        switch (s) {
            case 'idAsc': return a.id - b.id;
            case 'idDesc': return b.id - a.id;
            case 'nameAsc': return a.name.localeCompare(b.name);
            case 'nameDesc': return b.name.localeCompare(a.name);
        }
    });
}

function initSortFilter() {                 //  Funcion que inicia el sort select
    document.getElementById('orden').addEventListener('change', e => {
        filtersState.sort = e.target.value;
        applyFilters();
    });
}

function initTypeFilters() {            // Funcion que inicia y escucha el typeList filter. Aplica una class "active" a cada elemento y reaplica filtros
    document.querySelectorAll('#typeList li').forEach(li => {
        li.addEventListener('click', () => {
            li.classList.toggle('active');

            filtersState.types = [...document.querySelectorAll('#typeList li.active')]
                .map(li => li.dataset.type);

            applyFilters();
        });
    });
}

function initSearchFilters() {                      //  Funcion que inicializa y escucha los filtros por nombre, ID y peso y reaplica filtros
    document.getElementById('searchButton').addEventListener('click', () => {
        filtersState.search = document.getElementById('searchInput').value.trim();
        filtersState.weightMin = parseInt(document.getElementById('weightMin').value) || null;
        filtersState.weightMax = parseInt(document.getElementById('weightMax').value) || null;

        applyFilters();
    });
}

function restoreFilters() {                 // Funcion para recuperar filtros cuando volvemos de otras paginas. NO guardamos en sessionStorage!
    const saved = sessionStorage.getItem('pokemonFilters');
    if (!saved) return;

    Object.assign(filtersState, JSON.parse(saved));

    document.getElementById('searchInput').value = filtersState.search;
    document.getElementById('weightMin').value = filtersState.weightMin ?? '';
    document.getElementById('weightMax').value = filtersState.weightMax ?? '';
    document.getElementById('orden').value = filtersState.sort;

    document.querySelectorAll('#typeList li').forEach(li => {
        if (filtersState.types.includes(li.dataset.type)) {
            li.classList.add('active');
        }
    });

    applyFilters(false);

    setTimeout(() => {                      // Recuperamos tambien la posicion del punto de scroll que teniamos
        window.scrollTo(0, filtersState.scrollY || 0);
    }, 50);
}


function mostrarLoader() {              // Función para mostrar el loader y desenfocar la pantalla. En condiciones normales, no deberia ser necesario
    const loader = document.getElementById('loader');
    if (!loader) return;
    loader.style.display = 'block';
    document.body.classList.add('loading');
}

function ocultarLoader() {              // Función para ocultar el loader y eliminar el desenfoque
    const loader = document.getElementById('loader');
    if (!loader) return;
    loader.style.display = 'none';
    document.body.classList.remove('loading');
}

function renderPokemons(reset = false) {            //  Funcion para calcular el numero de cards a renderizar. O currentIndex o index cero. 
    const loadMoreBtn = document.getElementById('loadMore');

    if (reset) {
        currentIndex = 0;
    }

    const slice = filteredPokemons.slice(0, currentIndex + pageSize);
    currentIndex = slice.length;

    renderPokemonSlice(slice);
    updateResultsSelect();

    const noMoreResults = currentIndex >= filteredPokemons.length;

    loadMoreBtn.disabled = noMoreResults;
    loadMoreBtn.classList.toggle("disabled", noMoreResults);                // Controlamos el boton loadMore
}

function renderPokemonSlice(pokemons) {             // Funcion para pintar las cards en el grid principal. Aplicamos CSS clases para los fa-icons
    const container = document.getElementById('resultados');
    container.innerHTML = '';

    pokemons.forEach(pokemon => {
        const isInTeam = user ? user.myTeam.includes(pokemon.id) : false;
        const isInWish = user ? user.wishes.includes(pokemon.id) : false;
        
        const card = document.createElement('div');
        card.className = `pokemon-card ${isInTeam ? 'in-team' : ''} ${isInWish ? 'in-wish' : ''}`;

        card.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h3>${pokemon.displayName}</h3>
            <p>#${pokemon.id}</p>
            <p class="pokemon-types">${pokemon.types.join(', ')}</p>
            <div class="card-icons">
                <i class="fa-solid ${isInTeam ? 'fa-minus' : 'fa-plus'} team-icon"></i>
                <i class="fa-solid fa-heart wish-icon ${isInWish ? 'active' : ''}"></i>
            </div>
        `;

        container.appendChild(card);
        attachListListeners(card, pokemon, user);

        card.addEventListener('click', () => {              // llamamos a los listeners de control de los fa-icon buttons
            filtersState.scrollY = window.scrollY;
            sessionStorage.setItem('pokemonFilters', JSON.stringify(filtersState));
            window.location.href = `detail.html?id=${pokemon.id}`;
        });
    });
}

function attachListListeners(card, pokemon, user) {                // Funcion para añadir los listeneres a los fa-icons
    const teamIcon = card.querySelector('.team-icon');
    const wishIcon = card.querySelector('.wish-icon');

    teamIcon.addEventListener('click', (e) => {             // Listener para logica add/remove, actualizar cards y menuCounters
        e.stopPropagation(); 

        const action = user.myTeam.includes(pokemon.id) ? 'remove' : 'add';
        const result = user.manageList(pokemon, 'myTeam', action);

         if (!result.success) {
            alert(result.message);
            return;
        } else {
            if (action === 'add') {
                alert(`${pokemon.displayName} añadido a tu equipo.`);
            } else {
                alert(`${pokemon.displayName} eliminado de tu equipo.`);
            }
            refreshCards();
            updateMenuCounters();
        }
    });

    wishIcon.addEventListener('click', (e) => {
        e.stopPropagation(); 

        const action = user.wishes.includes(pokemon.id) ? 'remove' : 'add';
        const result = user.manageList(pokemon, 'wishes', action);

        if (!result.success) {
            alert(result.message);
            return;
        } else {

            if (action === 'add') {
                alert(`${pokemon.displayName} añadido a tu lista de deseos.`);
            } else {
                alert(`${pokemon.displayName} eliminado de tu lista de deseos.`);
            }

            refreshCards();
            updateMenuCounters();
        }
    });
}

function refreshCards() {           // Funcion para refrescar las cards con los pokemons filtrados
    renderPokemonSlice(
        filteredPokemons.slice(0, currentIndex)
    );
}

function updateResultsSelect() {        //  Funcion para controlar el select de numero de Pokemons por pagina
    const info = document.getElementById('resultsInfo');
    if (!info) return;

    const total = filteredPokemons.length;
    const actual = currentIndex;
    info.textContent = `Mostrando ${actual} de ${total}`;
}

function resetFilters() {                           // Funcion para borrar todos los filtros aplicados, actualizar filterState a cero y renderizar de nuevo el grid 
    const searchInput = document.getElementById("searchInput");
    const weightMin = document.getElementById("weightMin");
    const weightMax = document.getElementById("weightMax");

    if (searchInput) searchInput.value = "";
    if (weightMin) weightMin.value = "";
    if (weightMax) weightMax.value = "";

    document.querySelectorAll('#typeList li.active').forEach(li => li.classList.remove('active'));
    const sortSelect = document.getElementById("orden");
    if (sortSelect) sortSelect.value = "idAsc";

    filtersState.search = '';
    filtersState.weightMin = null;
    filtersState.weightMax = null;
    filtersState.types = [];
    filtersState.sort = 'idAsc';
    filtersState.scrollY = 0;

    sessionStorage.removeItem("pokemonFilters");
    applyFilters(true);
    if (typeof updateMenuCounters === "function") {
        updateMenuCounters();
    }
}




