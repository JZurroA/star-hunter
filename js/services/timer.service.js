/**
 * timer.service.js
 * Script para controlar el temporizador del juego
 * Autor: Jabier Zurro Aduriz
 * Fecha: 27/10/2025
 * Asignatura: DWEC
 */

let intervalId = null
let remaining = 0

// Funcion que empieza el temporizador 
function start(duration, onTick, onFinish) {
    stop()
    remaining = parseInt(duration, 10) || 0

    // primer tick inmediato para pintar el valor inicial
    if (typeof onTick === 'function') onTick(remaining)

    intervalId = setInterval(() => {
        remaining--
        if (typeof onTick === 'function') onTick(remaining)

        if (remaining <= 0) {
        stop()
        if (typeof onFinish === 'function') onFinish()
        }
    }, 1000)
}

// Funcion que pausa el juego
function pause() {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
    }
}

// Funcion que vuelve a ejecutar el temporizador desde el ultimo punto donde se paro
function resume(onTick, onFinish) {
    if (!intervalId && remaining > 0) {
        intervalId = setInterval(() => {
        remaining--
        if (typeof onTick === 'function') onTick(remaining)

        if (remaining <= 0) {
            stop()
            if (typeof onFinish === 'function') onFinish()
        }
        }, 1000)
    }
}

// Funcion para parar completamente y resetear el temporizador
function stop() {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
    }
}

// Funcion para comprobar si el temporizador esta en marcha
function isRunning() {
    return intervalId !== null
}

// Funcion para saber cuanto tiempo le queda al temporizador
function getRemaining() {
    return remaining
}

// Export público de los metodos del servicio
export const TimerService = {
    start,
    pause,
    resume,
    stop,
    isRunning,
    getRemaining
}