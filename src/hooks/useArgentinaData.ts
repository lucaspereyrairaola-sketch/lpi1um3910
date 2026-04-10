import { useQuery } from "@tanstack/react-query";

const BASE = "https://api.argentinadatos.com/v1";

interface DolarCotizacion {
  casa: string;
  compra: number;
  venta: number;
  fecha: string;
}

interface InflacionEntry {
  fecha: string;
  valor: number;
}

export interface ArgentinaEconData {
  dolarOficial: number | null;
  dolarBlue: number | null;
  dolarMep: number | null;
  inflacionMensual: number | null;
  inflacionAnual: number | null;
  fechaActualizacion: string | null;
}

async function fetchEconData(): Promise<ArgentinaEconData> {
  const [dolaresRes, inflRes, inflAnualRes] = await Promise.allSettled([
    fetch(`${BASE}/cotizaciones/dolares`).then((r) => r.json() as Promise<DolarCotizacion[]>),
    fetch(`${BASE}/finanzas/indices/inflacion`).then((r) => r.json() as Promise<InflacionEntry[]>),
    fetch(`${BASE}/finanzas/indices/inflacionInteranual`).then((r) => r.json() as Promise<InflacionEntry[]>),
  ]);

  let dolarOficial: number | null = null;
  let dolarBlue: number | null = null;
  let dolarMep: number | null = null;
  let fechaActualizacion: string | null = null;

  if (dolaresRes.status === "fulfilled") {
    const sorted = [...dolaresRes.value].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    const latest: Record<string, DolarCotizacion> = {};
    for (const d of sorted) {
      if (!latest[d.casa]) latest[d.casa] = d;
    }
    dolarOficial = latest["oficial"]?.venta ?? null;
    dolarBlue = latest["blue"]?.venta ?? null;
    dolarMep = latest["mep"]?.venta ?? null;
    fechaActualizacion = sorted[0]?.fecha ?? null;
  }

  let inflacionMensual: number | null = null;
  if (inflRes.status === "fulfilled" && inflRes.value.length > 0) {
    inflacionMensual = inflRes.value[inflRes.value.length - 1].valor;
  }

  let inflacionAnual: number | null = null;
  if (inflAnualRes.status === "fulfilled" && inflAnualRes.value.length > 0) {
    inflacionAnual = inflAnualRes.value[inflAnualRes.value.length - 1].valor;
  }

  return { dolarOficial, dolarBlue, dolarMep, inflacionMensual, inflacionAnual, fechaActualizacion };
}

export function useArgentinaData() {
  return useQuery({
    queryKey: ["argentina-econ"],
    queryFn: fetchEconData,
    staleTime: 1000 * 60 * 30, // 30 min cache
    retry: 1,
  });
}
