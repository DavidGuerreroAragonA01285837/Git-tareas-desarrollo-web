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

// Habilitar el uso de CORS
app.use(cors());
// Traduce el body de los requests directamente a un objeto json
app.use(express.json());
// Cuando un usuario entre al servidor busca los archivos de la carpeta public
app.use(express.static("public"));

// Creacion de variables globales para uso publico

// Variable con el color de cada tipo de pokemon
const typeColors = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD"
};

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
    try {
        const response = await fetch( `https://pokeapi.co/api/v2/pokemon/${req.body.numero}`);
        if (!response.ok){
            throw new Error("Request failed");
        }

        pokedata = await response.json();
    } catch (error) {
        console.error("Error: ", error.message);
    }
    let types = '<div class="type_pill" style="--color:' + typeColors[pokedata.types[0].type.name] +'">' + String(pokedata.types[0].type.name).toUpperCase() + '</div> ';
    if (pokedata.types[1].type.name != undefined){
        types += '<div class="type_pill" style="--color:' + typeColors[pokedata.types[1].type.name] +'">' + String(pokedata.types[1].type.name).toUpperCase() + '</div>';
    }
    res.send(`
        
        <div class="poke_card">
            <div class="team_title" style="color:white" ">${pokedata.name.toUpperCase()}</div>
            <img src="${pokedata.sprites.front_default}" class="team_image">
            <div class="horizontal"> ${types}</div>
        </div>

    `)
})

// Inicializacion del server -----------------------------------------------------------------------

app.listen(port, () =>{

    console.log(`Servidor corriendo en http://localhost:${port}`);

})