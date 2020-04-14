const jwt = require('jsonwebtoken');


//============================================
// verificar token
//============================================

let verificaToken = (req, res, next) => {

    //mediante la peticion (req).get puedo obtener los headers de dicha peticion y asi obtener lo que contiene
    //entre parentesis viene el nombre del campo en los headers
    let token = req.get('token');

    //con esta funcion verificamos que el token, la semilla y los datos o paylods que llaman son correctos
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'token no valido'
                }
            });
        };

        //si no existe ningun error quiere decir que el token y la semilla fueron correctas y la funcion devuelve 
        //el payload o la informacion del usuario que este caso es el decoded
        //con esta funcion puedo hacer que cualquier peticion tenga la informacion del usuario una vez supere el error
        req.usuario = decoded.usuario;
        //si no disparamos next en este middleware no va continuar con la funcion que tenemos pendiente
        next();
    })
};

//============================================
// verificar token img por url
//============================================
let verificaTokenImg = ((req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'token no valido'
                }
            });
        };

        //si no existe ningun error quiere decir que el token y la semilla fueron correctas y la funcion devuelve 
        //el payload o la informacion del usuario que este caso es el decoded
        //con esta funcion puedo hacer que cualquier peticion tenga la informacion del usuario una vez supere el error
        req.usuario = decoded.usuario;
        //si no disparamos next en este middleware no va continuar con la funcion que tenemos pendiente
        next();
    })
})




//============================================
// verificar adminRole
//============================================
let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role !== 'ADMIN_ROLE') {
        return res.json({
            ok: false,
            err: {
                message: 'solo los administradors pueden actualizar o crear registros'
            }
        });
    }

    next();

}


module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}