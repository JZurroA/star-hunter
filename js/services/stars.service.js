/**
 * stars.service.js
 * Script para orquestar los eventos y la aparicion de estrellas
 * Autor: Jabier Zurro Aduriz
 * Fecha: 27/10/2025
 * Asignatura: DWEC
 */

// Importamos TimerService para aparicion equilibrada de estrellas en el tiempo limite
import { TimerService } from './timer.service.js'

let board = null
let cfg = null
let slug = ''                  
let handlers = {}              // { onNormalClick, onSpecialDblclick, onExplosiveClick }

let pendientes = { normales: 0, especiales: 0, explosivas: 0 }
let activas    = { normales: 0, especiales: 0, explosivas: 0, total: 0 }

let enabled = false
let spawnTimeoutId = null

// Parámetros del spawner (puedes afinar por nivel si quieres)
const BURST_DIST = [0,1,1,1,2,2]            // menos 3 a la vez
const DELAY_RANGE_MS = { min: 260, max: 900 } // ráfagas un poco más espaciadas
const MAX_BURST_PER_WAVE = 2  // retraso aleatorio entre ráfagas
const STAR_SIZE = 32
const LIFETIME_MS = { min: 2400, max: 3800 }  // cuánto viven si no las clicas
const FADE_OUT_MS = 500 

function init(boardIn, cfgIn, handlersIn, slugIn='') {
    board = boardIn
    cfg = cfgIn
    handlers = handlersIn || {}
    slug = slugIn || ''

    if (!board || !cfg || !cfg.estrellas) return

    // inicializa contadores
    pendientes = {
        normales:   parseInt(cfg.estrellas.normales  || 0, 10),
        especiales: parseInt(cfg.estrellas.especiales|| 0, 10),
        explosivas: parseInt(cfg.estrellas.explosivas|| 0, 10)
    }
    activas = { normales:0, especiales:0, explosivas:0, total:0 }

    clear()

}

// Pone en marcha el spawner de estrellas
function enable() {
    if (enabled) return
    enabled = true
    programNextBurst()
}

// Para el spawner de estrellas
function disable() {
    enabled = false
    if (spawnTimeoutId) {
        clearTimeout(spawnTimeoutId)
        spawnTimeoutId = null
    }
}

// Llama internamente disable para parar la ceracion de estrellas
function teardown() {
    disable()
    clear()
}

// Funcion para limpiar el tablero de juego
function clear() {
    if (!board) return
    // elimina solo las estrellas
    const nodes = board.querySelectorAll('.star')
    nodes.forEach(n => n.remove())
    activas = { normales:0, especiales:0, explosivas:0, total:0 }
}

// Spawner principal (ráfagas aleatorias)
function programNextBurst() {
    if (!enabled) return

    const GAME_DURATION_S = 30
    const remainingS = typeof TimerService.getRemaining === 'function'
        ? TimerService.getRemaining()
        : GAME_DURATION_S

    const restantes = pendientes.normales + pendientes.especiales + pendientes.explosivas
    const remainingMs = Math.max(0, remainingS * 1000)
    const targetGap = Math.floor(remainingMs / Math.max(1, restantes))

    const GAP_MIN = 140, GAP_MAX = 900
    const centered = Math.max(GAP_MIN, Math.min(GAP_MAX, targetGap))
    const delay = randInt(Math.max(GAP_MIN, centered - 120), Math.min(GAP_MAX, centered + 120))

    spawnTimeoutId = setTimeout(() => {
        spawnTimeoutId = null
        if (!enabled) return

        const maxSimul = computeMaxSimultaneous()
        const libres = Math.max(0, maxSimul - activas.total)
        const restantesAhora = pendientes.normales + pendientes.especiales + pendientes.explosivas

        if (libres <= 0 || restantesAhora <= 0) {
        return programNextBurst()
        }

        let burst = pickBurstSize()
        burst = Math.min(burst, MAX_BURST_PER_WAVE, libres, restantesAhora)

        for (let i = 0; i < burst; i++) {
        const tipo = pickTypeRespectingBudget()
        if (!tipo) break
        createStar(tipo)
        }

        programNextBurst()
    }, delay)
}


// Helpers de spawn
function computeMaxSimultaneous() {
    const totalPres =
        (cfg.estrellas.normales || 0) +
        (cfg.estrellas.especiales || 0) +
        (cfg.estrellas.explosivas || 0)

    const twoThirds = Math.ceil(totalPres * (2 / 3))
    // Asegura un mínimo de 6 para que no haya tableros vacíos
    return Math.max(6, twoThirds)
}


