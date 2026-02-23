import Image from "next/image";

export default function LoginBranding() {
  return (
    <div className="flex flex-col items-center mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-md">CHECKPOINT</h1>
      <p className="text-base text-foreground opacity-80 mt-1 text-center max-w-xs">
        Gestiona, valora y comparte tu experiencia con videojuegos. ¡Tu espacio gamer social!
      </p>
    </div>
  );
}
