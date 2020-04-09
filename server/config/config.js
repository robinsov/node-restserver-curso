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
    urlDB = 'mongodb+srv://robinso:Slty8EYOP3HqKknc@cluster0-auf9o.mongodb.net/cafe';
}


process.env.URLDB = urlDB;