function pickBurstSize() {
    // Selección simple usando BURST_DIST como “bolsa”
    const idx = randInt(0, BURST_DIST.length - 1)
    return BURST_DIST[idx]
}

function pickTypeRespectingBudget() {
    // Pesos base. Es decir, modifica la probabilidad de aparicion de las estrellas segun su "peso" (relevancia)
    const weights = {
        normales:   70,
        especiales: 20,
        explosivas: 10
    }

    // elimina tipos agotados
    const entries = Object.entries(pendientes)
        .filter(([k, v]) => v > 0 && (k === 'normales' || k === 'especiales' || k === 'explosivas'))

    if (entries.length === 0) return null

    // normaliza pesos según disponibilidad
    const pool = []
    for (const [k] of entries) {
        const w = weights[k] || 0
        for (let i = 0; i < w; i++) pool.push(k)
    }
    if (pool.length === 0) {
        // si por pesos cae a 0, elige cualquiera disponible
        return entries[ randInt(0, entries.length - 1) ][0]
    }
    return pool[ randInt(0, pool.length - 1) ]
}

// Renderizado de la estrella en el tablero. Aparece en un punto aleatorio con respecto al tablero de juego
function createStar(tipo) {
    if (!board) return
    if (pendientes[tipo] <= 0) return
    pendientes[tipo]--

    const el = document.createElement('div')
    el.className = 'star ' + typeToClass(tipo)
    el.style.position = 'absolute'
    el.style.width = STAR_SIZE + 'px'
    el.style.height = STAR_SIZE + 'px'
    el.style.pointerEvents = 'auto'

    // posicionamiento aleatorio
    const bw = board.clientWidth
    const bh = board.clientHeight
    const x = randInt(0, Math.max(0, bw - STAR_SIZE))
    const y = randInt(0, Math.max(0, bh - STAR_SIZE))
    el.style.left = x + 'px'
    el.style.top  = y + 'px'

    // transición de opacidad para el fade-out
    el.style.opacity = '1'
    el.style.transition = `opacity ${FADE_OUT_MS}ms linear`

    // hover visual
    el.addEventListener('mouseover', () => el.classList.add('is-hover'))
    el.addEventListener('mouseout',  () => el.classList.remove('is-hover'))

    // eventos por tipo
    if (tipo === 'especiales') {
        el.addEventListener('dblclick', () => {
        // cancela el autodespawn si existía
        if (el._despawnId) { clearTimeout(el._despawnId); el._despawnId = null }
        safeCall(handlers.onSpecialDblclick, { el, tipo: 'especial' })
        removeStar(el, 'especiales')
        })
    } else if (tipo === 'explosivas') {
        el.addEventListener('pointerdown', () => {
        if (el._despawnId) { clearTimeout(el._despawnId); el._despawnId = null }
        safeCall(handlers.onExplosiveClick, { el, tipo: 'explosiva' })
        removeStar(el, 'explosivas')
        })
    } else {
        // normales
        el.addEventListener('pointerdown', () => {
        if (el._despawnId) { clearTimeout(el._despawnId); el._despawnId = null }
        safeCall(handlers.onNormalClick, { el, tipo: 'normal' })
        removeStar(el, 'normales')
        })
    }

    board.appendChild(el)
    activas[tipo]++
    activas.total++

    // AUTO-DESVANECER Y ELIMINAR SI NO SE INTERACTÚA
    const life = randInt(LIFETIME_MS.min, LIFETIME_MS.max)
    el._despawnId = setTimeout(() => {
        el._despawnId = null
        // inicia fade
        el.style.opacity = '0'
        // tras el fade, elimina del DOM y actualiza contadores
        setTimeout(() => {
        // si ya fue eliminada por clic, no hagas nada
        if (!el.parentNode) return
        removeStar(el, tipo)
        }, FADE_OUT_MS)
    }, life)
}

// Elimina las estrellas del tablero
function removeStar(el, tipoKey) {
    if (el && el.parentNode) el.parentNode.removeChild(el)
    activas[tipoKey] = Math.max(0, (activas[tipoKey] || 0) - 1)
    activas.total = Math.max(0, activas.total - 1)
}

// Utilidades
function typeToClass(tipoKey) {
    if (tipoKey === 'especiales') return 'star--special'
    if (tipoKey === 'explosivas') return 'star--explosive'
    return 'star--normal'
}

// Funcion que asegura que el juego no se rompa si no se detecta el clic en una estrella.
function safeCall(fn, payload) {
    try { if (typeof fn === 'function') fn(payload) } catch { }
}

function randInt(min, max) {
  // ambos inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Export público de las funciones del servicio
export const StarsService = {
    init,
    enable,
    disable,
    teardown,
    clear
}