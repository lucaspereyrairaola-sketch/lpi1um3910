import { useArgentinaData } from "@/hooks/useArgentinaData";
import { TrendingUp, DollarSign, Loader2 } from "lucide-react";

function fmt(n: number | null, prefix = "$"): string {
  if (n === null) return "—";
  return `${prefix}${n.toLocaleString("es-AR")}`;
}

function fmtPct(n: number | null): string {
  if (n === null) return "—";
  return `${n.toFixed(1)}%`;
}

export function EconTicker() {
  const { data, isLoading } = useArgentinaData();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2">
        <Loader2 className="w-3 h-3 animate-spin" />
        Cargando datos económicos...
      </div>
    );
  }

  if (!data) return null;

  const items = [
    { label: "USD Oficial", value: fmt(data.dolarOficial), icon: "💵" },
    { label: "USD Blue",    value: fmt(data.dolarBlue),    icon: "💰" },
    { label: "USD MEP",     value: fmt(data.dolarMep),     icon: "📊" },
    { label: "IPC mensual", value: fmtPct(data.inflacionMensual), icon: "📈" },
    { label: "IPC anual",   value: fmtPct(data.inflacionAnual),   icon: "🔥" },
  ];

  return (
    <div className="w-full overflow-hidden border-b border-border/40 bg-secondary/10">
      <div className="flex items-center gap-1 px-3 py-1.5 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 text-[10px] text-primary font-semibold uppercase tracking-wider shrink-0 mr-3">
          <TrendingUp className="w-3 h-3" />
          ARG
        </div>
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-md bg-secondary/40 border border-border/30"
          >
            <span className="text-[11px]">{item.icon}</span>
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
            <span className="text-[11px] font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
        {data.fechaActualizacion && (
          <span className="text-[9px] text-muted-foreground/50 shrink-0 ml-2">
            act. {data.fechaActualizacion}
          </span>
        )}
      </div>
    </div>
  );
}
