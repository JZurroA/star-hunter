/**
 * stat.model.js
 * Clase para crear el objeto Stat
 * Autor: Jabier Zurro Aduriz
 * Fecha: 27/10/2025
 * Asignatura: DWEC
 */

export class Stat {
    constructor(ganado, puntos, explosivas, nivelSlug, nivelNombre, tiempoTotal, tiempoRestante, objetivo) {
        this.ganado = ganado
        this.puntos = parseInt(puntos)
        this.explosivas = parseInt(explosivas)
        this.nivelSlug = nivelSlug
        this.nivelNombre = nivelNombre
        this.tiempoTotal = parseInt(tiempoTotal)
        this.tiempoRestante = parseInt(tiempoRestante)
        this.tiempoEmpleado = this.tiempoTotal - this.tiempoRestante
        this.objetivo = objetivo
    }
}