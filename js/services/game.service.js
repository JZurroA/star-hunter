/**
 * game.service.js
 * Script para orquestar los eventos y la renderizacion del juego
 * Autor: Jabier Zurro Aduriz
 * Fecha: 27/10/2025
 * Asignatura: DWEC
 */

/* Imports necesarios para que el servicio funcione correctamente */
import { TimerService } from './timer.service.js'
import { StarsService } from './stars.service.js'
import { StatsService } from './stats.service.js'
import { Stat } from '../models/stat.model.js'

// Estado de módulo
let timeLeft = 30
let score = 0
let explosives = 0
let doubleMode = false
let multiplier = 1

let cfg = null
let slug = ''
let board = null

// Inicialización principal
function init(cfgIn, slugIn) {
    cfg = cfgIn
    slug = slugIn
    board = document.getElementById('board')

    if (!board) return

    reset()
    renderBoard()
    registerEvents()
    updateRules()

    // El juego no empieza automáticamente. Empieza tras escuchar el clic en el boton
    const startBtn = document.getElementById('btn-start')
    if (startBtn) {
        startBtn.addEventListener('click', startGame)
    }
}

// Actualiza el texto de las reglas según el nivel seleccionado
function updateRules() {
    const rulesList = document.querySelector('.rules ul')
    if (!rulesList) return

    const objetivo = cfg.objetivo || {}
    const minEstrellas = objetivo.estrellasMinimas ?? 0
    const mult = cfg.doble?.multiplicador ?? 2

    const reglas = [
        `Debes recolectar como mínimo <strong>${minEstrellas}</strong> estrellas.`,
        'Tienes <strong>30 segundos</strong> para conseguirlo.',
        'Cada estrella normal suma <strong>10 puntos</strong>.',
        'A veces aparece una estrella especial que otorga <strong>15 puntos</strong>. Para puntuar, debes hacer doble clic sobre ella.',
        'Evita las explosivas: cada una resta <strong>15 puntos</strong> y te aleja del objetivo.',
        cfg.doble?.habilitado
            ? `Además, si pulsas la tecla <strong>D</strong>, se activará el modo doble que te otorgará el doble de puntos (<strong>x${mult}</strong>). Pero, ¡cuidado!, también te quitará el doble de puntos.`
            : null,
        '<strong>¡Suerte!</strong>'
    ].filter(Boolean)


    const items = rulesList.querySelectorAll('li')
    reglas.forEach((texto, i) => {
        if (items[i]) {
            items[i].style.display = ''
            items[i].innerHTML = texto
        }
    })

    for (let i = reglas.length; i < items.length; i++) {
        items[i].style.display = 'none'
    }
}


// Funcion para actualizar la puntuacion del juego
function updateScoreUI() {
    const scoreEl = document.getElementById('stat-score')
    if (scoreEl) scoreEl.textContent = score
}

// Funcion para actualizar el contador de estrellas explosivas 
function updateExplosivesUI() {
    const expEl = document.getElementById('stat-explosives')
    if (expEl) expEl.textContent = explosives
}


// Reinicia variables del juego y restablece indicadores
function reset() {
    timeLeft = 30
    score = 0
    explosives = 0
    doubleMode = false
    multiplier = 1

    const timeEl = document.getElementById('stat-time')
    const scoreEl = document.getElementById('stat-score')
    const expEl = document.getElementById('stat-explosives')

    if (timeEl) {
        timeEl.textContent = timeLeft
        timeEl.style.color = '#111'
    }
    if (scoreEl) scoreEl.textContent = score
    if (expEl) expEl.textContent = explosives

    const warning = document.getElementById('mode-warning')
    if (warning) warning.classList.add('hidden')
}

// Aplica el tamaño del tablero y limpia su contenido
function renderBoard() {
    if (!board || !cfg) return

    // Aplica clase visual según slug
    board.classList.remove('facil', 'intermedio', 'dificil')
    if (slug) board.classList.add(slug)

    board.style.width  = cfg.width + 'px'
    board.style.height = cfg.height + 'px'
    board.innerHTML = ''
}

// Registra los eventos globales
function registerEvents() {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('visibilitychange', handleVisibilityChange)
}

// Empieza la partida
function startGame() {
    reset()
    startTimer()
    spawnStars()
}

// Controla la pulsación de teclas
function handleKeyDown(e) {
    if (e.key.toLowerCase() === 'd') {
        toggleDoubleMode()
    }
}

// Pausa o reanuda el juego al cambiar de pestaña
function handleVisibilityChange() {
    if (document.hidden) {
        pauseGame()
    } else {
        resumeGame()
    }
}

// Inicia el temporizador usando TimerService
function startTimer() {
    TimerService.start(30, onTickTimer, onFinishTimer)
}

// Callback de actualización del temporizador
function onTickTimer(restante) {
    timeLeft = restante
    const timeDisplay = document.getElementById('stat-time')
    if (!timeDisplay) return

    timeDisplay.textContent = timeLeft
    if (timeLeft <= 10) {
        timeDisplay.style.color = (timeLeft <= 5) ? '#d32f2f' : '#ff9800'
    }
}

// Callback cuando el tiempo se acaba
function onFinishTimer() {
    endGame()
}

// Genera las estrellas
function spawnStars() {
    if (!board || !cfg) return

    StarsService.init(
        board,
        cfg,
        {
        onNormalClick: () => {
            score += 10 * multiplier
            updateScoreUI()
        },
        onSpecialDblclick: () => {
            score += 15 * multiplier
            updateScoreUI()
        },
        onExplosiveClick: () => {
            score = Math.max(0, score - 15 * multiplier) // evita negativos
            explosives++
            updateScoreUI()
            updateExplosivesUI()
        }
        },
        slug
    )

    StarsService.enable()
}


// Activa o desactiva el modo doble
function toggleDoubleMode() {
    if (!cfg || !cfg.doble || !cfg.doble.habilitado) return

    doubleMode = !doubleMode
    multiplier = doubleMode ? cfg.doble.multiplicador : 1

    const warning = document.getElementById('mode-warning')
    if (warning) warning.classList.toggle('hidden', !doubleMode)
}

// Pausa el juego
function pauseGame() {
    TimerService.pause()
}

// Reanuda el juego
function resumeGame() {
    if (!TimerService.isRunning() && TimerService.getRemaining() > 0) {
        TimerService.resume(onTickTimer, onFinishTimer)
    }
}

// Finaliza la partida y redirige a resultados
function endGame() {
    TimerService.stop()

    const tiempoTotal = 30
    const tiempoRestante = (typeof TimerService.getRemaining === 'function')
        ? TimerService.getRemaining()
        : 0

    const minScore = (cfg?.objetivo?.puntuacionMinima ?? 100)
    const ganado = (score >= minScore)

    const stat = new Stat(
        ganado,
        score,
        explosives,
        slug,
        cfg?.nombre || '',
        tiempoTotal,
        tiempoRestante,
        cfg?.objetivo || null
    )

    StatsService.save(stat)
    window.location.href = './results.html'
}

// Export público de los metodos del servicio
export const GameService = {
    init,
    updateRules,
    reset,
    renderBoard,
    registerEvents,
    startGame,
    handleKeyDown,
    handleVisibilityChange,
    startTimer,
    spawnStars,
    toggleDoubleMode,
    pauseGame,
    resumeGame,
    endGame
}