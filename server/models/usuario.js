const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

//creamos un objeto con los roles que son permitidos en caso de no coincidir
//el message dira cual fue el rol que inserto y dira que no es valido
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
}

let Schema = mongoose.Schema;


let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es requerido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        //enum es para decirle cuales son los roles que son permitidos 
        //o enviar el mensaje de error
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }

});

//de esta manera podemos eliminar la contraseña de la respuesta para que nadie vea donde esta
//ni que nombre tiene el atributo (cuestion de seguridad)
// usuarioSchema.methods.toJSON = function(){
//     let user = this;
//     let userObjetct = user.toObject();
//     delete userObjetct.password;

//     return userObjetct;
// }

//usamos el schema creado del usuario y con el paquete unique-validator de mongoose
//le mandamos un mensaje mas claro al usuario para que sepa cual es el error
//en este caso el email debe ser unico
usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} debe de ser unico'
})

module.exports = mongoose.model('Usuario', usuarioSchema);