// Importacion de todos los modulos ---------------------------------------------------------------

// Framework express
const express = require("express");
// File system (lectura y escritura de documentos)
const fs = require("fs");
// Permitir CORS
const cors = require("cors");
// Path para ayudar a construir paths de archivos
const path = require("path");
const { stringify } = require("querystring");

// Creacion de la app web en el puerto 3000 -------------------------------------------------------
const app = express();
const port = 3000;

// Variables globales

// Cache de pokemon ya buscados -----------------------------------------------------------------
const pokemonCache  = {};
const pokemonbyNameCache = {};
const pokemonbyTypeCache = {
    normal: [],
    fire: [],
    water: [],
    electric: [],
    grass: [],
    ice: [],
    fighting: [],
    poison: [],
    ground: [],
    flying: [],
    psychic: [],
    bug: [],
    rock: [],
    ghost: [],
    dragon: [],
    dark: [],
    steel: [],
    fairy: []
};
const moveInfoCache = {};

// Habilitar el uso de CORS
app.use(cors());
// Traduce el body de los requests directamente a un objeto json
app.use(express.json());
// Cuando un usuario entre al servidor busca los archivos de la carpeta public
app.use(express.static("public"));

// Creacion de rutas ------------------------------------------------------------------------------

// Ruta de pagina de login
app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, "public", "index.html"));
})
// Ruta de pagina de register
app.get("/register", (req, res) =>{
    res.sendFile(path.join(__dirname, "public", "register.html"));
})
// Ruta de pagina de informacion de pilotos
app.get("/drivers-info", (req, res) =>{
    res.sendFile(path.join(__dirname, "public", "drivers.html"));
})
// Ruta de pagina de informacion de equipos
app.get("/teams-info", (req, res) =>{
    res.sendFile(path.join(__dirname, "public", "teams.html"));
})
// Ruta de pagina de informacion de motoristas
app.get("/motor-makers-info", (req, res) =>{
    res.sendFile(path.join(__dirname, "public", "motor_makers.html"));
})
// Ruta de pagina de pokemon
app.get("/poke-tab",(req,res) =>{
    res.sendFile(path.join(__dirname, "public", "pokemon.html"));
})
// Ruta de pagina de peleas pokemon
app.get("/poke-battle",(req,res) =>{
    res.sendFile(path.join(__dirname, "public", "poke_battle.html"));
})

// Ruta de request de login
app.post("/request/login", (req, res) => {

    const {email, password} = req.body;

    let usuarios_registrados = [];

    const filepath = path.join(__dirname, "public/usuarios.json")

    if (fs.existsSync(filepath)){
        const data = fs.readFileSync(filepath, "utf-8");
        usuarios_registrados = JSON.parse(data);
    }

    for (let i = 0; i < usuarios_registrados.length; i++){
        if (email == usuarios_registrados[i].email && password == usuarios_registrados[i].password){
            return res.json({message: "Success"});
        }
    }

    return res.json({message: "Failed"});

})

// Ruta de request de register
app.post("/request/register", (req, res) => {

    const {nombre, email, password} = req.body;

    let usuarios_registrados = [];

    const filepath = path.join(__dirname, "public/usuarios.json")

    if (fs.existsSync(filepath)){
        const data = fs.readFileSync(filepath, "utf-8");
        usuarios_registrados = JSON.parse(data);
    }

    usuarios_registrados.push({
        nombre: nombre,
        email: email,
        password: password
    })

    fs.writeFileSync(filepath,JSON.stringify(usuarios_registrados, null, 2));

    return res.json({message: "User registered"});

})

