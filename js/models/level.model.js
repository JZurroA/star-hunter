/**
 * level.model.js
 * Clase para crear el objeto Level
 * Autor: Jabier Zurro Aduriz
 * Fecha: 27/10/2025
 * Asignatura: DWEC
 */
export class Level {
    constructor(id, nombre, width, height, estrellas, doble, objetivo) {
        this.id = id
        this.nombre = nombre
        this.width = width
        this.height = height
        this.estrellas = estrellas
        this.doble = doble
        this.objetivo = objetivo
    }
}