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

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//==============================
// SEED O SEMILLA DE AUTENTICACION
//==============================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';


process.env.URLDB = urlDB;