// Endpoint que retorna la informacion de el pokemon solicitado dependiendo del id, nombre y tipo
app.post("/get-pokemon", async (req, res)=>{
    let pokedata = {}
    const idfilter = req.body.id;
    const typefilter = req.body.type;
    const namefilter = req.body.name;
    // Si existe un filtro por id
    if (idfilter > 0){
        if (pokemonCache[idfilter]){
            return res.json(pokemonCache[idfilter]);
        }
        else{
            try {
                const response = await fetch( `https://pokeapi.co/api/v2/pokemon/${idfilter}`);
                if (!response.ok){
                    throw new Error("Request failed");
                }

                pokedata = await response.json();
            } catch (error) {
                console.error("Error: ", error.message);
            }
            let types = [pokedata.types[0].type.name];
            if (pokedata.types.length == 2){
                types.push(pokedata.types[1].type.name);
            }
            const stats = {
                hp: pokedata.stats[0].base_stat,
                attack: pokedata.stats[1].base_stat,
                defense: pokedata.stats[2].base_stat,
                spe_attack: pokedata.stats[3].base_stat,
                spe_defense: pokedata.stats[4].base_stat,
                speed: pokedata.stats[5].base_stat
            }
            const moves = [];
            const usedIndexes = new Set();

            while (moves.length < 4 && usedIndexes.size < pokedata.moves.length) {
                const randomIndex = Math.floor(Math.random() * pokedata.moves.length);

                if (!usedIndexes.has(randomIndex)) {
                    usedIndexes.add(randomIndex);

                    const moveName = pokedata.moves[randomIndex].move.name;
                    const move = moveInfoCache[moveName];

                    if (move) { // only push if move exists in cache
                        moves.push(move);
                    }
                }
            }
            const pokemon = {
                id: pokedata.id,
                name: pokedata.name,
                abilities: pokedata.abilities,
                types: types,
                stats: stats,
                image: pokedata.sprites.front_default,
                moves: moves
            }
            pokemonCache[pokedata.id] = pokemon;
            res.json(pokemon);
        }
    }
    // Si existe un filtro por nombre
    else if (namefilter != ""){
        if (pokemonbyNameCache[namefilter]){
            return res.json(pokemonbyNameCache[namefilter]);
        }
        else{
            try {
                const response = await fetch( `https://pokeapi.co/api/v2/pokemon/${namefilter}`);
                if (!response.ok){
                    throw new Error("Request failed");
                }

                pokedata = await response.json();
            } catch (error) {
                console.error("Error: ", error.message);
            }
            let types = [pokedata.types[0].type.name];
            if (pokedata.types.length == 2){
                types.push(pokedata.types[1].type.name);
            }
            const stats = {
                hp: pokedata.stats[0].base_stat,
                attack: pokedata.stats[1].base_stat,
                defense: pokedata.stats[2].base_stat,
                spe_attack: pokedata.stats[3].base_stat,
                spe_defense: pokedata.stats[4].base_stat,
                speed: pokedata.stats[5].base_stat
            }
            const moves = [];
            const usedIndexes = new Set();

            while (moves.length < 4 && usedIndexes.size < pokedata.moves.length) {
                const randomIndex = Math.floor(Math.random() * pokedata.moves.length);

                if (!usedIndexes.has(randomIndex)) {
                    usedIndexes.add(randomIndex);

                    const moveName = pokedata.moves[randomIndex].move.name;
                    const move = moveInfoCache[moveName];

                    if (move) { // only push if move exists in cache
                        moves.push(move);
                    }
                }
            }
            const pokemon = {
                id: pokedata.id,
                name: pokedata.name,
                abilities: pokedata.abilities,
                types: types,
                stats: stats,
                image: pokedata.sprites.front_default,
                moves: moves
            }
            pokemonbyNameCache[pokemon.name] = pokemon;
            res.json(pokemon);
        }
    }
    // Si existe filtro por tipo
    else if (typefilter != "none"){
        if (pokemonCache[req.body.numero]){
            if (req.body.numero < 1026){
                return res.json(pokemonbyTypeCache[typefilter][req.body.numero -1]);
            }
            else {
                return;
            }
        }
        else{
            return;
        }
    }
    // Si no existen filtros
    else{
        if (pokemonCache[req.body.numero]){
            return res.json(pokemonCache[req.body.numero]);
        }
        else{
            try {
                const response = await fetch( `https://pokeapi.co/api/v2/pokemon/${req.body.numero}`);
                if (!response.ok){
                    throw new Error("Request failed");
                }

                pokedata = await response.json();
            } catch (error) {
                console.error("Error: ", error.message);
            }
            let types = [pokedata.types[0].type.name];
            if (pokedata.types.length == 2){
                types.push(pokedata.types[1].type.name);
            }
            const stats = {
                hp: pokedata.stats[0].base_stat,
                attack: pokedata.stats[1].base_stat,
                defense: pokedata.stats[2].base_stat,
                spe_attack: pokedata.stats[3].base_stat,
                spe_defense: pokedata.stats[4].base_stat,
                speed: pokedata.stats[5].base_stat
            }
            const moves = [];
            const usedIndexes = new Set();

            while (moves.length < 4 && usedIndexes.size < pokedata.moves.length) {
                const randomIndex = Math.floor(Math.random() * pokedata.moves.length);

                if (!usedIndexes.has(randomIndex)) {
                    usedIndexes.add(randomIndex);

                    const moveName = pokedata.moves[randomIndex].move.name;
                    const move = moveInfoCache[moveName];

                    if (move) { // only push if move exists in cache
                        moves.push(move);
                    }
                }
            }
            const pokemon = {
                id: pokedata.id,
                name: pokedata.name,
                abilities: pokedata.abilities,
                types: types,
                stats: stats,
                image: pokedata.sprites.front_default,
                moves: moves
            }
            pokemonCache[pokedata.id] = pokemon;
            res.json(pokemon);
        }
    }
})

