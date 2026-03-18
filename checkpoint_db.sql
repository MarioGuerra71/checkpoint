-- ============================================================
--  CHECKPOINT — Script de creación de base de datos
--  Motor: MySQL / MariaDB
-- ============================================================

CREATE DATABASE IF NOT EXISTS checkpoint_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE checkpoint_db;

-- ------------------------------------------------------------
-- USUARIO
-- ------------------------------------------------------------
CREATE TABLE usuario (
  id_usuario      INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre_usuario  VARCHAR(50)     NOT NULL UNIQUE,
  email           VARCHAR(100)    NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255)    NOT NULL,
  avatar          VARCHAR(255)        NULL DEFAULT NULL,
  fecha_registro  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- PREFERENCIAS_USUARIO  (1:1 con usuario)
-- ------------------------------------------------------------
CREATE TABLE preferencias_usuario (
  id_usuario  INT UNSIGNED  NOT NULL,
  tema        ENUM('oscuro','claro') NOT NULL DEFAULT 'oscuro',
  PRIMARY KEY (id_usuario),
  CONSTRAINT fk_pref_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- SEGUIMIENTO  (N:M usuario–usuario)
-- ------------------------------------------------------------
CREATE TABLE seguimiento (
  id_seguidor  INT UNSIGNED  NOT NULL,
  id_seguido   INT UNSIGNED  NOT NULL,
  fecha        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_seguidor, id_seguido),
  CONSTRAINT chk_no_autofollow CHECK (id_seguidor <> id_seguido),
  CONSTRAINT fk_seg_seguidor
    FOREIGN KEY (id_seguidor) REFERENCES usuario (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_seg_seguido
    FOREIGN KEY (id_seguido)  REFERENCES usuario (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- RESENA
-- ------------------------------------------------------------
CREATE TABLE resena (
  id_resena     INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  rawg_game_id  INT UNSIGNED  NOT NULL,
  id_usuario    INT UNSIGNED  NOT NULL,
  puntuacion    TINYINT UNSIGNED NULL DEFAULT NULL
                  CHECK (puntuacion BETWEEN 1 AND 5),
  comentario    TEXT              NULL DEFAULT NULL,
  fecha_resena  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_resena),
  UNIQUE KEY uq_resena_usuario_juego (id_usuario, rawg_game_id),
  CONSTRAINT fk_resena_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- COMENTARIO_RESENA
-- ------------------------------------------------------------
CREATE TABLE comentario_resena (
  id_comentario     INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_resena         INT UNSIGNED  NOT NULL,
  id_usuario        INT UNSIGNED  NOT NULL,
  contenido         TEXT          NOT NULL,
  fecha_comentario  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_comentario),
  CONSTRAINT fk_com_resena
    FOREIGN KEY (id_resena)  REFERENCES resena  (id_resena)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_com_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- SESION_JUEGO
-- ------------------------------------------------------------
CREATE TABLE sesion_juego (
  id_sesion         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  rawg_game_id      INT UNSIGNED  NOT NULL,
  id_usuario        INT UNSIGNED  NOT NULL,
  duracion_minutos  SMALLINT UNSIGNED NOT NULL,
  fecha_sesion      DATE          NOT NULL,
  comentario        TEXT              NULL DEFAULT NULL,
  PRIMARY KEY (id_sesion),
  CONSTRAINT fk_sesion_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- LISTA
-- ------------------------------------------------------------
CREATE TABLE lista (
  id_lista       INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_usuario     INT UNSIGNED  NOT NULL,
  nombre_lista   VARCHAR(100)  NOT NULL,
  fecha_creacion DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_lista),
  CONSTRAINT fk_lista_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- LISTA_VIDEOJUEGO  (N:M lista–juegos RAWG)
-- ------------------------------------------------------------
CREATE TABLE lista_videojuego (
  id_lista      INT UNSIGNED  NOT NULL,
  rawg_game_id  INT UNSIGNED  NOT NULL,
  PRIMARY KEY (id_lista, rawg_game_id),
  CONSTRAINT fk_lv_lista
    FOREIGN KEY (id_lista) REFERENCES lista (id_lista)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- FAVORITO  (N:M usuario–juegos RAWG)
-- ------------------------------------------------------------
CREATE TABLE favorito (
  id_usuario    INT UNSIGNED  NOT NULL,
  rawg_game_id  INT UNSIGNED  NOT NULL,
  PRIMARY KEY (id_usuario, rawg_game_id),
  CONSTRAINT fk_fav_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  VISTAS
-- ============================================================

-- Vista 1: Reseñas públicas (sin datos sensibles del usuario)
CREATE OR REPLACE VIEW v_resenas_publicas AS
  SELECT
    r.id_resena,
    r.rawg_game_id,
    r.puntuacion,
    r.comentario,
    r.fecha_resena,
    u.id_usuario,
    u.nombre_usuario,
    u.avatar
  FROM resena r
  JOIN usuario u ON u.id_usuario = r.id_usuario;

-- Vista 2: Listas de usuario
CREATE OR REPLACE VIEW v_listas_usuario AS
  SELECT
    l.id_lista,
    l.nombre_lista,
    l.fecha_creacion,
    u.id_usuario,
    u.nombre_usuario,
    COUNT(lv.rawg_game_id) AS total_juegos
  FROM lista l
  JOIN usuario u ON u.id_usuario = l.id_usuario
  LEFT JOIN lista_videojuego lv ON lv.id_lista = l.id_lista
  GROUP BY l.id_lista, l.nombre_lista, l.fecha_creacion,
           u.id_usuario, u.nombre_usuario;

-- Vista 3: Estadísticas de usuario
CREATE OR REPLACE VIEW v_estadisticas_usuario AS
  SELECT
    u.id_usuario,
    u.nombre_usuario,
    COALESCE(SUM(s.duracion_minutos), 0)  AS minutos_totales,
    COUNT(DISTINCT s.id_sesion)           AS total_sesiones,
    COUNT(DISTINCT r.id_resena)           AS total_resenas,
    COUNT(DISTINCT f.rawg_game_id)        AS total_favoritos
  FROM usuario u
  LEFT JOIN sesion_juego s ON s.id_usuario = u.id_usuario
  LEFT JOIN resena       r ON r.id_usuario = u.id_usuario
  LEFT JOIN favorito     f ON f.id_usuario = u.id_usuario
  GROUP BY u.id_usuario, u.nombre_usuario;
