export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-foreground/10 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-2 border-t-foreground border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
      <p className="text-xs text-foreground/40 uppercase tracking-widest animate-pulse">Cargando...</p>
    </div>
  );
}