app.post("/poke-battle", (req,res) =>{
    const turn_log = [];
    const pokemon_1 = {
        nombre: pokemonCache[req.body.pokemon_1].name,
        moves: [
            pokemonCache[req.body.pokemon_1].stats.attack,
            pokemonCache[req.body.pokemon_1].stats.defense,
            pokemonCache[req.body.pokemon_1].stats.spe_attack,
            pokemonCache[req.body.pokemon_1].stats.spe_defense
        ],
        hp: pokemonCache[req.body.pokemon_1].stats.hp * 5,
        spe_att_count: 3,
        spe_def_count: 2
    } 
    const pokemon_2 = {
        nombre: pokemonCache[req.body.pokemon_2].name,
        moves: [
            pokemonCache[req.body.pokemon_2].stats.attack,
            pokemonCache[req.body.pokemon_2].stats.defense,
            pokemonCache[req.body.pokemon_2].stats.spe_attack,
            pokemonCache[req.body.pokemon_2].stats.spe_defense
        ],
        hp: pokemonCache[req.body.pokemon_2].stats.hp * 5,
        spe_att_count: 3,
        spe_def_count: 2
    } 
    for (let i = 0; i < 30; i++){
        let possibleMoves = [0,1];
        if (pokemon_1.spe_att_count <= 0){
            possibleMoves.push(2);
        }
        if (pokemon_1.spe_def_count <= 0){
            possibleMoves.push(3);
        }
        let moveMade1 = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        possibleMoves = [0,1];
        if (pokemon_2.spe_att_count <= 0){
            possibleMoves.push(2);
        }
        if (pokemon_2.spe_def_count <= 0){
            possibleMoves.push(3);
        }
        let moveMade2 = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        let damageDone1 = 0;
        let damageDone2 = 0;
        fail_1 = Math.random() < 0.2;
        fail_2 = Math.random() < 0.2;
        if (moveMade1 == 0 || moveMade1 == 2){
            if (moveMade2 == 1 || moveMade2 == 3){
                if (!fail_2){
                    damageDone1 = pokemon_2.moves[moveMade2] - pokemon_1.moves[moveMade1];
                }
                else{
                    damageDone1 = pokemon_1.moves[moveMade1];
                }
                if (damageDone1 < 0){
                    damageDone1 = 0;
                }
            }
            else{
                damageDone1 = pokemon_1.moves[moveMade1];
                damageDone2 = pokemon_2.moves[moveMade2];
            }
        }
        else{
            if (moveMade2 == 0 || moveMade2 == 2){
                if (!fail_1){
                    damageDone2 = pokemon_1.moves[moveMade1] - pokemon_2.moves[moveMade2];
                }
                else{
                    damageDone2 = pokemon_2.moves[moveMade2];
                }
                if (damageDone2 < 0){
                    damageDone2 = 0;
                }
            }
        }
        if (!fail_1){
            pokemon_2.hp -= damageDone1;
        }
        pokemon_1.spe_att_count --;
        pokemon_1.spe_def_count --;
        let win_1 = false;
        let win_2 = false;
        if (pokemon_2.hp <= 0){
            win_1 = true;
        }
        if (!win_1){
            if (!fail_2){
                pokemon_1.hp -= damageDone2;
            }
            pokemon_2.spe_att_count --;
            pokemon_2.spe_def_count --;
        }
        if (pokemon_1.hp <= 0){
            win_2 = true;
        }
        let current_turn = {
            pokemon_1: {
                nombre: pokemon_1.nombre,
                hp: 20 * pokemon_1.hp/pokemonbyNameCache[pokemon_1.nombre].stats.hp,
                move: moveMade1,
                damage: damageDone1,
                failed: fail_1
            },
            pokemon_2: {
                nombre: pokemon_2.nombre,
                hp: 20 * pokemon_2.hp/pokemonbyNameCache[pokemon_2.nombre].stats.hp,
                move: moveMade2,
                damage: damageDone2,
                failed: fail_2
            }
        }
        if (moveMade1 == 2){
            pokemon_1.spe_att_count = 3;
        }
        if (moveMade1 == 3){
            pokemon_1.spe_def_count = 2;
        }
        if (moveMade2 == 2){
            pokemon_2.spe_att_count = 3;
        }
        if (moveMade2 == 3){
            pokemon_2.spe_def_count = 2;
        }
        turn_log.push(current_turn);
        if (pokemon_1.hp <= 0 || pokemon_2.hp <=0){
            break;
        }
    }
    let battle_resume = {}
    if (pokemon_1.hp != pokemon_2.hp){
        battle_resume = {
            winner: ((pokemon_1.hp > pokemon_2.hp) ? 0 : 1),
            battle_log: turn_log
        }
    }
    else{
        battle_resume = {
            winner: -1,
            battle_log: turn_log
        }
    }
    res.json(battle_resume);
})

