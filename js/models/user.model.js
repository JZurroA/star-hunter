/**
 * user.model.js
 * Clase para crear el objeto User
 * Autor: Jabier Zurro Aduriz
 * Fecha: 27/10/2025
 * Asignatura: DWEC
 */

export class User {
    constructor(id, nombre, apellido, usuario, contrasenia) {
        this.id = parseInt(id)
        this.nombre = nombre
        this.apellido = apellido
        this.usuario = usuario
        this.contrasenia = contrasenia
    }
}