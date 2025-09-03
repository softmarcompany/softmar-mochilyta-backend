export interface PuntoTuristico {
  lugar: string;
  zona_geografica: {
    coords: [number, number];
    type: string;
    place_rank: number;
    importance: number;
    addresstype: string;
    name: string;
    display_name: string;
    boundingbox: [string, string, string, string];
  };
  horario: {
    apertura: string;
    cierre: string;
  };
  precio: {
    adultos: number;
    ninos: number;
    discapacitados: number;
  };
  imagen: {
    img: string;
    descripcion: string;
  }[];
  duracion: number;
  duracionAjustada: number;
  distancia: number;
}
