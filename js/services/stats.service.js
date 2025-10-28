/**
 * stats.service.js
 * Script para gestionar la puntuacion del juego
 * Autor: Jabier Zurro Aduriz
 * Fecha: 27/10/2025
 * Asignatura: DWEC
 */

import { Stat } from "../models/stat.model.js"

/**
 * Guarda los resultados de la última partida en sessionStorage.
 * Sobrescribe si ya existe una clave 'resultados'.
 */
function save(stat) {
    if (!(stat instanceof Stat)) {
        console.warn('Intento de guardar un objeto que no es instancia de Stat')
        return
    }

    try {
        sessionStorage.setItem('resultados', JSON.stringify(stat))
    } catch (e) {
        console.error('Error guardando resultados:', e)
    }
}

/**
 * Carga los resultados de la última partida desde sessionStorage.
 * Devuelve una instancia de Stat o null si no existe.
 */
function load() {
    const data = sessionStorage.getItem('resultados')
    if (!data) return null

    const obj = JSON.parse(data)
    return new Stat(
    obj.ganado,
    obj.puntos,
    obj.explosivas,
    obj.nivelSlug,
    obj.nivelNombre,
    obj.tiempoTotal,
    obj.tiempoRestante,
    obj.objetivo
    )
}

/**
 * Elimina las claves de resultados del sessionStorage.
 */
function clear() {
    sessionStorage.removeItem('resultados')

}

// Export público de los metodos del servicio
export const StatsService = {
    save,
    load,
    clear
}
