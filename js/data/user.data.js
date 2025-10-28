import { User } from "../models/user.model.js"

/* Fichero para parsear el objeto de user */
const jsonUser = `
[   
   {
      "id":1,
      "nombre" : "Iker",
      "apellido" : "Arana",
      "usuario":"iarana",
      "contrasenia":"1234Abcd"
   },
   {
      "id":2,
      "nombre" : "Ander",
      "apellido" : "Goikoetxea",
      "usuario":"agoikoetxea",
      "contrasenia":"5678Efgh"
   },

   {
      "id":3,
      "nombre" : "Jokin",
      "apellido" : "Olano",
      "usuario":"jolano",
      "contrasenia":"9012Ijkl"
   }
]`

export const USUARIOS_DB = JSON.parse(jsonUser).map(
   userParseado => new User(
      userParseado.id,
      userParseado.nombre,
      userParseado.apellido,
      userParseado.usuario,
      userParseado.contrasenia
   )
)