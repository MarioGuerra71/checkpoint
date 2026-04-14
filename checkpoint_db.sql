-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-04-2026 a las 21:24:58
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
(1, 3, 1, 'Increible review', '2026-04-14 13:47:18');

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
(3, 1, 'RPGs épicos', '2026-03-24 12:51:19'),
(4, 1, 'Mejores Juegos de Puzles', '2026-04-08 14:33:06');

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
(3, 3498),
(3, 41494),
(4, 25097),
(4, 977316);

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
(2, 'oscuro');

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
  `fecha_resena` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `resena`
--

INSERT INTO `resena` (`id_resena`, `rawg_game_id`, `id_usuario`, `puntuacion`, `comentario`, `fecha_resena`) VALUES
(1, 41494, 1, 5, 'Una obra maestra, el mejor soulslike hasta la fecha.', '2025-03-16 00:00:00'),
(2, 3498, 1, 4, 'Muy buen juego, la historia engancha muchísimo.', '2025-03-23 00:00:00'),
(3, 28, 1, 3, NULL, '2025-03-21 00:00:00'),
(6, 25097, 1, 5, NULL, '2026-04-09 14:26:21'),
(7, 977316, 1, 5, 'Menudo vicio!', '2026-04-14 13:49:17');

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
(1, 2, '2026-04-09 13:06:59');

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
  `comentario` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sesion_juego`
--

INSERT INTO `sesion_juego` (`id_sesion`, `rawg_game_id`, `id_usuario`, `duracion_minutos`, `fecha_sesion`, `comentario`) VALUES
(1, 41494, 1, 120, '2025-03-20', 'Partida online con amigos'),
(2, 41494, 1, 90, '2025-03-18', NULL),
(3, 58175, 1, 180, '2025-03-15', 'Primera vez que llego al final'),
(4, 58175, 1, 200, '2025-03-10', NULL),
(5, 3498, 1, 60, '2025-03-22', 'Misión principal completada'),
(6, 28, 1, 45, '2025-03-21', NULL),
(7, 25097, 1, 35, '2026-04-07', 'Me he pasado una mision secundaria'),
(9, 25097, 1, 20, '2026-04-09', 'Muuy bien');

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
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre_usuario`, `email`, `contrasena_hash`, `avatar`, `fecha_registro`) VALUES
(1, 'admin', 'admin@checkpoint.com', '$2b$10$7brUTUzv2luQTg0z6PTcnefr7AG.RTSQS8MMb4Dv7BoHlCA7kDKs.', NULL, '2026-03-18 14:33:36'),
(2, 'mario', 'mario@gmail.com', '$2b$10$oe6WjleyU9TJGKaRX20XM.wPD8rYWbPmOa7U6J7VhMffc7/w/NxHu', NULL, '2026-03-19 12:16:02');

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
-- Indices de la tabla `preferencias_usuario`
--
ALTER TABLE `preferencias_usuario`
  ADD PRIMARY KEY (`id_usuario`);

--
-- Indices de la tabla `resena`
--
ALTER TABLE `resena`
  ADD PRIMARY KEY (`id_resena`),
  ADD UNIQUE KEY `uq_resena_usuario_juego` (`id_usuario`,`rawg_game_id`);

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
  ADD KEY `fk_sesion_usuario` (`id_usuario`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `comentario_resena`
--
ALTER TABLE `comentario_resena`
  MODIFY `id_comentario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `lista`
--
ALTER TABLE `lista`
  MODIFY `id_lista` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `resena`
--
ALTER TABLE `resena`
  MODIFY `id_resena` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `sesion_juego`
--
ALTER TABLE `sesion_juego`
  MODIFY `id_sesion` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  ADD CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