// Funcion que precarga la informacion de los pokemon al inicializar el servidor de node para evitar tiempos
// de carga prolongados a la hora de aplicar filtros y los guarda en caches
async function preloadPokemon(){
    for (let i = 1; i < 1025; i++){
        let pokedata = {};
        try {
            const response = await fetch( `https://pokeapi.co/api/v2/pokemon/${i}`);
            if (!response.ok){
                throw new Error("Request failed");
            }

            pokedata = await response.json();
        } catch (error) {
            console.error("Error: ", error.message);
            continue;
        }
        let types = [pokedata.types[0].type.name];
        if (pokedata.types.length == 2){
            types.push(pokedata.types[1].type.name);
        }
        const stats = {
            hp: pokedata.stats[0].base_stat,
            attack: pokedata.stats[1].base_stat,
            defense: pokedata.stats[2].base_stat,
            spe_attack: pokedata.stats[3].base_stat,
            spe_defense: pokedata.stats[4].base_stat,
            speed: pokedata.stats[5].base_stat
        }
        
        const moves = [];
        const usedIndexes = new Set();

        while (moves.length < 4 && usedIndexes.size < pokedata.moves.length) {
            const randomIndex = Math.floor(Math.random() * pokedata.moves.length);

            if (!usedIndexes.has(randomIndex)) {
                usedIndexes.add(randomIndex);

                const moveName = pokedata.moves[randomIndex].move.name;
                const move = moveInfoCache[moveName];

                if (move) { // only push if move exists in cache
                    moves.push(move);
                }
            }
        }
        const pokemon = {
            id: pokedata.id,
            name: pokedata.name,
            abilities: pokedata.abilities,
            types: types,
            stats: stats,
            image: pokedata.sprites.front_default,
            moves: moves
        }
        pokemonCache[pokemon.id] = pokemon;
        pokemonbyNameCache[pokemon.name] = pokemon;
        pokemonbyTypeCache[pokemon.types[0]].push(pokemon);
        if (pokemon.types.length == 2){
            pokemonbyTypeCache[pokemon.types[1]].push(pokemon);
        }
    }
    console.log("Pokemon pre-loaded");
}

// Funcion que precarga la informacion de los movimientos y los guarda en los caches
async function preloadMoves(){
    let movedata = {};
    for (let i = 1; i < 248; i++){
        
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/move/${i}/`);
            if (!response.ok){
                throw new Error("Request failed");
            }
            movedata = await response.json();
        }
        catch (error) {
            console.error("Error: ", error.message);
            continue;
        }
        const moveinfo = {
            name: movedata.name,
            power: movedata.power,
            type: movedata.type.name,
            accuracy: movedata.accuracy
        };
        moveInfoCache[movedata.name] = moveinfo;
    }
    console.log("Moves pre-loaded");
}

// Funcion de inicializacion que ejecuta las funciones de precarga de movimientos para los pokemon y movimientos
// en orden para evitar errores de elementos no cargados.
async function init(){
    await preloadMoves();
    await preloadPokemon();
}

// Llamado de funcion de inicializacion
init();

// Inicializacion del server -----------------------------------------------------------------------

app.listen(port, () =>{

    console.log(`Servidor corriendo en http://localhost:${port}`);

})