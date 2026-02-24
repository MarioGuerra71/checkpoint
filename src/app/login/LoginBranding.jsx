
export default function LoginBranding() {
  return (
    <div className="flex flex-col items-center mb-8">
      {/* Título de la aplicación */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
        CHECKPOINT
      </h1>

      {/* Descripción de la aplicación */}
      <p className="text-base text-foreground opacity-80 text-center max-w-xs mt-1">
        Gestiona, valora y comparte tu experiencia con videojuegos. ¡Tu espacio gamer social!
      </p>
    </div>
  );
}