import { Level } from "../models/level.model.js"

/* Fichero para parsear el objeto de niveles */
const jsonLevel = 
`[
    {
        "id": 1, "nombre": "Fácil",
        "width": 500, "height": 400,
        "estrellas": { "normales": 20, "especiales": 2, "explosivas": 1 },
        "doble": { "habilitado": true, "multiplicador": 2 },
        "objetivo": { "estrellasMinimas": 11, "puntuacionMinima": 90 }
    },
    {
        "id": 2, "nombre": "Intermedio",
        "width": 650, "height": 475,
        "estrellas": { "normales": 30, "especiales": 3, "explosivas": 5 },
        "doble": { "habilitado": true, "multiplicador": 2 },
        "objetivo": { "estrellasMinimas": 17, "puntuacionMinima": 160 }
    },
    {
        "id": 3, "nombre": "Difícil",
        "width": 800, "height": 550,
        "estrellas": { "normales": 50, "especiales": 5, "explosivas": 15 },
        "doble": { "habilitado": true, "multiplicador": 2 },
        "objetivo": { "estrellasMinimas": 29, "puntuacionMinima": 280 }
    }
]
`

export const LEVELS_DB = JSON.parse(jsonLevel).map(
    levelParseado => new Level(
        levelParseado.id,
        levelParseado.nombre,
        levelParseado.width,
        levelParseado.height,
        levelParseado.estrellas,
        levelParseado.doble,
        levelParseado.objetivo
    )
)