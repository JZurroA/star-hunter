/**
 * levels.service.js
 * Script para gestionar los niveles
 * Autor: Jabier Zurro Aduriz
 * Fecha: 27/10/2025
 * Asignatura: DWEC
 */

// Importamos los presets de los niveles desde el json
import { LEVELS_DB } from "../data/levels.data.js"

// Funcion para almacenar los niveles en SessionStorage
function almacenarNiveles() {
    for (const level of LEVELS_DB) {
        const key = 'Level:' + level.id;
        if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, JSON.stringify(level));
        }
    }
}

// Funcion para obtener el nivel por nombre ("Level: fácil, Level: intermedio, Level: difícil")
function getLevelByName(nombre) {
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (!key.startsWith('Level:')) continue;
        const obj = JSON.parse(sessionStorage.getItem(key));
        if (obj?.nombre?.toLowerCase() === nombre.toLowerCase()) return obj;
    }
    return null;
}

// Export público de los metodos del servicio
export const LevelsService = {
    almacenarNiveles,
    getLevelByName
}