/**
 * user.service.js
 * Script para almacenar usuarios en el LocalStorage
 * Autor: Jabier Zurro Aduriz
 * Fecha: 27/10/2025
 * Asignatura: DWEC
 */

// Importamos los usuarios del json
import { USUARIOS_DB } from "../data/user.data.js"

// Funcion para almacenar los usuarios en LocalStorage
function almacenarUsuarios() {
    for(let i = 0; i < USUARIOS_DB.length; i++) {
        const usuario = USUARIOS_DB[i]
        if (!localStorage.getItem(usuario.id)) {
            localStorage.setItem(usuario.id.toString(), JSON.stringify(usuario))
        }
    }
}

// Export público del metodo del servicio
export const UserService = {
    almacenarUsuarios
}