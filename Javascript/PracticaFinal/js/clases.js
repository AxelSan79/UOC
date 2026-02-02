/* Script con todas las clases y sus metodos */

class User {
    /* Constructor de la clase User */
    constructor({name, surname, address, city, postalCode, email, username, password, myTeam, wishes}) {
    this._name = name;
    this._surname = surname;
    this._address = address;
    this._city = city;
    this._postalCode = postalCode; 
    this._email = email;
    this._username = username;
    this._password = password;

    this._myTeam = myTeam || [];
    this._wishes = wishes || [];
    }

    /* Getters y Setters */    
    get name() {return this._name;}
    get surname() {return this._surname;}
    get address() {return this._address;}
    get city() {return this._city;}
    get postalCode() {return this._postalCode;}
    get email() {return this._email;}
    get username() {return this._username;}
    get password() {return this._password;}

    get myTeam() {return this._myTeam;}
    get wishes() {return this._wishes;}

    set name(value) {this._name = value;}
    set surname(value) {this._surname = value;}
    set address(value) {this._address = value;}
    set city(value) {this._city = value;}
    set postalCode(value) {this._postalCode = value;}
    set email(value) {this._email = value;}
    set username(value) {this._username = value;}
    set password(value) {this._password = value;}
    
    set myTeam(value) {this._myTeam = value;}
    set wishes(value) {this._wishes = value;}

    /*  Metodos de User  */
    manageList(pokemon, listName, action) {                 // Metodo para gestionar las listas myTeam o wishes.  Añadir o quitar elementos en ellas
    if (!['myTeam', 'wishes'].includes(listName)) {
        return { success: false, message: 'Lista no válida' };
    }

    const list = this[`_${listName}`];
    const id = pokemon.id;

    if (action === 'add') {
        if (listName === 'myTeam' && list.length >= 6) {
            return { success: false, message: 'No puedes tener más de 6 Pokémon en tu equipo' };
        }

        if (!list.includes(id)) {
            list.push(id);
            this.update();
            return { success: true, message: 'Pokémon añadido' };
        }

        return { success: false, message: 'El Pokémon ya está en la lista' };
    }

    if (action === 'remove') {
        const index = list.indexOf(id);
        if (index !== -1) {
            list.splice(index, 1);
            this.update();
            return { success: true, message: 'Pokémon eliminado' };
        }

        return { success: false, message: 'El Pokémon no estaba en la lista' };
    }
}
    save() {                           // Método para guardar el usuario en el localStorage 
        localStorage.setItem('currentUser', JSON.stringify(this.toJSON()));
    }

    update() {                                      // Metodo para almacenar los datos de lsita en su usuario correspondiente
    const users = JSON.parse(localStorage.getItem('usersList')) || [];
    const index = users.findIndex(u => u.username === this._username);

    if (index !== -1) {
        users[index] = this.toJSON();
        localStorage.setItem('usersList', JSON.stringify(users));
    }

    localStorage.setItem('currentUser', this._username);
}

    toJSON() {                      // Metodo para pasar los datos del usuario a JSON
        return {
            name: this._name,
            surname: this._surname,
            address: this._address,
            city: this._city,
            postalCode: this._postalCode,            
            email: this._email,
            username: this._username,
            password: this._password,
            myTeam: this._myTeam,
            wishes: this._wishes
        };
    }

    static fromJSON(json) {                 // Metodo para regenerar el objeto usuario desde archivo JSON
        const user = new User(json);
        return user;
    }
}

class Pokemon {
    /* Constructor de la clase Pokemon */
    constructor({ id, name, description, height, weight, baseExperience, types, sprites, stats, abilities }) {
    this._id = id;
    this._name = name;
    this._description = description;
    this._height = height;
    this._weight = weight;
    this._baseExperience = baseExperience; 
    this._types = types;
    this._sprites = sprites;
    this._stats = stats;
    this._abilities = abilities;
    }

    /* Getters y Setters */ 
    get id() {return this._id;}
    get name() {return this._name;}
    get description() {return this._description;}
    get height() {return this._height;}
    get weight() {return this._weight;}
    get baseExperience() {return this._baseExperience;}
    get types() {return this._types;}
    get sprites() {return this._sprites;}
    get stats() {return this._stats;}
    get abilities() {return this._abilities;}
    get displayName() {
        return this._name.charAt(0).toUpperCase() + this._name.slice(1);        //  Getter para convertir nombre a capital letter
    }

    set id(value) {this._id = value;}
    set name(value) {this._name = value;}
    set description(value) {this._description = value;}
    set height(value) {this._height = value;}
    set weight(value) {this._weight = value;}
    set baseExperience(value) {this._baseExperience = value;}
    set types(value) {this._types = value;}
    set sprites(value) {this._sprites = value;}
    set stats(value) {this._stats = value;}
    set abilities(value) {this._abilities = value;}

    toJSON() {                      // Metodo para pasar los datos del Pokemon a JSON
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            height: this.height,
            weight: this.weight,
            baseExperience: this.baseExperience,
            types: this.types,
            sprites: this.sprites,
            stats: this.stats,
            abilities: this.abilities
        };
    }

    static fromJSON(json) {             // Metodo para regenerar el objeto Pokemon desde archivo JSON
        return new Pokemon(json);
    }

    static fromAPI(details, description) {          // Metodo para generar el objeto Pokemon con los datos de la API
        return new Pokemon({
            id: details.id,
            name: details.name,
            description,
            height: details.height,
            weight: details.weight,
            baseExperience: details.base_experience,
            types: details.types.map(t => t.type.name),
            sprites: details.sprites,
            stats: details.stats,
            abilities: details.abilities.map(a => a.ability.name)
        });
}

}

class PokemonList {
    /* Constructor de la clase PokemonList */
    constructor(nombreLista) {
    this._nombreLista = nombreLista;
    this._pokemons = [];
    }

    /* Getters y Setters */
    get nombreLista() { return this._nombreLista; }
    get pokemons() { return this._pokemons; }

    set nombreLista(value) { this._nombreLista = value; }
    set pokemons(value) { this._pokemons = value; }
    
    toJSON() {
        //...
    }

    fromJSON(pokemons) {
        //...
    }    
}