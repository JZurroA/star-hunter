/**
 * login.service.js
 * Script para gestionar del login
 * Autor: Jabier Zurro Aduriz
 * Fecha: 27/10/2025
 * Asignatura: DWEC
 */


// Fucnion para validad la contraseña con RegEx
function validPassword(contrasenia) {
    const PASS_RE = /^[A-Za-z0-9]{6,}$/; // alfanumérico, mínimo 6
    return PASS_RE.test((contrasenia || '').trim())
}

// Funcion para obtener los usuarios registrados en LocalStorage
function obtenerUsuarios() {
    const usuarios = []
    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i)
        if (!/^\d+$/.test(clave)) continue // solo ids numéricas
        const raw = localStorage.getItem(clave)
        try {
        const u = JSON.parse(raw)
        if (u && typeof u.usuario === 'string' && typeof u.contrasenia === 'string') {
            usuarios.push(u)
        }
        } catch { /* ignora entradas no JSON */ }
    }
    return usuarios;
}

// Funcion para comprobar que las credenciales introducidas son las correctas
function comprobarCredenciales(usuario, contrasenia) {
    const users = obtenerUsuarios()
    const uIn = (usuario || '').trim()
    const pIn = (contrasenia || '').trim()

    const found = users.find(
        u =>
        u.usuario.trim().toLowerCase() === uIn.toLowerCase() &&
        u.contrasenia.trim() === pIn
    )

    return Boolean(found);
}

// Export público de los metodos del servicio
export const LoginService = {
    validPassword,
    comprobarCredenciales,
    obtenerUsuarios
};
