export type EquipoIdx = 0 | 1; //indice de equipos (solo 2 equipos)
export type JugadorIdx = 0 | 1; //indice de jugadores (solo 2 por equipo)
export type Lado = 'DERECHA' | 'IZQUIERDA';
export type Pareja<T> = [T, T];  //Array de 2 cosas

export interface PartidoState{
    equipos: Pareja<string>;  //Nombres de las parejas
    jugadores: Pareja<Pareja<string>>; //Nombre de los 4 jugadores
    puntos: Pareja<number>;   //Puntos del juego actual
    juegos: Pareja<number>;   //Juegos del set actual
    sets: Pareja<number>;     //Sets
    marcadorSets:  Pareja<number>[]; //Marcador de los resultados de los sets
    equipoSaque: EquipoIdx; //Que pareja saca
    siguienteSaque: Pareja<JugadorIdx>;   //Que jugador saca su proximo juego
    cambioCampo: boolean;   //Si se ha cambiado de campo
}