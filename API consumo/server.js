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

// Endpoint que retorna la informacion acerca del pokemon ditto
app.post("/get-pokemon", async (req, res)=>{
    let pokedata = {}
    const idfilter = req.body.id;
    const typefilter = req.body.type;
    const namefilter = req.body.name;
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
            const pokemon = {
                id: pokedata.id,
                name: pokedata.name,
                abilities: pokedata.abilities,
                types: types,
                stats: stats,
                image: pokedata.sprites.front_default,
                moves: pokedata.moves
            }
            pokemonCache[pokedata.id] = pokemon;
            res.json(pokemon);
        }
    }
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
            const pokemon = {
                id: pokedata.id,
                name: pokedata.name,
                abilities: pokedata.abilities,
                types: types,
                stats: stats,
                image: pokedata.sprites.front_default,
                moves: pokedata.moves
            }
            pokemonbyNameCache[pokemon.name] = pokemon;
            res.json(pokemon);
        }
    }
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
            const pokemon = {
                id: pokedata.id,
                name: pokedata.name,
                abilities: pokedata.abilities,
                types: types,
                stats: stats,
                image: pokedata.sprites.front_default,
                moves: pokedata.moves
            }
            pokemonCache[pokedata.id] = pokemon;
            res.json(pokemon);
        }
    }
})

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
            type: movedata.type.name
        };
        moveInfoCache[movedata.name] = moveinfo;
    }
    console.log("Moves pre-loaded");
}

async function init(){
    await preloadMoves();
    await preloadPokemon();
}

init();

// Inicializacion del server -----------------------------------------------------------------------

app.listen(port, () =>{

    console.log(`Servidor corriendo en http://localhost:${port}`);

})