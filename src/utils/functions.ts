export function cortarStringEnPrimerEspacio(texto: string | undefined) {
    const indiceEspacio = texto?.indexOf(' '); // Encuentra el índice del primer espacio
    if (indiceEspacio !== -1) { // Si se encuentra un espacio
      return texto?.substring(0, indiceEspacio); // Devuelve la parte del string antes del primer espacio
    } else {
      return texto; // Si no se encuentra ningún espacio, devuelve el string original
    }
}