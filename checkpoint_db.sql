-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-04-2026 a las 13:07:38
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `checkpoint_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `avatar_item`
--

CREATE TABLE `avatar_item` (
  `id_item` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('avatar','borde') NOT NULL,
  `rareza` enum('comun','raro','epico','legendario') NOT NULL,
  `imagen_url` varchar(255) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio_monedas` int(10) UNSIGNED DEFAULT NULL,
  `color_hex` varchar(7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `avatar_item`
--

INSERT INTO `avatar_item` (`id_item`, `nombre`, `tipo`, `rareza`, `imagen_url`, `descripcion`, `precio_monedas`, `color_hex`) VALUES
(1, 'Mando Retro', 'avatar', 'comun', '/avatars/mando-retro.png', 'Un mando clásico de los 90', NULL, NULL),
(2, 'Pixel Sword', 'avatar', 'comun', '/avatars/pixel-sword.png', 'Una espada pixelada', NULL, NULL),
(3, 'Poción Azul', 'avatar', 'comun', '/avatars/pocion-azul.png', 'Recupera vida', NULL, NULL),
(4, 'Dado de 20', 'avatar', 'comun', '/avatars/dado-20.png', 'Para los amantes del RPG', NULL, NULL),
(5, 'Moneda de Oro', 'avatar', 'comun', '/avatars/moneda-oro.png', 'La moneda clásica', 50, NULL),
(6, 'Katana Neon', 'avatar', 'raro', '/avatars/katana-neon.png', 'Brilla en la oscuridad', NULL, NULL),
(7, 'Escudo Mágico', 'avatar', 'raro', '/avatars/escudo-magico.png', 'Protección máxima', NULL, NULL),
(8, 'Arco Élfico', 'avatar', 'raro', '/avatars/arco-elfico.png', 'Precisión élfica', NULL, NULL),
(9, 'Bomba Pixelada', 'avatar', 'raro', '/avatars/bomba-pixel.png', 'Boom!', 150, NULL),
(10, 'Dragón Chibi', 'avatar', 'epico', '/avatars/dragon-chibi.png', 'Pequeño pero poderoso', NULL, NULL),
(11, 'Astronauta', 'avatar', 'epico', '/avatars/astronauta.png', 'Explorador del espacio', NULL, NULL),
(12, 'Mago Oscuro', 'avatar', 'epico', '/avatars/mago-oscuro.png', 'Poder de las sombras', 300, NULL),
(13, 'Fénix Dorado', 'avatar', 'legendario', '/avatars/fenix-dorado.png', 'Renace de sus cenizas', NULL, NULL),
(14, 'Rey del Pixel', 'avatar', 'legendario', '/avatars/rey-pixel.png', 'El máximo honor', NULL, NULL),
(15, 'Borde Gris', 'borde', 'comun', '/bordes/borde-gris.png', 'Simple y elegante', NULL, '#9ca3af'),
(16, 'Borde Blanco', 'borde', 'comun', '/bordes/borde-blanco.png', 'Limpio y minimalista', NULL, '#ffffff'),
(17, 'Borde Verde', 'borde', 'comun', '/bordes/borde-verde.png', 'Color de la naturaleza', 50, '#4ade80'),
(18, 'Borde Azul', 'borde', 'raro', '/bordes/borde-azul.png', 'Brillo eléctrico', NULL, '#60a5fa'),
(19, 'Borde Rojo', 'borde', 'raro', '/bordes/borde-rojo.png', 'Fuego y pasión', NULL, '#f87171'),
(20, 'Borde Neón', 'borde', 'raro', '/bordes/borde-neon.png', 'Brilla en la oscuridad', 150, '#00E3F6'),
(21, 'Borde Morado', 'borde', 'epico', '/bordes/borde-morado.png', 'Poder épico', NULL, '#c084fc'),
(22, 'Borde Cristal', 'borde', 'epico', '/bordes/borde-cristal.png', 'Transparente y brillante', 300, '#67e8f9'),
(23, 'Borde Dorado', 'borde', 'legendario', '/bordes/borde-dorado.png', 'Solo para los mejores', NULL, '#fbbf24'),
(24, 'Borde Arcoíris', 'borde', 'legendario', '/bordes/borde-arcoiris.png', 'Todos los colores del arcoíris', NULL, '#f472b6');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentario_resena`
--

CREATE TABLE `comentario_resena` (
  `id_comentario` int(10) UNSIGNED NOT NULL,
  `id_resena` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `contenido` text NOT NULL,
  `fecha_comentario` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `comentario_resena`
--

INSERT INTO `comentario_resena` (`id_comentario`, `id_resena`, `id_usuario`, `contenido`, `fecha_comentario`) VALUES
(2, 9, 1, 'Abuso', '2026-04-21 12:51:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `favorito`
--

CREATE TABLE `favorito` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `rawg_game_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `favorito`
--

INSERT INTO `favorito` (`id_usuario`, `rawg_game_id`) VALUES
(1, 28),
(1, 3498),
(1, 41494),
(1, 977316);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lista`
--

CREATE TABLE `lista` (
  `id_lista` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `nombre_lista` varchar(100) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `lista`
--

INSERT INTO `lista` (`id_lista`, `id_usuario`, `nombre_lista`, `fecha_creacion`) VALUES
(1, 1, 'Mis favoritos de todos los tiempos', '2026-03-24 12:51:19'),
(2, 1, 'Pendientes de jugar', '2026-03-24 12:51:19'),
(4, 1, 'Mejores Juegos de Puzles', '2026-04-08 14:33:06'),
(5, 1, 'Nose', '2026-04-21 13:06:30'),
(6, 5, 'POR JUGAR', '2026-04-27 12:43:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lista_videojuego`
--

CREATE TABLE `lista_videojuego` (
  `id_lista` int(10) UNSIGNED NOT NULL,
  `rawg_game_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `lista_videojuego`
--

INSERT INTO `lista_videojuego` (`id_lista`, `rawg_game_id`) VALUES
(1, 41494),
(1, 58175),
(2, 28),
(2, 3498),
(4, 25097),
(4, 258322),
(4, 276032),
(4, 616693),
(4, 977316),
(4, 1004516);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logro`
--

CREATE TABLE `logro` (
  `id_logro` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `icono` varchar(10) NOT NULL,
  `tipo` enum('resenas','sesiones','horas','amigos','favoritos','sobres') NOT NULL,
  `objetivo` int(10) UNSIGNED NOT NULL,
  `recompensa_monedas` int(10) UNSIGNED DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `logro`
--

INSERT INTO `logro` (`id_logro`, `nombre`, `descripcion`, `icono`, `tipo`, `objetivo`, `recompensa_monedas`) VALUES
(1, 'Primera reseña', 'Escribe tu primera reseña', '💎', 'resenas', 1, 50),
(2, 'Crítico en ciernes', 'Escribe 5 reseñas', '✍️', 'resenas', 5, 100),
(3, 'Crítico experto', 'Escribe 25 reseñas', '🏆', 'resenas', 25, 250),
(4, 'Maratón de reseñas', 'Escribe 50 reseñas', '🌟', 'resenas', 50, 500),
(5, 'Primera sesión', 'Registra tu primera sesión de juego', '🎮', 'sesiones', 1, 50),
(6, 'Jugador constante', 'Registra 10 sesiones', '📅', 'sesiones', 10, 100),
(7, 'Adicto al joystick', 'Registra 50 sesiones', '🕹️', 'sesiones', 50, 250),
(8, 'Centenar de sesiones', 'Registra 100 sesiones', '💯', 'sesiones', 100, 500),
(9, '10 horas jugadas', 'Acumula 10 horas de juego', '⏱️', 'horas', 10, 50),
(10, '50 horas jugadas', 'Acumula 50 horas de juego', '🕐', 'horas', 50, 150),
(11, '100 horas jugadas', 'Acumula 100 horas de juego', '⌚', 'horas', 100, 300),
(12, 'Primer amigo', 'Sigue a tu primer usuario', '👥', 'amigos', 1, 50),
(13, 'Red social', 'Sigue a 5 usuarios', '🌐', 'amigos', 5, 100),
(14, 'Primer favorito', 'Añade tu primer juego a favoritos', '⭐', 'favoritos', 1, 50),
(15, 'Coleccionista', 'Añade 10 juegos a favoritos', '🎖️', 'favoritos', 10, 150),
(16, 'Primer sobre', 'Abre tu primer sobre', '📦', 'sobres', 1, 25),
(17, 'Adicto a los sobres', 'Abre 10 sobres', '🎁', 'sobres', 10, 200);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preferencias_usuario`
--

CREATE TABLE `preferencias_usuario` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `tema` enum('oscuro','claro') NOT NULL DEFAULT 'oscuro'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `preferencias_usuario`
--

INSERT INTO `preferencias_usuario` (`id_usuario`, `tema`) VALUES
(1, 'oscuro'),
(3, 'claro'),
(4, 'oscuro'),
(5, 'oscuro');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resena`
--

CREATE TABLE `resena` (
  `id_resena` int(10) UNSIGNED NOT NULL,
  `rawg_game_id` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `puntuacion` tinyint(3) UNSIGNED DEFAULT NULL CHECK (`puntuacion` between 1 and 5),
  `comentario` text DEFAULT NULL,
  `fecha_resena` datetime NOT NULL DEFAULT current_timestamp(),
  `plataforma` varchar(30) DEFAULT NULL,
  `modo` varchar(20) DEFAULT 'solitario',
  `id_companero` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `resena`
--

INSERT INTO `resena` (`id_resena`, `rawg_game_id`, `id_usuario`, `puntuacion`, `comentario`, `fecha_resena`, `plataforma`, `modo`, `id_companero`) VALUES
(1, 41494, 1, 5, 'Una obra maestra, el mejor soulslike hasta la fecha.', '2025-03-16 00:00:00', NULL, 'solitario', NULL),
(2, 3498, 1, 4, 'Muy buen juego, la historia engancha muchísimo.', '2025-03-23 00:00:00', NULL, 'solitario', NULL),
(6, 25097, 1, 5, NULL, '2026-04-09 14:26:21', NULL, 'solitario', NULL),
(7, 977316, 1, 4, 'Menudo vicio!', '2026-04-14 13:49:17', NULL, 'solitario', NULL),
(8, 616693, 1, 4, NULL, '2026-04-18 11:50:18', NULL, 'solitario', NULL),
(9, 1004516, 1, 3, NULL, '2026-04-18 11:53:56', NULL, 'solitario', NULL),
(11, 276032, 1, 2, NULL, '2026-04-21 10:59:43', 'Móvil', 'solitario', NULL),
(12, 484389, 1, 1, NULL, '2026-04-21 11:01:45', 'Xbox', 'solitario', NULL),
(17, 324997, 1, 5, 'Goty', '2026-04-21 12:28:06', 'PC', 'solitario', NULL),
(19, 258322, 1, 5, 'Impresionante', '2026-04-21 12:46:36', 'PC', 'solitario', NULL),
(20, 292844, 1, 5, 'Locura', '2026-04-22 14:25:20', NULL, 'solitario', NULL),
(21, 421698, 5, 5, '¡Mi juego favorito!', '2026-04-26 18:03:25', 'Switch', 'solitario', NULL),
(22, 455597, 5, 4, 'Juegazo para jugar con tu pareja', '2026-04-26 18:35:00', 'PC', 'cooperativo', 3),
(23, 455597, 3, 5, 'Angela te odio', '2026-04-26 18:43:26', 'PC', 'cooperativo', 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimiento`
--

CREATE TABLE `seguimiento` (
  `id_seguidor` int(10) UNSIGNED NOT NULL,
  `id_seguido` int(10) UNSIGNED NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp()
) ;

--
-- Volcado de datos para la tabla `seguimiento`
--

INSERT INTO `seguimiento` (`id_seguidor`, `id_seguido`, `fecha`) VALUES
(3, 4, '2026-04-26 18:53:06'),
(3, 5, '2026-04-26 18:37:32'),
(4, 3, '2026-04-26 18:55:34'),
(4, 5, '2026-04-26 18:56:18'),
(5, 3, '2026-04-26 18:33:49'),
(5, 4, '2026-04-26 19:01:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesion_juego`
--

CREATE TABLE `sesion_juego` (
  `id_sesion` int(10) UNSIGNED NOT NULL,
  `rawg_game_id` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `duracion_minutos` smallint(5) UNSIGNED NOT NULL,
  `fecha_sesion` date NOT NULL,
  `comentario` text DEFAULT NULL,
  `plataforma` varchar(30) DEFAULT NULL,
  `modo` varchar(20) DEFAULT 'solitario',
  `id_companero` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sesion_juego`
--

INSERT INTO `sesion_juego` (`id_sesion`, `rawg_game_id`, `id_usuario`, `duracion_minutos`, `fecha_sesion`, `comentario`, `plataforma`, `modo`, `id_companero`) VALUES
(1, 41494, 1, 120, '2025-03-20', 'Partida online con amigos', NULL, 'solitario', NULL),
(2, 41494, 1, 90, '2025-03-18', NULL, NULL, 'solitario', NULL),
(3, 58175, 1, 180, '2025-03-15', 'Primera vez que llego al final', NULL, 'solitario', NULL),
(4, 58175, 1, 200, '2025-03-10', NULL, NULL, 'solitario', NULL),
(5, 3498, 1, 60, '2025-03-22', 'Misión principal completada', NULL, 'solitario', NULL),
(6, 28, 1, 45, '2025-03-21', NULL, NULL, 'solitario', NULL),
(7, 25097, 1, 35, '2026-04-07', 'Me he pasado una mision secundaria', NULL, 'solitario', NULL),
(9, 25097, 1, 20, '2026-04-09', 'Muuy bien', NULL, 'solitario', NULL),
(10, 616693, 1, 45, '2026-04-18', 'Muy buen pixelart', NULL, 'solitario', NULL),
(13, 1004516, 1, 60, '2026-04-18', 'Frenetismo', NULL, 'solitario', NULL),
(14, 258322, 1, 30, '2026-04-21', 'Primera mision completada', 'PC', 'solitario', NULL),
(15, 258322, 1, 10, '2026-04-21', 'Segunda Mision', 'PC', 'solitario', NULL),
(16, 258322, 1, 30, '2026-04-21', 'Tercera Mision', 'PC', 'solitario', NULL),
(17, 1004516, 3, 20, '2026-04-21', 'Tiene buena pinta, lo seguiré jugando en mi tiempo libre', 'PC', 'solitario', NULL),
(18, 1004516, 3, 75, '2026-04-24', 'Primera Misión Completada. Lo de las cartas de beisbol esta curioso. Me encanta la ambientación y el gameplay', 'PC', 'solitario', NULL),
(19, 1004516, 3, 180, '2026-04-25', 'Segimos con las misiones y desbloqueando nuevas armas. Locura la ppsh de temu', 'PC', 'solitario', NULL),
(20, 421698, 5, 90, '2026-04-23', 'He mejorado mi casa por fin', 'Switch', 'solitario', NULL),
(21, 421698, 5, 125, '2026-04-25', 'He estado pescando y cazando tarantulas', 'Switch', 'solitario', NULL),
(22, 455597, 5, 200, '2026-04-18', '¡Me desesperas mario!', 'PC', 'cooperativo', 3),
(23, 23598, 3, 60, '2026-04-26', 'Jugamos dos rankeds para subir a esmeralda', 'PC', 'cooperativo', 4),
(24, 23598, 4, 60, '2026-04-26', 'Jugamos dos rankeds para subir a esmeralda', 'PC', 'cooperativo', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  `id_avatar` int(10) UNSIGNED DEFAULT NULL,
  `id_borde` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre_usuario`, `email`, `contrasena_hash`, `avatar`, `fecha_registro`, `id_avatar`, `id_borde`) VALUES
(1, 'admin', 'admin@checkpoint.com', '$2b$10$7brUTUzv2luQTg0z6PTcnefr7AG.RTSQS8MMb4Dv7BoHlCA7kDKs.', NULL, '2026-03-18 14:33:36', 11, 22),
(3, 'mariomariete17', 'mariomariete71@gmail.com', '$2b$10$OKX3.BtdxFOpG3rzZ8yGuOHvWEkyywqAM5/ii4GU3v3G5eiEoEW1O', NULL, '2026-04-21 22:15:10', 12, 21),
(4, 'ferbaq', 'ferbaq@gmail.com', '$2b$10$HBaqDaS1cgmCxLbYQZaSlOXF5uPNzP.xCzJtzrttC7J3bGZf81cQ.', NULL, '2026-04-26 17:50:05', 8, 21),
(5, 'angelapj02', 'angela@gmail.com', '$2b$10$6zrk48xl7zhHhaHkx6UwPesgMTkpNf6oiAIkUFKwGDAwIQuj7xegO', NULL, '2026-04-26 17:51:40', 5, 24);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_inventario`
--

CREATE TABLE `usuario_inventario` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `id_item` int(10) UNSIGNED NOT NULL,
  `fecha_obtencion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario_inventario`
--

INSERT INTO `usuario_inventario` (`id`, `id_usuario`, `id_item`, `fecha_obtencion`) VALUES
(1, 1, 19, '2026-04-15 00:06:38'),
(2, 1, 9, '2026-04-15 00:06:38'),
(3, 1, 15, '2026-04-15 00:06:38'),
(4, 1, 2, '2026-04-15 00:06:48'),
(5, 1, 22, '2026-04-15 00:06:48'),
(6, 1, 7, '2026-04-15 00:06:53'),
(7, 1, 16, '2026-04-15 00:06:53'),
(8, 1, 1, '2026-04-15 00:06:53'),
(9, 1, 17, '2026-04-15 00:06:57'),
(10, 1, 6, '2026-04-15 00:06:57'),
(11, 1, 11, '2026-04-15 00:07:02'),
(12, 1, 3, '2026-04-17 13:50:01'),
(16, 1, 12, '2026-04-22 13:35:33'),
(17, 1, 20, '2026-04-22 14:05:37'),
(26, 1, 5, '2026-04-22 14:20:19'),
(29, 1, 21, '2026-04-23 11:06:12'),
(30, 3, 8, '2026-04-23 11:48:03'),
(31, 3, 10, '2026-04-23 11:48:03'),
(32, 3, 2, '2026-04-23 11:48:03'),
(33, 3, 4, '2026-04-23 11:48:09'),
(34, 3, 20, '2026-04-23 11:48:09'),
(35, 3, 16, '2026-04-23 11:48:09'),
(36, 3, 11, '2026-04-23 11:48:15'),
(37, 3, 7, '2026-04-23 11:48:20'),
(38, 3, 19, '2026-04-23 11:48:20'),
(39, 3, 18, '2026-04-23 11:48:20'),
(40, 3, 24, '2026-04-24 16:03:34'),
(41, 3, 21, '2026-04-24 16:03:34'),
(42, 3, 12, '2026-04-24 16:03:34'),
(43, 3, 3, '2026-04-24 16:03:40'),
(44, 3, 17, '2026-04-24 16:39:43'),
(45, 4, 17, '2026-04-26 18:56:35'),
(46, 4, 22, '2026-04-26 18:56:35'),
(47, 4, 15, '2026-04-26 18:56:35'),
(48, 4, 21, '2026-04-26 18:56:40'),
(49, 4, 8, '2026-04-26 18:56:40'),
(50, 4, 12, '2026-04-26 18:56:40'),
(51, 5, 24, '2026-04-26 19:00:35'),
(52, 5, 10, '2026-04-26 19:00:35'),
(53, 5, 5, '2026-04-26 19:00:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_logro`
--

CREATE TABLE `usuario_logro` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `id_logro` int(10) UNSIGNED NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario_logro`
--

INSERT INTO `usuario_logro` (`id_usuario`, `id_logro`, `fecha`) VALUES
(1, 1, '2026-04-21 22:13:55'),
(1, 2, '2026-04-21 22:13:55'),
(1, 5, '2026-04-21 22:13:55'),
(1, 6, '2026-04-21 22:13:55'),
(1, 9, '2026-04-21 22:13:55'),
(1, 12, '2026-04-21 22:13:55'),
(1, 14, '2026-04-21 22:13:55'),
(1, 16, '2026-04-21 22:13:55'),
(3, 1, '2026-04-26 18:43:51'),
(3, 5, '2026-04-23 15:46:52'),
(3, 12, '2026-04-23 11:47:43'),
(4, 5, '2026-04-26 18:56:35'),
(4, 12, '2026-04-26 18:55:43'),
(5, 1, '2026-04-26 18:34:00'),
(5, 5, '2026-04-26 18:34:00'),
(5, 12, '2026-04-26 18:34:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_monedas`
--

CREATE TABLE `usuario_monedas` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `monedas` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario_monedas`
--

INSERT INTO `usuario_monedas` (`id_usuario`, `monedas`) VALUES
(1, 30),
(3, 605),
(4, 200),
(5, 250);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_sobre`
--

CREATE TABLE `usuario_sobre` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `ultimo_sobre` datetime DEFAULT NULL,
  `sobres_pendientes` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario_sobre`
--

INSERT INTO `usuario_sobre` (`id_usuario`, `ultimo_sobre`, `sobres_pendientes`) VALUES
(1, '2026-04-22 13:06:21', 0),
(3, '2026-04-27 12:33:14', 0),
(4, '2026-04-26 18:56:40', 4),
(5, '2026-04-26 19:00:35', 5);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_estadisticas_usuario`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_estadisticas_usuario` (
`id_usuario` int(10) unsigned
,`nombre_usuario` varchar(50)
,`minutos_totales` decimal(27,0)
,`total_sesiones` bigint(21)
,`total_resenas` bigint(21)
,`total_favoritos` bigint(21)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_listas_usuario`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_listas_usuario` (
`id_lista` int(10) unsigned
,`nombre_lista` varchar(100)
,`fecha_creacion` datetime
,`id_usuario` int(10) unsigned
,`nombre_usuario` varchar(50)
,`total_juegos` bigint(21)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_resenas_publicas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_resenas_publicas` (
`id_resena` int(10) unsigned
,`rawg_game_id` int(10) unsigned
,`puntuacion` tinyint(3) unsigned
,`comentario` text
,`fecha_resena` datetime
,`id_usuario` int(10) unsigned
,`nombre_usuario` varchar(50)
,`avatar` varchar(255)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_estadisticas_usuario`
--
DROP TABLE IF EXISTS `v_estadisticas_usuario`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_estadisticas_usuario`  AS SELECT `u`.`id_usuario` AS `id_usuario`, `u`.`nombre_usuario` AS `nombre_usuario`, coalesce(sum(`s`.`duracion_minutos`),0) AS `minutos_totales`, count(distinct `s`.`id_sesion`) AS `total_sesiones`, count(distinct `r`.`id_resena`) AS `total_resenas`, count(distinct `f`.`rawg_game_id`) AS `total_favoritos` FROM (((`usuario` `u` left join `sesion_juego` `s` on(`s`.`id_usuario` = `u`.`id_usuario`)) left join `resena` `r` on(`r`.`id_usuario` = `u`.`id_usuario`)) left join `favorito` `f` on(`f`.`id_usuario` = `u`.`id_usuario`)) GROUP BY `u`.`id_usuario`, `u`.`nombre_usuario` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_listas_usuario`
--
DROP TABLE IF EXISTS `v_listas_usuario`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_listas_usuario`  AS SELECT `l`.`id_lista` AS `id_lista`, `l`.`nombre_lista` AS `nombre_lista`, `l`.`fecha_creacion` AS `fecha_creacion`, `u`.`id_usuario` AS `id_usuario`, `u`.`nombre_usuario` AS `nombre_usuario`, count(`lv`.`rawg_game_id`) AS `total_juegos` FROM ((`lista` `l` join `usuario` `u` on(`u`.`id_usuario` = `l`.`id_usuario`)) left join `lista_videojuego` `lv` on(`lv`.`id_lista` = `l`.`id_lista`)) GROUP BY `l`.`id_lista`, `l`.`nombre_lista`, `l`.`fecha_creacion`, `u`.`id_usuario`, `u`.`nombre_usuario` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_resenas_publicas`
--
DROP TABLE IF EXISTS `v_resenas_publicas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_resenas_publicas`  AS SELECT `r`.`id_resena` AS `id_resena`, `r`.`rawg_game_id` AS `rawg_game_id`, `r`.`puntuacion` AS `puntuacion`, `r`.`comentario` AS `comentario`, `r`.`fecha_resena` AS `fecha_resena`, `u`.`id_usuario` AS `id_usuario`, `u`.`nombre_usuario` AS `nombre_usuario`, `u`.`avatar` AS `avatar` FROM (`resena` `r` join `usuario` `u` on(`u`.`id_usuario` = `r`.`id_usuario`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `avatar_item`
--
ALTER TABLE `avatar_item`
  ADD PRIMARY KEY (`id_item`);

--
-- Indices de la tabla `comentario_resena`
--
ALTER TABLE `comentario_resena`
  ADD PRIMARY KEY (`id_comentario`),
  ADD KEY `fk_com_resena` (`id_resena`),
  ADD KEY `fk_com_usuario` (`id_usuario`);

--
-- Indices de la tabla `favorito`
--
ALTER TABLE `favorito`
  ADD PRIMARY KEY (`id_usuario`,`rawg_game_id`);

--
-- Indices de la tabla `lista`
--
ALTER TABLE `lista`
  ADD PRIMARY KEY (`id_lista`),
  ADD KEY `fk_lista_usuario` (`id_usuario`);

--
-- Indices de la tabla `lista_videojuego`
--
ALTER TABLE `lista_videojuego`
  ADD PRIMARY KEY (`id_lista`,`rawg_game_id`);

--
-- Indices de la tabla `logro`
--
ALTER TABLE `logro`
  ADD PRIMARY KEY (`id_logro`);

--
-- Indices de la tabla `preferencias_usuario`
--
ALTER TABLE `preferencias_usuario`
  ADD PRIMARY KEY (`id_usuario`);

--
-- Indices de la tabla `resena`
--
ALTER TABLE `resena`
  ADD PRIMARY KEY (`id_resena`),
  ADD UNIQUE KEY `uq_resena_usuario_juego` (`id_usuario`,`rawg_game_id`),
  ADD KEY `fk_resena_companero` (`id_companero`);

--
-- Indices de la tabla `seguimiento`
--
ALTER TABLE `seguimiento`
  ADD PRIMARY KEY (`id_seguidor`,`id_seguido`),
  ADD KEY `fk_seg_seguido` (`id_seguido`);

--
-- Indices de la tabla `sesion_juego`
--
ALTER TABLE `sesion_juego`
  ADD PRIMARY KEY (`id_sesion`),
  ADD KEY `fk_sesion_usuario` (`id_usuario`),
  ADD KEY `fk_sesion_companero` (`id_companero`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_usr_avatar` (`id_avatar`),
  ADD KEY `fk_usr_borde` (`id_borde`);

--
-- Indices de la tabla `usuario_inventario`
--
ALTER TABLE `usuario_inventario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unico_item` (`id_usuario`,`id_item`),
  ADD KEY `fk_inv_item` (`id_item`);

--
-- Indices de la tabla `usuario_logro`
--
ALTER TABLE `usuario_logro`
  ADD PRIMARY KEY (`id_usuario`,`id_logro`),
  ADD KEY `fk_ul_logro` (`id_logro`);

--
-- Indices de la tabla `usuario_monedas`
--
ALTER TABLE `usuario_monedas`
  ADD PRIMARY KEY (`id_usuario`);

--
-- Indices de la tabla `usuario_sobre`
--
ALTER TABLE `usuario_sobre`
  ADD PRIMARY KEY (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `avatar_item`
--
ALTER TABLE `avatar_item`
  MODIFY `id_item` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `comentario_resena`
--
ALTER TABLE `comentario_resena`
  MODIFY `id_comentario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `lista`
--
ALTER TABLE `lista`
  MODIFY `id_lista` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `logro`
--
ALTER TABLE `logro`
  MODIFY `id_logro` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `resena`
--
ALTER TABLE `resena`
  MODIFY `id_resena` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `sesion_juego`
--
ALTER TABLE `sesion_juego`
  MODIFY `id_sesion` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuario_inventario`
--
ALTER TABLE `usuario_inventario`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `comentario_resena`
--
ALTER TABLE `comentario_resena`
  ADD CONSTRAINT `fk_com_resena` FOREIGN KEY (`id_resena`) REFERENCES `resena` (`id_resena`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_com_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `favorito`
--
ALTER TABLE `favorito`
  ADD CONSTRAINT `fk_fav_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `lista`
--
ALTER TABLE `lista`
  ADD CONSTRAINT `fk_lista_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `lista_videojuego`
--
ALTER TABLE `lista_videojuego`
  ADD CONSTRAINT `fk_lv_lista` FOREIGN KEY (`id_lista`) REFERENCES `lista` (`id_lista`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `preferencias_usuario`
--
ALTER TABLE `preferencias_usuario`
  ADD CONSTRAINT `fk_pref_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `resena`
--
ALTER TABLE `resena`
  ADD CONSTRAINT `fk_resena_companero` FOREIGN KEY (`id_companero`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_resena_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `seguimiento`
--
ALTER TABLE `seguimiento`
  ADD CONSTRAINT `fk_seg_seguido` FOREIGN KEY (`id_seguido`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_seg_seguidor` FOREIGN KEY (`id_seguidor`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `sesion_juego`
--
ALTER TABLE `sesion_juego`
  ADD CONSTRAINT `fk_sesion_companero` FOREIGN KEY (`id_companero`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usr_avatar` FOREIGN KEY (`id_avatar`) REFERENCES `avatar_item` (`id_item`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usr_borde` FOREIGN KEY (`id_borde`) REFERENCES `avatar_item` (`id_item`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario_inventario`
--
ALTER TABLE `usuario_inventario`
  ADD CONSTRAINT `fk_inv_item` FOREIGN KEY (`id_item`) REFERENCES `avatar_item` (`id_item`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_inv_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario_logro`
--
ALTER TABLE `usuario_logro`
  ADD CONSTRAINT `fk_ul_logro` FOREIGN KEY (`id_logro`) REFERENCES `logro` (`id_logro`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ul_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuario_monedas`
--
ALTER TABLE `usuario_monedas`
  ADD CONSTRAINT `fk_mon_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario_sobre`
--
ALTER TABLE `usuario_sobre`
  ADD CONSTRAINT `fk_sobre_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
