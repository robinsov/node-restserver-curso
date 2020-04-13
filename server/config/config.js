//==============================
// puerto
//==============================

process.env.PORT = process.env.PORT || 3000;


//==============================
// entorno
//==============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//==============================
// BASE DA DATOS
//==============================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

//==============================
// VENCIMIENTO DEL TOKEN
//==============================
// 60 SEGUNDOS
// 60 MINUTOS
// 24 HORAS
// 30 DIAS

process.env.CADUCIDAD_TOKEN = 2592000;

//==============================
// SEED O SEMILLA DE AUTENTICACION
//==============================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';


process.env.URLDB = urlDB;


//==============================
// GOOGLE CLIENT ID
//==============================

process.env.CLIENT_ID = process.env.CLIENT_ID || '687301028939-srvbgad8tfd7iu5q8ukdhq1fic52pbp8.apps.googleusercontent.com';