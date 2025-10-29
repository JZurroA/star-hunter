/**
 * main.js
 * Orquestador y punto unico de entrada de toda la aplicacion.
 * Autor: Jabier Zurro Aduriz
 * Fecha: 27/10/2025
 * Asignatura: DWEC
 */

// Imports necesarios para el orquestador
import { UserService } from './services/user.service.js'
import { LoginService } from './services/login.service.js'
import { LevelsService } from './services/levels.service.js'
import { GameService } from './services/game.service.js'
import { StatsService } from './services/stats.service.js'


/*  LOGIN
    Gestiona el formulario de login
*/
if (document.body.dataset.shPage === 'login') {
    
    // siembra usuarios en localStorage
    UserService.almacenarUsuarios()

    const form            = document.getElementById('login-form')
    const userInput       = document.getElementById('username')
    const passInput       = document.getElementById('password')
    const msgPass         = document.getElementById('mensajePassword')
    const msgError        = document.getElementById('mensajeError')
    const msgContrasenia  = document.getElementById('mensajeContrasenia')

    form.addEventListener('submit', (e) => {
        e.preventDefault()

        // Oculta mensajes previos
        ;[msgPass, msgError, msgContrasenia].forEach(el => {
            if (!el) return
            el.classList.add('hidden')
            el.classList.remove('visible')
        })

        const usuario     = (userInput.value || '').trim()
        const contrasenia = (passInput.value || '').trim()

        // Validacion de formato (RegEx)
        if (!LoginService.validPassword(contrasenia)) {
            msgPass.classList.remove('hidden')
            msgPass.classList.add('visible')
            passInput.value = ''
            passInput.focus()
            return
        }

        // Comprobación de credenciales
        const esValido = LoginService.comprobarCredenciales(usuario, contrasenia)

        if (esValido) {
            window.location.href = './html/welcome.html'
            return
        }

        // Diferenciar: ¿existe el usuario pero la contraseña es incorrecta?
        const users = LoginService.obtenerUsuarios()
        const userExiste = users.some(u => u.usuario.trim().toLowerCase() === usuario.toLowerCase())

        if (userExiste) {
            // Contraseña incorrecta
            msgContrasenia.classList.remove('hidden')
            msgContrasenia.classList.add('visible')
            passInput.value = ''
            passInput.focus()
            return
        }

        // Usuario no registrado
        msgError.classList.remove('hidden')
        msgError.classList.add('visible')
    })
}

/*  MENU
    Orquesta el menu de seleccion de niveles
*/
if (document.body.dataset.shPage === 'welcome') {
    // Cargar niveles en sessionStorage (una vez)
    LevelsService.almacenarNiveles()

    // Mapeo de slug -> nombre
    const slugToNombre = (slug) => {
        const mapa = { facil: 'Fácil', intermedio: 'Intermedio', dificil: 'Difícil' };
        return mapa[slug] || slug
    }

  // Listeners de selección
    document.querySelectorAll('.level').forEach(btn => {
        btn.addEventListener('click', () => {
            const slug   = btn.dataset.level       // "facil" | "intermedio" | "dificil"
            const nombre = slugToNombre(slug);       // "Fácil" | "Intermedio" | "Difícil"
            const nivel  = LevelsService.getLevelByName(nombre)
            if (!nivel) return

            // Guarda selección para game
            sessionStorage.setItem('nivelSeleccionado', slug);
            sessionStorage.setItem('configNivel', JSON.stringify(nivel))

            // Redirige al juego
            window.location.href = './game.html'
        })
    })
}

/*  GAME
    Orquesta la pagina del juego
*/
if (document.body.dataset.shPage === 'game') {
    // Recuperar configuración del nivel seleccionado
    const raw = sessionStorage.getItem('configNivel')
    const cfg = JSON.parse(raw)
    const slug = (sessionStorage.getItem('nivelSeleccionado') || '').toLowerCase()

    // Iniciar el servicio del juego (configura las reglas, botones, etc.)
    GameService.init(cfg, slug)
}

/*  RESULTS 
    Orquesta la pagina de resultados
*/
if (document.body.dataset.shPage === 'results') {
    const stat = StatsService.load()

    // Si alguien llega a results sin haber jugado, redirige a bienvenida
    if (!stat) {
        window.location.href = './welcome.html'
    }

    // Referencias DOM (IDs tal y como están en results.html)
    const statusEl   = document.getElementById('result-status')
    const scoreEl    = document.getElementById('result-score')
    const timeEl     = document.getElementById('result-time')
    const levelEl    = document.getElementById('result-level')
    const explEl     = document.getElementById('result-explosives')
    const btnRestart = document.getElementById('btn-restart')
    const btnExit    = document.getElementById('btn-exit')

    // Estado: victoria/derrota
    if (statusEl) {
        statusEl.textContent = stat.ganado ? '¡Victoria!' : 'Derrota'
        statusEl.style.color = stat.ganado ? '#2e7d32' : '#d32f2f'
    }

    // Métricas
    if (scoreEl) scoreEl.textContent = stat.puntos
    if (explEl)  explEl.textContent  = stat.explosivas

    if (timeEl) {
        const empleado = Math.max(0, (stat.tiempoTotal || 30) - (stat.tiempoRestante || 0))
        timeEl.textContent = String(empleado)
    }

    if (levelEl) {
        levelEl.textContent = stat.nivelNombre || stat.nivelSlug || '-'
    }

    // Acciones
    if (btnRestart) btnRestart.addEventListener('click', () => {
        StatsService.clear()
        window.location.href = './welcome.html'
    })
    if (btnExit) btnExit.addEventListener('click', () => {
        StatsService.clear()
        window.location.href = '../index.html'
    })

}
