/*  Script para gestionar la visualización de las listas de Pokemons del usuario.  */

let currentView = 'myTeam'; // por defecto

/*  Event Listeners  */
document.addEventListener('DOMContentLoaded', async () => {
  allPokemons = await loadAllPokemonsForLists();                // Llamamos a cargar all Pokemons desde lists.js para evitar cargar pokemon.js en detail.html

  document.getElementById('teamBtn')?.addEventListener('click', () => {         // Listeners de los toggle buttons myTeam/wishes
    setActive('myTeam');
  });

  document.getElementById('wishesBtn')?.addEventListener('click', () => {
    setActive('wishes');
  });
  
  renderList(currentView);

  window.addEventListener("pageshow", async (event) => {            //  Listener para actualizar los menuCounters y las listas aunque se llegue aqui con browser BACK button
    if (event.persisted) {
        const user = getCurrentUser();
        allPokemons = await loadAllPokemonsForLists();
        renderList(currentView);
        updateMenuCounters();
        }
    });

  document.querySelector('.home-icon').addEventListener('click', () => {    
        location.href = 'index.html';
  });
});

/*  Funciones y Helpers  */ 
async function loadAllPokemonsForLists() {
  const cached = localStorage.getItem('pokemonsData');

  if (cached) {                              // Se buscan Pokemons en LocalStorage, si no los hay, se llama a la API
    const parsed = JSON.parse(cached);
    return parsed.map(p => Pokemon.fromJSON(p));
  }

 const response = await fetch(config.apiBaseUrl);  // Bloque de codigo por si falla el cached (Se haria una llamada a API, inevitable, pero muy raro que suceda en este punto)
  const data = await response.json();

  const detailPromises = data.results.map(r =>
    fetch(r.url).then(res => res.json())
  );

  const details = await Promise.all(detailPromises);

  return details.map(d => Pokemon.fromAPI(d, ''));
}

function renderList(view) {                 // Funcion para renderizar las listas de Pokemon en el grid, segun tipo de lista
  let user = getCurrentUser();
  if (!user) return;

  const container = document.getElementById('listsGrid');
  container.innerHTML = '';

  const ids = view === 'myTeam' ? user.myTeam : user.wishes;

  if (!ids.length) {
    container.innerHTML = `<p>No hay Pokémon en esta lista</p>`;
    return;
  }

  ids.forEach(id => {
    const pokemon = allPokemons.find(p => p.id === id);
    if (!pokemon) return;
    
    const isInTeam = user.myTeam.includes(pokemon.id);
    const isInWish = user.wishes.includes(pokemon.id);
    const card = document.createElement('div');

    card.className = `pokemon-card ${isInTeam ? 'in-team' : ''} ${isInWish ? 'in-wish' : ''}`;      

    card.innerHTML = `                                          
        <img src="${pokemon.sprites.front_default}">
        <h3>${pokemon.displayName}</h3>
        <p>#${pokemon.id}</p>
        <p>${pokemon.types}</p>

        <div class="card-icons">
            <i class="fa-solid ${isInTeam ? 'fa-minus' : 'fa-plus'} team-icon"></i>
            <i class="fa-solid fa-heart wish-icon ${isInWish ? 'active' : ''}"></i>
        </div>
        `;                                  //  Pintamos las cards y añadimos icons

    attachListCardListeners(card, pokemon, user);
    container.appendChild(card);
    card.addEventListener('click', () => {
        window.location.href = `detail.html?id=${pokemon.id}`;
    });
  });
}

function attachListCardListeners(card, pokemon, user) {             // Funcion para añadir los listeneres a los fa-icons
  const teamIcon = card.querySelector('.team-icon');
  const wishIcon = card.querySelector('.wish-icon');

  teamIcon.addEventListener('click', e => {                         // Listener para logica add/remove y actualizar listas
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
    renderList(currentView);
    updateMenuCounters();                                                   // Volvemos a cargar listas y actualizamos menuCounters
    }
  });

  wishIcon.addEventListener('click', e => {
    e.stopPropagation();
    //user.manageList(pokemon, 'wishes', 'remove');
    const action = user.wishes.includes(pokemon.id) ? 'remove' : 'add';
    const result = user.manageList(pokemon, 'wishes', action);
    if (!result.success) {
        alert(result.message);
        return;
    } else {
    if (action === 'add') {
            alert(`${pokemon.displayName} añadido a tu lista de deseos.`);
        } else {
            alert(`${pokemon.displayName} eliminado de tu lista de deseos`);
        }
    renderList(currentView);
    updateMenuCounters();
    }
  });
}

function setActive(view) {                  // Funcion para cambiar vistas de lista (toggle)
  currentView = view;
  document.getElementById('teamBtn').classList.toggle('active', view === 'myTeam');
  document.getElementById('wishesBtn').classList.toggle('active', view === 'wishes');

  renderList(view);
}

