-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 05-03-2026 a las 01:15:02
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bdUnisimon`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades_plan`
--

CREATE TABLE `actividades_plan` (
  `id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `tipo_valor` enum('texto','numero','porcentaje','si_no','nivel','archivo') NOT NULL DEFAULT 'texto',
  `ayuda` text DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `actividades_plan`
--

INSERT INTO `actividades_plan` (`id`, `categoria_id`, `nombre`, `tipo_valor`, `ayuda`, `orden`, `activo`, `creado_en`) VALUES
(1, 1, 'Firma Plan Mejoramiento Firmado (S/N)', 'si_no', 'Indique si el plan de mejoramiento está firmado.', 1, 1, '2026-03-05 00:13:48'),
(2, 1, 'Inglés (nivel)', 'nivel', 'Ej: A1, A2, B1, B2, C1.', 2, 1, '2026-03-05 00:13:48'),
(3, 1, 'Líderes MediaTic. (Nivel)', 'nivel', 'Indique nivel alcanzado.', 3, 1, '2026-03-05 00:13:48'),
(4, 1, 'Integración curricular con otros cursos', 'texto', 'Describa la integración realizada.', 4, 1, '2026-03-05 00:13:48'),
(5, 2, 'Proyecto Integrador (Cuantos entrega)', 'numero', 'Número de entregas realizadas.', 1, 1, '2026-03-05 00:13:48'),
(6, 2, 'Aula extendida', 'texto', 'Describa acciones de aula extendida.', 2, 1, '2026-03-05 00:13:48'),
(7, 2, 'Uso de la biblioteca.', 'texto', 'Describa evidencias/uso.', 3, 1, '2026-03-05 00:13:48'),
(8, 3, 'Entrega de Documentos', 'texto', 'Detalle documentos entregados / estado.', 1, 1, '2026-03-05 00:13:48'),
(9, 3, 'Internacionalización', 'texto', 'Acciones/participaciones.', 2, 1, '2026-03-05 00:13:48'),
(10, 3, 'Informe de Gestión', 'texto', 'Estado del informe de gestión.', 3, 1, '2026-03-05 00:13:48'),
(11, 4, 'Extensión', 'texto', 'Acciones de extensión realizadas.', 1, 1, '2026-03-05 00:13:48'),
(12, 4, 'Investigación', 'texto', 'Productos/avances de investigación.', 2, 1, '2026-03-05 00:13:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia_registro`
--

CREATE TABLE `asistencia_registro` (
  `id` int(11) NOT NULL,
  `practica_id` int(11) NOT NULL,
  `semana_id` int(11) NOT NULL,
  `estado` enum('borrador','enviado','firmado_empresarial','firmado_completo') NOT NULL DEFAULT 'borrador',
  `actividades` text NOT NULL,
  `horas_cumplidas` decimal(10,0) NOT NULL,
  `enviado_en` datetime DEFAULT NULL,
  `creado_por_usuario_id` int(11) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime DEFAULT NULL,
  `firmado_tutor_empresarial` tinyint(1) NOT NULL DEFAULT 0,
  `firmado_empresarial_en` datetime DEFAULT NULL,
  `firmado_empresarial_por_usuario_id` int(11) DEFAULT NULL,
  `firmado_tutor_academico` tinyint(1) NOT NULL DEFAULT 0,
  `firmado_academico_en` datetime DEFAULT NULL,
  `firmado_academico_por_usuario_id` int(11) DEFAULT NULL,
  `fecha_revision` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asistencia_registro`
--

INSERT INTO `asistencia_registro` (`id`, `practica_id`, `semana_id`, `estado`, `actividades`, `horas_cumplidas`, `enviado_en`, `creado_por_usuario_id`, `creado_en`, `actualizado_en`, `firmado_tutor_empresarial`, `firmado_empresarial_en`, `firmado_empresarial_por_usuario_id`, `firmado_tutor_academico`, `firmado_academico_en`, `firmado_academico_por_usuario_id`, `fecha_revision`) VALUES
(5, 5, 5, 'borrador', 'Coordinación con tutor académico revisando las actividades a realizar y encuentro con el tutor empresarial.', 20, NULL, 19, '2026-02-13 00:20:41', NULL, 0, NULL, NULL, 0, NULL, NULL, NULL),
(6, 5, 6, 'borrador', 'Análisis de los procesos de las áreas involucradas en la problemática a resolver en la organización para el desarrollo de la solución tecnológica.', 40, NULL, 19, '2026-02-13 00:22:03', NULL, 0, NULL, NULL, 0, NULL, NULL, NULL),
(7, 6, 7, 'firmado_completo', 'Conocimiento de los procesos de la empresa y las actividades a realizar.\r\nDonde se explico el uso de las bases de datos, procesos comunes de soporte de los software de la clinica y proyectos actuales en desarrollo por parte del área de sistemas para las diferentes áreas. En dichas tareas se realizó retroalimentación, ya que todos fueron procesos explicativos para entrar en contexto de las actividades próximas a asignar.', 40, NULL, 22, '2026-02-13 14:15:59', '2026-02-21 00:53:55', 1, '2026-02-13 14:17:13', 21, 1, '2026-02-26 00:04:20', 12, '2026-02-12'),
(8, 6, 8, 'firmado_completo', 'Integración en equipo de desarrollo y asignación de proyecto inicial para restructuración backend según requerimientos actualizados y tecnologías adecuadas según el ingeniero a cargo del proyecto. \r\nEntre las asignaciones correspondiente, están:\r\n- Creación del nuevo backend usando Python en conjunto con la creación de la DB usando postgreSQL.\r\n- Conexiones a base de datos local con SQLserver y API MIPRES del ministerio.\r\n- Conexiones finales del front y el backe y creación de reportes por rangos de fechas.', 40, NULL, 22, '2026-02-18 12:42:28', NULL, 1, '2026-02-20 12:28:02', 21, 1, '2026-02-26 00:04:00', 12, '2026-02-19'),
(9, 6, 13, 'borrador', 'Recolección de los requerimientos, elección de las tecnologías y arquitectura para el desarrollo del programa junto con el ingeniero encargado.', 40, NULL, 22, '2026-02-21 01:11:58', '2026-02-26 11:47:27', 0, NULL, NULL, 0, NULL, NULL, NULL),
(10, 7, 10, 'borrador', 'Investigación y estudio de la Arquitectura Hexagonal aplicada al framework Laravel. El objetivo fue comprender la separación de la lógica de negocio de las dependencias externas (bases de datos, APIs, interfaces) para facilitar el mantenimiento y las pruebas unitarias de los sistemas que emplean esta arquitectura. \r\n\r\nRecopilación de recursos multimedia para una tienda virtual desarrollada en WordPress. Esta actividad incluyó la descarga y validación de recursos multimedia, asegurando la integridad visual y el rendimiento de la interfaz de usuario.', 20, NULL, 24, '2026-02-24 23:54:19', NULL, 0, NULL, NULL, 0, NULL, NULL, NULL),
(11, 7, 11, 'borrador', 'Recopilación de recursos multimedia para una tienda virtual desarrollada en WordPress. Esta actividad incluyó la descarga y validación de recursos multimedia, asegurando la integridad visual y el rendimiento de la interfaz de usuario.\r\n\r\nDesarrollo de script de automatización. Ante el alto volumen de datos, diseñé e implementé un script de automatización para la extracción y descarga masiva de imágenes. Aunque tuve que realizar una revisión para asegurar la correctitud de las imágenes obtenidas, redujo el tiempo empleado al eliminar la fase de recolección de forma manual.', 20, NULL, 24, '2026-02-24 23:54:52', NULL, 0, NULL, NULL, 0, NULL, NULL, NULL),
(12, 6, 18, 'borrador', 'Ayude a la instalación del nuevo antivirus para los equipos de la clínica. Como también, trabajé en el proyecto definiendo la arquitectura que va tener el back, las tablas de la BD y la interfaz web. Por último, empece a trabajar en el Script ejecutable para recolectar los datos de los equipos y guardando estos datos en las tablas de la BD.', 40, NULL, 22, '2026-02-26 11:47:21', '2026-02-26 12:13:09', 0, NULL, NULL, 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_plan`
--

CREATE TABLE `categorias_plan` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `orden` int(11) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias_plan`
--

INSERT INTO `categorias_plan` (`id`, `nombre`, `orden`, `activo`, `creado_en`) VALUES
(1, 'Formación', 1, 1, '2026-03-05 00:13:48'),
(2, 'Actividades Académicas', 2, 1, '2026-03-05 00:13:48'),
(3, 'Gestión Académica', 3, 1, '2026-03-05 00:13:48'),
(4, 'Investigación y Extensión', 4, 1, '2026-03-05 00:13:48'),
(5, 'Evaluación / Cierre', 5, 1, '2026-03-05 00:13:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `director_programa_programa`
--

CREATE TABLE `director_programa_programa` (
  `id` int(11) NOT NULL,
  `director_usuario_id` int(11) NOT NULL,
  `programa_id` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docente`
--

CREATE TABLE `docente` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cedula` int(11) DEFAULT NULL,
  `programa_id` int(11) NOT NULL,
  `tipo_contrato` varchar(60) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa`
--

CREATE TABLE `empresa` (
  `nit` varchar(20) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empresa`
--

INSERT INTO `empresa` (`nit`, `nombre`, `activo`) VALUES
('4444', 'LA NASA', 1),
('8000121897', 'Clinica San José de Cúcuta', 1),
('807003072', 'Candum', 1),
('8070050057', 'Veolia colombia', 1),
('860009985-0', 'Colegio La Salle Cúcuta ', 1),
('860066093', 'WORLD VISION INTERNATIONAL', 1),
('890.104.633-9', 'Universidad Simón Bolívar', 1),
('890104633', 'Universidad Simón Bolívar', 1),
('8905005149', 'Centrales Eléctricas del Norte de Santander S.A. E.S.P. (CENS)', 1),
('900.483.953-0', 'Umedicas', 1),
('90020609', 'Lavanderia Stone Color', 1),
('9006810496', 'Iglesia La Victoria Cruzada Cristiana', 1),
('9012356426', 'Be Better Developers SAS', 1),
('990011', 'BANCOLOMBIA', 1),
('998877', 'ECOPETROL', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `encuentro`
--

CREATE TABLE `encuentro` (
  `id` int(11) NOT NULL,
  `semana_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_final` time NOT NULL,
  `numero_encuentro` tinyint(4) NOT NULL,
  `nota_encuentro` decimal(5,2) DEFAULT NULL,
  `actividades` text DEFAULT NULL,
  `conclusiones` text DEFAULT NULL,
  `firmado_estudiante` tinyint(1) NOT NULL DEFAULT 0,
  `firmado_en` datetime DEFAULT NULL,
  `firmado_por_usuario_id` int(11) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `encuentro`
--

INSERT INTO `encuentro` (`id`, `semana_id`, `fecha`, `hora_inicio`, `hora_final`, `numero_encuentro`, `nota_encuentro`, `actividades`, `conclusiones`, `firmado_estudiante`, `firmado_en`, `firmado_por_usuario_id`, `activo`) VALUES
(5, 5, '2026-02-06', '19:45:00', '20:00:00', 1, 5.00, 'Coordinar la presentación en la empresa', 'Se realizará conexión virtual con el tutor empresarial de World Vision el 10 de Febrero de 2026', 1, '2026-02-13 00:18:54', 19, 1),
(6, 6, '2026-02-12', '17:00:00', '17:30:00', 1, 4.80, 'Revisión y firma del Acta de presentación y definición de evidencias a revisar el próximo encuentro', 'Seguimiento de las actividades a realizar el 19 de febrero.', 1, '2026-02-13 00:18:56', 19, 1),
(7, 7, '2026-02-06', '14:00:00', '14:30:00', 1, 5.00, 'Seguimiento a actividades iniciales de la práctica.', 'Reunión con Tutor empresarial en la semana 2.', 1, '2026-02-13 14:14:08', 22, 1),
(8, 12, '2026-02-19', '17:30:00', '18:00:00', 1, 5.00, 'Seguimiento a Desarrollo de Actividades Semana 3 - Analizar Diseño preliminar del software.', 'Ejecutar validaciones con los usuarios interesados.', 1, '2026-02-19 23:05:05', 19, 1),
(9, 8, '2026-02-12', '17:30:00', '18:00:00', 1, 4.80, 'Seguimiento a desarrollo de actividades semana 2', 'Validar la estructura del Backend propuesta con el líder del área.', 1, '2026-02-21 00:53:23', 22, 1),
(10, 13, '2026-02-19', '17:00:00', '17:30:00', 1, 4.80, 'Seguimiento desarrollo de actividades semana 3 - validaciones líder del área.', 'Mostrar avances del desarrollo de la página de recolección de datos de los equipos de usuario final.', 1, '2026-02-21 00:53:26', 22, 1),
(11, 14, '2026-02-06', '17:00:00', '17:15:00', 1, 4.00, 'Pendiente Firma de convenio para iniciar las prácticas.', 'Pendiente aval inicio de prácticas.', 0, NULL, NULL, 1),
(12, 15, '2026-02-13', '17:15:00', '17:20:00', 1, 4.00, 'Pendiente Firma de convenio para iniciar las prácticas.', 'Pendiente Aval Inicio de prácticas.', 0, NULL, NULL, 1),
(13, 16, '2026-02-20', '19:30:00', '19:45:00', 1, 4.00, 'Inicio de prácticas.', 'Definir cita con tutor Empresarial.   Documentar las actividades a realizar sistematización plan de seguimiento.', 0, NULL, NULL, 1),
(14, 17, '2026-02-23', '17:30:00', '18:00:00', 1, 4.50, 'Revisión del formato del plan de mejoramiento para diseñar bosquejo de solución.', 'Definir cita con tutor Empresarial.', 0, NULL, NULL, 1),
(15, 18, '2026-02-25', '18:15:00', '18:40:00', 1, 4.50, 'Seguimiento al desarrollo de Actividades.', 'Mostrar avances del primer informe para revisión.  Traer la arquitectura propuesta para analizarla. Se recomienda que la misma sea avalada por el tutor empresarial.', 1, '2026-02-26 11:43:59', 22, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudiante`
--

CREATE TABLE `estudiante` (
  `cedula` int(11) NOT NULL,
  `nombres` varchar(80) NOT NULL,
  `apellidos` varchar(80) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `programa_id` int(11) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudiante`
--

INSERT INTO `estudiante` (`cedula`, `nombres`, `apellidos`, `telefono`, `correo`, `programa_id`, `activo`) VALUES
(1111, 'Emilio', 'Pabón', '321', 'emilio@correo.co', NULL, 1),
(1122, 'Mateo', 'Pérez', '3003', 'estudiante@unisimon.edu.co', NULL, 1),
(2222, 'Helena', 'Pérez', '321', 'helena@correo.co', 1, 1),
(279680, 'Francisco Ignacio', 'Tejada Castañeda', '+542645619968', 'f_tejada@unisimon.edu.co', 1, 1),
(88310394, 'Jesus David', 'Caceres Silva', '3142534311', 'j_caceres7@unisimon.edu.co', NULL, 1),
(111677475, 'Paula Alejandra', 'Torres Contreras', '3138924153', 'p_torres2@unisimon.edu.co', NULL, 1),
(1004841865, 'Santyago Steven', 'Suescun Torres', '3202632228', 's_suescun2@unisimon.edu.co', 1, 1),
(1004922961, 'Ángel Gabriel', 'ibarra gomez', '3108886235', 'a_ibarra5@unisimon.edu.co', 1, 1),
(1004996854, 'Jefferson Enrique', 'Rodriguez Parra', '3175171010', 'thelinux7@gmail.com', 1, 1),
(1005054108, 'Michaelo Yandy', 'Fajardo Benavides', '3203603989', 'm_fajardo@unisimon.edu.co', 1, 1),
(1007176226, 'Santiago Andres', 'Rojas Claro', '3219745305', 's_rojas9@unisimon.edu.co', 1, 1),
(1010149880, 'Juan Diego', 'Galvis Romero', '3143480005', 'j_galvis16@unisimon.edu.co', 1, 1),
(1064706784, 'Darwin Ariel', 'Roa Barreto', '3138787250', 'd_roa2@unisimon.edu.co', 1, 1),
(1090483230, 'Luis Fernando', 'Contreras Pabon', '3023752755', 'l_contreras21@unisimon.edu.co', NULL, 1),
(1091964421, 'Roller Daniel', 'Paez Orduña', '3115966763', 'rollerpaez36@gmail.com', 1, 1),
(1092963589, 'Daniel Andres', 'Figueroa Rios', '3027541832', 'd_figueroa1@unisimon.edu.co', NULL, 1),
(1192757557, 'Joel Steven', 'Pineda Rincon', '3133118664', 'j_pineda2@unisimon.edu.co', NULL, 1),
(1193468157, 'Luis Alfredo', 'Camero Riaño', '3213894713', 'l_camero@unisimon.edu.co', 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodo`
--

CREATE TABLE `periodo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `periodo`
--

INSERT INTO `periodo` (`id`, `nombre`, `fecha_inicio`, `fecha_fin`, `activo`) VALUES
(1, '2026-1', '2026-02-15', '2026-05-30', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planes_trabajo_docente`
--

CREATE TABLE `planes_trabajo_docente` (
  `id` int(11) NOT NULL,
  `docente_id` int(11) NOT NULL,
  `periodo_id` int(11) NOT NULL,
  `estado` enum('borrador','en_progreso','en_revision','finalizado') NOT NULL DEFAULT 'borrador',
  `creado_por_usuario_id` int(11) NOT NULL,
  `observaciones_director` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_detalle`
--

CREATE TABLE `plan_detalle` (
  `id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `actividad_id` int(11) NOT NULL,
  `meta_valor` varchar(120) DEFAULT NULL,
  `meta_descripcion` text DEFAULT NULL,
  `ponderacion` decimal(5,2) DEFAULT NULL,
  `requiere_evidencia` tinyint(1) NOT NULL DEFAULT 0,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `practica`
--

CREATE TABLE `practica` (
  `id` int(11) NOT NULL,
  `cedula_estudiante` int(11) NOT NULL,
  `nit_empresa` varchar(20) NOT NULL,
  `cedula_tutor_academico` int(11) NOT NULL,
  `cedula_tutor_empresarial` int(11) NOT NULL,
  `periodo_id` int(11) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('asignada','en_curso','finalizada','cancelada') NOT NULL DEFAULT 'asignada',
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `practica`
--

INSERT INTO `practica` (`id`, `cedula_estudiante`, `nit_empresa`, `cedula_tutor_academico`, `cedula_tutor_empresarial`, `periodo_id`, `fecha_inicio`, `fecha_fin`, `estado`, `activo`) VALUES
(5, 1004996854, '860066093', 88233663, 1085953283, 1, '2026-02-06', '2026-06-06', '', 1),
(6, 1091964421, '8000121897', 88233663, 88233414, 1, '2026-02-02', '2026-06-30', '', 1),
(7, 279680, '9012356426', 88231548, 6219394, 1, '2026-02-02', '2026-06-06', '', 1),
(8, 1064706784, '890.104.633-9', 88233663, 88206787, 1, '2026-02-02', '2026-06-07', '', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programa`
--

CREATE TABLE `programa` (
  `id` int(11) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `programa`
--

INSERT INTO `programa` (`id`, `nombre`, `activo`) VALUES
(1, 'Ingeniería de Sistemas', 1),
(2, 'Ingeniería Mecánica', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimiento_historial`
--

CREATE TABLE `seguimiento_historial` (
  `id` bigint(20) NOT NULL,
  `seguimiento_id` int(11) NOT NULL,
  `valor_avance` varchar(120) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `evidencia_url` varchar(255) DEFAULT NULL,
  `evidencia_nombre` varchar(180) DEFAULT NULL,
  `estado` enum('pendiente','en_progreso','cumplido','no_aplica') NOT NULL,
  `cambiado_por_usuario_id` int(11) NOT NULL,
  `cambiado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimiento_plan`
--

CREATE TABLE `seguimiento_plan` (
  `id` int(11) NOT NULL,
  `plan_detalle_id` int(11) NOT NULL,
  `valor_avance` varchar(120) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `evidencia_url` varchar(255) DEFAULT NULL,
  `evidencia_nombre` varchar(180) DEFAULT NULL,
  `estado` enum('pendiente','en_progreso','cumplido','no_aplica') NOT NULL DEFAULT 'pendiente',
  `actualizado_por_usuario_id` int(11) NOT NULL,
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `semana_practica`
--

CREATE TABLE `semana_practica` (
  `id` int(11) NOT NULL,
  `practica_id` int(11) NOT NULL,
  `numero_semana` varchar(10) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `semana_practica`
--

INSERT INTO `semana_practica` (`id`, `practica_id`, `numero_semana`, `fecha_inicio`, `fecha_fin`, `activo`) VALUES
(5, 5, '1', '2026-02-02', '2026-02-06', 1),
(6, 5, '2', '2026-02-09', '2026-02-13', 1),
(7, 6, '1', '2026-02-02', '2026-02-07', 1),
(8, 6, '2', '2026-02-09', '2026-02-14', 1),
(9, 7, '1', '2026-02-02', '2026-02-06', 1),
(10, 7, '2', '2026-02-09', '2026-02-13', 1),
(11, 7, '3', '2026-02-16', '2026-02-20', 1),
(12, 5, '3', '2026-02-16', '2026-02-21', 1),
(13, 6, '3', '2026-02-16', '2026-02-21', 1),
(14, 8, '1', '2026-02-02', '2026-02-08', 1),
(15, 8, '2', '2026-02-09', '2026-02-14', 1),
(16, 8, '3', '2026-02-16', '2026-02-22', 1),
(17, 8, '4', '2026-02-23', '2026-02-28', 1),
(18, 6, '4', '2026-02-23', '2026-02-27', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tutor_academico`
--

CREATE TABLE `tutor_academico` (
  `cedula` int(11) NOT NULL,
  `nombres` varchar(80) NOT NULL,
  `apellidos` varchar(80) NOT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tutor_academico`
--

INSERT INTO `tutor_academico` (`cedula`, `nombres`, `apellidos`, `correo`, `telefono`, `activo`) VALUES
(12345, 'Heidy', 'Adarme', 'heidy@usb.co', '321', 1),
(52998313, 'Carlota', 'Bernal', 'mary.bernal@unisimon.edu.co', '3012777801', 1),
(77146915, 'Anderson', 'Florez', 'anderson.florez@unisimon.edu.co', '3143701358', 1),
(88196961, 'Jover', 'Cabrales', 'jover.cabrales@unisimon.edu.co', '3102021108', 1),
(88231548, 'Alvaro', 'Salamanca Landínez', 'alvaro.salamancal@unisimon.edu.co', '3246812763', 1),
(88233663, 'Miguel', 'Pérez', 'tutor.academico@unisimon.edu.co', '300', 1),
(1093775569, 'Eddy', 'Ortiz', 'Eddy.ortiz@unisimon.edu.co', '3208359373', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tutor_empresarial`
--

CREATE TABLE `tutor_empresarial` (
  `cedula` int(11) NOT NULL,
  `nit` varchar(20) NOT NULL,
  `nombres` varchar(80) NOT NULL,
  `apellidos` varchar(80) NOT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tutor_empresarial`
--

INSERT INTO `tutor_empresarial` (`cedula`, `nit`, `nombres`, `apellidos`, `correo`, `telefono`, `activo`) VALUES
(1090, '990011', 'Ana', 'Pinzón', 'tutor.empresarial@empresa.com', '300', 1),
(76543, '4444', 'Jaime', 'Pabón', 'jaime@correo.co', '321', 1),
(332233, '998877', 'Maria', 'Estevez', 'fer@correo.co', '3003', 1),
(6219394, '9012356426', 'Luis', 'Ortiz', 'luis.ortiz@bebetterdevelopers.com', '3182243841', 1),
(13276094, '90020609', 'Leonardo', 'Mayorga Garcia', 'Stonecolor@outlook.com', '3103462876', 1),
(52998313, '860009985-0', 'Mary Carlota', 'Bernal', 'mary.bernal@unisimon.edu.co', '3012777801', 1),
(60446063, '890104633', 'Iris', 'Valero', 'iris.valero@unisimon.edu.co', '3118425850', 1),
(88206787, '890104633', 'Johel Enrique', 'Rodríguez Fernández', 'johel.rodriguez@unisimon.edu.co', '3114837421', 1),
(88233414, '8000121897', 'Luis Arsenio', 'Castellanos', 'coordinacionsistemas@clinicasanjosedecucuta.com', '3108002898', 1),
(88305018, '900.483.953-0', 'Henry', 'Bastos Camacho', 'hjbasto73@gmail.com', '3163007009', 1),
(1085953283, '860066093', 'Giancarlo', 'Escobar Rojas', 'giancarlo_escobar@wvi.org', '3015152018', 1),
(1090400900, '8070050057', 'Jose David', 'Escalante', 'ingdavidescalantorres@gmail.com', '3153598521', 1),
(1090471405, '9006810496', 'Alix Rosana', 'Rodriguez Villamizar', 'roxana-0308@hotmail.com', '3103495462', 1),
(1090985513, '890.104.633-9', 'Pablo yazel', 'Rios', 'pablo.riosl@unisimon.edu.co', '3123675053', 1),
(1093767016, '890104633', 'Cristian', 'Toloza', 'c.toloza@unisimon.edu.co', '3214753136', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `cedula` int(11) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('estudiante','tutor_academico','tutor_empresarial','lider_practicas','admin','docente','director_programa') NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `cedula`, `password_hash`, `rol`, `activo`, `creado_en`) VALUES
(4, 'Líder de Prácticas', 'lider.practicas@unisimon.edu.co', NULL, '$2y$10$lzRNhhv7Q9BXcyskdpMHUOIBgttXNn3BrrvblTMY0SsPNfsmNVHB6', 'lider_practicas', 1, '2026-01-23 15:46:41'),
(5, 'Administrador Sistema', 'admin@unisimon.edu.co', 11, '$2y$10$ZYqxnZoWO1xmSsG0i2pRp.h9//yQoMGcGvIT.71EUb8l6lkGS4hkO', 'admin', 1, '2026-01-23 15:46:41'),
(11, 'Heidy Adarme', 'heidy@usb.co', 12345, '$2y$10$vuKB/jVK48/L3zPkoyQnAOAXHcrnBbJihjsK1DswvoedWrjQSX8s6', 'tutor_academico', 1, '2026-01-31 04:02:12'),
(12, 'Miguel Pérez', 'tutor.academico@unisimon.edu.co', 88233663, '$2y$10$OAESh2QN8M6Qqr3jsOJXnuqBwpJORw7pq.sG0Fh2FBmvMJQTU67Ri', 'tutor_academico', 1, '2026-01-31 14:26:21'),
(13, 'Ana Pinzón', 'tutor.empresarial@empresa.com', 1090, '$2y$10$ZBjqZm8u9dzJGUzu0tovjO7vYXkJRnEJoEus92iYCiFsxzvvc6vqW', 'tutor_empresarial', 1, '2026-01-31 14:29:34'),
(14, 'Mateo Pérez', 'estudiante@unisimon.edu.co', 1122, '$2y$10$6Yx/tt515x0LvCAHk6RJR.VEzMcPG.a.67rpZMtJbNlITchP8TbOC', 'estudiante', 1, '2026-01-31 14:31:00'),
(15, 'Helena Pérez', 'helena@correo.co', 2222, '$2y$10$uIb8ilSjYEIYWxFjqQlwjeSIq7bVANr4rt.Lc77QalS6NSui1AwP6', 'estudiante', 1, '2026-01-31 16:05:10'),
(16, 'Maria Estevez', 'fer@correo.co', 332233, '$2y$10$P3rSmp6m81A75gVfo0E4f.hoBr.9Z7dvhOKQoC4sdr.CNAG0bwaUC', 'tutor_empresarial', 1, '2026-01-31 16:08:50'),
(17, 'Emilio Pabón', 'emilio@correo.co', 1111, '$2y$10$PCsC0fVEkEg3QebKJCesQu/enWQ1BRSgvEgP5EjHM6uQ6SYkthtuS', 'estudiante', 1, '2026-01-31 16:16:22'),
(18, 'Jaime Pabón', 'jaime@correo.co', 76543, '$2y$10$YC0O1318CTDYNlV1L0tqb.04YPQmo5SXXxe/1pvih6y6wmtYR/W2i', 'tutor_empresarial', 1, '2026-01-31 16:17:41'),
(19, 'Jefferson Enrique Rodriguez Parra', 'thelinux7@gmail.com', 1004996854, '$2y$10$MyDMLv3vMe1hRVdm3lUT3e/IVfP6MiNlGRpXonJM080K0J6tkzeWy', 'estudiante', 1, '2026-02-13 00:06:02'),
(20, 'Giancarlo Escobar Rojas', 'giancarlo_escobar@wvi.org', 1085953283, '$2y$10$9JGQ2Nu225JQDGfr5JiiAuszHmrEuXMZrfV0VSdZVfOHNYoTkZjZC', 'tutor_empresarial', 1, '2026-02-13 00:10:35'),
(21, 'Luis Arsenio Castellanos', 'coordinacionsistemas@clinicasanjosedecucuta.com', 88233414, '$2y$10$cZYJ4OyDxCh/dcHvgew3oOwb26XdTLz3qRC386ektVHNsecn9Pgaq', 'tutor_empresarial', 1, '2026-02-13 14:07:59'),
(22, 'Roller Daniel Paez Orduña', 'rollerpaez36@gmail.com', 1091964421, '$2y$10$nEEhLKkVNwN6PKETeCSy4.0qXcrYEDdMuYuolVaoRnSu9vQm9iquC', 'estudiante', 1, '2026-02-13 14:09:01'),
(23, 'Alvaro Salamanca Landínez', 'alvaro.salamancal@unisimon.edu.co', 88231548, '$2y$10$o3gqPEfxnd8uWIyc8zpdmeVdikZdPo40iCaSoP1VHmQOBuVdnUtdC', 'tutor_academico', 1, '2026-02-19 22:38:05'),
(24, 'Francisco Ignacio Tejada Castañeda', 'f_tejada@unisimon.edu.co', 279680, '$2y$10$7UXTHDqVARUdF7CBE4cCNuJpVDNTPT5s54Yhsh9BwJ58xP/ndXRSe', 'estudiante', 1, '2026-02-19 22:39:49'),
(25, 'Luis Ortiz', 'luis.ortiz@bebetterdevelopers.com', 6219394, '$2y$10$A0p7rJRaJ5uRhO0MT1RfiuAagQFX8IXYf8XLCLIKgXzcLneamOMFa', 'tutor_empresarial', 1, '2026-02-19 22:53:29'),
(26, 'Darwin Ariel Roa Barreto', 'd_roa2@unisimon.edu.co', 1064706784, '$2y$10$W/a1/WbRWNt/79o8ZrhXcO4ot7oqyhCSFqs51KYj2Usx5gq5hfRG2', 'estudiante', 1, '2026-02-21 00:23:50'),
(27, 'Luis Alfredo Camero Riaño', 'l_camero@unisimon.edu.co', 1193468157, '$2y$10$zWBS6jLq42wwAaGl8zBj.uxw6pl5zrOeWX6mznn6IwlniVnBOUhFi', 'estudiante', 1, '2026-02-21 00:24:12'),
(28, 'Michaelo Yandy Fajardo Benavides', 'm_fajardo@unisimon.edu.co', 1005054108, '$2y$10$ILC/HH4w3gqB5CLNfPwE2umkex4PcWU2DHI5XbL.sP./QRZNX6ZPO', 'estudiante', 1, '2026-02-21 00:24:12'),
(30, 'Ángel Gabriel ibarra gomez', 'a_ibarra5@unisimon.edu.co', 1004922961, '$2y$10$owEL2zsGWtt4cMxPJEp7Z.NzIS5.qQ.rUXe5Nix1uSY8SieV68byW', 'estudiante', 1, '2026-02-21 00:25:37'),
(31, 'Juan Diego Galvis Romero', 'j_galvis16@unisimon.edu.co', 1010149880, '$2y$10$vUwneIx6Oa4x/iQADSwTOuNmKpnyEQxdhNi3PeSQd9305uPQLiGwK', 'estudiante', 1, '2026-02-21 00:33:11'),
(32, 'Santyago Steven Suescun Torres', 's_suescun2@unisimon.edu.co', 1004841865, '$2y$10$uO8eR4dKDZpPg8Q2H3VIgeX4eOUe/Amf537pZB9rYxI1SswKFp/ly', 'estudiante', 1, '2026-02-21 00:33:27'),
(33, 'Santiago Andres Rojas Claro', 's_rojas9@unisimon.edu.co', 1007176226, '$2y$10$4z/y8NYewf/VAcXbL.oe0.VDbYiYMSEDG2D4nRY9WLk4rN2tDSopW', 'estudiante', 1, '2026-02-21 00:33:30'),
(34, 'Cristian Toloza', 'c.toloza@unisimon.edu.co', 1093767016, '$2y$10$xjw.u38cyIkgt3mBdGvzueNnyT0eOSr2tR2BfnjSnohtOgvocY0SO', 'tutor_empresarial', 1, '2026-02-21 00:45:40'),
(35, 'Iris Valero', 'iris.valero@unisimon.edu.co', 60446063, '$2y$10$UwZ8htTQTBSK27dDfdssouHcitbHZnbG2U9qFbaHC3ByMSGJ3XnSG', 'tutor_empresarial', 1, '2026-02-21 00:45:49'),
(36, 'Johel Enrique Rodríguez Fernández', 'johel.rodriguez@unisimon.edu.co', 88206787, '$2y$10$1sRR.xW4wDTdUka/kjGApubZNsOr7poU7XFSdPs3pIyoTB/5wEvQm', 'tutor_empresarial', 1, '2026-02-21 00:46:13'),
(38, 'Joel Steven Pineda Rincon', 'j_pineda2@unisimon.edu.co', 1192757557, '$2y$10$nZ02zIKhLoRkEsJwP/BQhOBRJr1Oj7EicQzzkYUnmuz7PxSAqOmeK', 'estudiante', 1, '2026-02-21 00:52:36'),
(39, 'Daniel Andres Figueroa Rios', 'd_figueroa1@unisimon.edu.co', 1092963589, '$2y$10$EnqUEYoh8SITzmlK1PY8yuiV5BWhlolbvbwJp/TJazo5CM8ntYj56', 'estudiante', 1, '2026-02-21 00:52:44'),
(40, 'Luis Fernando Contreras Pabon', 'l_contreras21@unisimon.edu.co', 1090483230, '$2y$10$vHWOWB9m9wf159qjLX7sie7rIAn8iqWpOQUXF0Fymb9LnbOvCDoji', 'estudiante', 1, '2026-02-21 00:53:14'),
(41, 'Paula Alejandra Torres Contreras', 'p_torres2@unisimon.edu.co', 111677475, '$2y$10$o6l7OcyccoP6zhJFaiKY/uAZsLJB4DkHHpDa25ilTDuA9Vl7ne6Ou', 'estudiante', 1, '2026-02-21 00:53:15'),
(42, 'Jesus David Caceres Silva', 'j_caceres7@unisimon.edu.co', 88310394, '$2y$10$jG8rGpjUcD1KWRFi7/nQxeKRP51pMbyhWiTbRyug.DmcbZ4JtK.ni', 'estudiante', 1, '2026-02-21 00:55:19'),
(43, 'Leonardo Mayorga Garcia', 'Stonecolor@outlook.com', 13276094, '$2y$10$kAjQCVcIM.iLlkbIHsUWt.uRr0KMA0l5sky4REQphdBlGSSnNc5Qi', 'tutor_empresarial', 1, '2026-02-21 00:58:14'),
(44, 'Alix Rosana Rodriguez Villamizar', 'roxana-0308@hotmail.com', 1090471405, '$2y$10$DwAWgSneWZKV3L9GB6TG6e93K9u/5GZRSvlN1iHPrh4kPixk0BucS', 'tutor_empresarial', 1, '2026-02-21 01:01:04'),
(45, 'Pablo yazel Rios', 'pablo.riosl@unisimon.edu.co', 1090985513, '$2y$10$MyI5GBP91MfxRosdx4bwLeCt.maG9iFCApY8PmzpWN7k44m1eFsv.', 'tutor_empresarial', 1, '2026-02-21 01:05:56'),
(46, 'Jose David Escalante', 'ingdavidescalantorres@gmail.com', 1090400900, '$2y$10$mmD4RsMYwcl3gfD817zhae.3QgHIkq81VZ3ydbZNKuoq2yQOOyTZC', 'tutor_empresarial', 1, '2026-02-21 01:07:09'),
(47, 'Henry Bastos Camacho', 'hjbasto73@gmail.com', 88305018, '$2y$10$PVBCaPp4o1n5tobQi7.krO7deLNBqMLzXe1LCZoQpEaOuu6j9F7O6', 'tutor_empresarial', 1, '2026-02-23 15:43:46'),
(48, 'Anderson Florez', 'anderson.florez@unisimon.edu.co', 77146915, '$2y$10$0tMoWMy9h0o3nJXt6sSeTu.AUCKTL01/AIkrjKFmOThzSTRYJ/Qsq', 'tutor_academico', 1, '2026-02-26 12:42:16'),
(49, 'Jover Cabrales', 'jover.cabrales@unisimon.edu.co', 88196961, '$2y$10$/on6ADKcO5neiBL2ok4RhuYP3exeqlOAHoUPSYkl39qdxfrxiMrW6', 'tutor_academico', 1, '2026-02-26 12:44:22'),
(50, 'Carlota Bernal', 'mary.bernal@unisimon.edu.co', 52998313, '$2y$10$j3iibYH.z9GQkOurXAZpxeb.4eSrZH2dqR/xRLqItDrAFItolDWFi', 'tutor_academico', 1, '2026-02-26 12:46:13'),
(51, 'Eddy Ortiz', 'Eddy.ortiz@unisimon.edu.co', 1093775569, '$2y$10$uKDhLKh64/Xnqrh3lre/Su/cqsfL8axvEC9FgGs54tB5b15Zolq6m', 'tutor_academico', 1, '2026-02-26 12:49:26');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_avance_plan_docente`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_avance_plan_docente` (
`plan_id` int(11)
,`estado_plan` enum('borrador','en_progreso','en_revision','finalizado')
,`periodo` varchar(30)
,`docente_id` int(11)
,`docente_nombre` varchar(120)
,`programa_id` int(11)
,`programa` varchar(60)
,`categoria` varchar(120)
,`actividad` varchar(200)
,`tipo_valor` enum('texto','numero','porcentaje','si_no','nivel','archivo')
,`meta_valor` varchar(120)
,`valor_avance` varchar(120)
,`estado_actividad` enum('pendiente','en_progreso','cumplido','no_aplica')
,`fecha_actualizacion` datetime
,`evidencia_url` varchar(255)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_avance_plan_docente`
--
DROP TABLE IF EXISTS `vw_avance_plan_docente`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `bdunisimon`.`vw_avance_plan_docente`  AS SELECT `p`.`id` AS `plan_id`, `p`.`estado` AS `estado_plan`, `pe`.`nombre` AS `periodo`, `d`.`id` AS `docente_id`, `u`.`nombre` AS `docente_nombre`, `d`.`programa_id` AS `programa_id`, `pr`.`nombre` AS `programa`, `cp`.`nombre` AS `categoria`, `ap`.`nombre` AS `actividad`, `ap`.`tipo_valor` AS `tipo_valor`, `pd`.`meta_valor` AS `meta_valor`, `sp`.`valor_avance` AS `valor_avance`, `sp`.`estado` AS `estado_actividad`, `sp`.`fecha_actualizacion` AS `fecha_actualizacion`, `sp`.`evidencia_url` AS `evidencia_url` FROM ((((((((`bdunisimon`.`planes_trabajo_docente` `p` join `bdunisimon`.`docente` `d` on(`d`.`id` = `p`.`docente_id`)) join `bdunisimon`.`usuarios` `u` on(`u`.`id` = `d`.`usuario_id`)) join `bdunisimon`.`programa` `pr` on(`pr`.`id` = `d`.`programa_id`)) join `bdunisimon`.`periodo` `pe` on(`pe`.`id` = `p`.`periodo_id`)) join `bdunisimon`.`plan_detalle` `pd` on(`pd`.`plan_id` = `p`.`id`)) join `bdunisimon`.`actividades_plan` `ap` on(`ap`.`id` = `pd`.`actividad_id`)) join `bdunisimon`.`categorias_plan` `cp` on(`cp`.`id` = `ap`.`categoria_id`)) left join `bdunisimon`.`seguimiento_plan` `sp` on(`sp`.`plan_detalle_id` = `pd`.`id`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actividades_plan`
--
ALTER TABLE `actividades_plan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_act_categoria_nombre` (`categoria_id`,`nombre`),
  ADD KEY `idx_act_categoria` (`categoria_id`),
  ADD KEY `idx_act_orden` (`orden`),
  ADD KEY `idx_act_activo` (`activo`);

--
-- Indices de la tabla `asistencia_registro`
--
ALTER TABLE `asistencia_registro`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_asist_reg_practica` (`practica_id`),
  ADD KEY `fk_asist_reg_creado_por` (`creado_por_usuario_id`),
  ADD KEY `fk_asist_reg_firmado_emp_por` (`firmado_empresarial_por_usuario_id`),
  ADD KEY `fk_asist_reg_firmado_acad_por` (`firmado_academico_por_usuario_id`),
  ADD KEY `semana_id` (`semana_id`);

--
-- Indices de la tabla `categorias_plan`
--
ALTER TABLE `categorias_plan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_cat_nombre` (`nombre`),
  ADD KEY `idx_cat_orden` (`orden`),
  ADD KEY `idx_cat_activo` (`activo`);

--
-- Indices de la tabla `director_programa_programa`
--
ALTER TABLE `director_programa_programa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_director_programa` (`director_usuario_id`,`programa_id`),
  ADD KEY `idx_dpp_programa` (`programa_id`);

--
-- Indices de la tabla `docente`
--
ALTER TABLE `docente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_docente_usuario` (`usuario_id`),
  ADD UNIQUE KEY `uq_docente_cedula` (`cedula`),
  ADD KEY `idx_docente_programa` (`programa_id`),
  ADD KEY `idx_docente_activo` (`activo`);

--
-- Indices de la tabla `empresa`
--
ALTER TABLE `empresa`
  ADD PRIMARY KEY (`nit`);

--
-- Indices de la tabla `encuentro`
--
ALTER TABLE `encuentro`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_encuentro` (`semana_id`,`numero_encuentro`),
  ADD KEY `fk_encuentro_firmado_por_usuario` (`firmado_por_usuario_id`);

--
-- Indices de la tabla `estudiante`
--
ALTER TABLE `estudiante`
  ADD PRIMARY KEY (`cedula`),
  ADD KEY `fk_estudiante_programa` (`programa_id`);

--
-- Indices de la tabla `periodo`
--
ALTER TABLE `periodo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `planes_trabajo_docente`
--
ALTER TABLE `planes_trabajo_docente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_plan_docente_periodo` (`docente_id`,`periodo_id`),
  ADD KEY `idx_plan_periodo` (`periodo_id`),
  ADD KEY `idx_plan_estado` (`estado`),
  ADD KEY `fk_plan_creado_por` (`creado_por_usuario_id`);

--
-- Indices de la tabla `plan_detalle`
--
ALTER TABLE `plan_detalle`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_detalle_plan_actividad` (`plan_id`,`actividad_id`),
  ADD KEY `idx_detalle_plan` (`plan_id`),
  ADD KEY `idx_detalle_act` (`actividad_id`);

--
-- Indices de la tabla `practica`
--
ALTER TABLE `practica`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_practica_estudiante_periodo` (`cedula_estudiante`,`periodo_id`),
  ADD KEY `fk_practica_periodo` (`periodo_id`),
  ADD KEY `idx_practica_tutor_academico` (`cedula_tutor_academico`),
  ADD KEY `idx_practica_tutor_empresarial` (`cedula_tutor_empresarial`),
  ADD KEY `idx_practica_empresa` (`nit_empresa`);

--
-- Indices de la tabla `programa`
--
ALTER TABLE `programa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `seguimiento_historial`
--
ALTER TABLE `seguimiento_historial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_hist_seguimiento` (`seguimiento_id`),
  ADD KEY `idx_hist_fecha` (`cambiado_en`),
  ADD KEY `fk_hist_usuario` (`cambiado_por_usuario_id`);

--
-- Indices de la tabla `seguimiento_plan`
--
ALTER TABLE `seguimiento_plan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_seg_detalle` (`plan_detalle_id`),
  ADD KEY `idx_seg_estado` (`estado`),
  ADD KEY `idx_seg_fecha` (`fecha_actualizacion`),
  ADD KEY `fk_seg_usuario` (`actualizado_por_usuario_id`);

--
-- Indices de la tabla `semana_practica`
--
ALTER TABLE `semana_practica`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_semana_practica` (`practica_id`,`numero_semana`);

--
-- Indices de la tabla `tutor_academico`
--
ALTER TABLE `tutor_academico`
  ADD PRIMARY KEY (`cedula`);

--
-- Indices de la tabla `tutor_empresarial`
--
ALTER TABLE `tutor_empresarial`
  ADD PRIMARY KEY (`cedula`),
  ADD KEY `fk_tutor_empresarial_empresa` (`nit`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_usuarios_persona` (`cedula`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividades_plan`
--
ALTER TABLE `actividades_plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `asistencia_registro`
--
ALTER TABLE `asistencia_registro`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `categorias_plan`
--
ALTER TABLE `categorias_plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `director_programa_programa`
--
ALTER TABLE `director_programa_programa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `docente`
--
ALTER TABLE `docente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `encuentro`
--
ALTER TABLE `encuentro`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `periodo`
--
ALTER TABLE `periodo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `planes_trabajo_docente`
--
ALTER TABLE `planes_trabajo_docente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plan_detalle`
--
ALTER TABLE `plan_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `practica`
--
ALTER TABLE `practica`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `programa`
--
ALTER TABLE `programa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `seguimiento_historial`
--
ALTER TABLE `seguimiento_historial`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `seguimiento_plan`
--
ALTER TABLE `seguimiento_plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `semana_practica`
--
ALTER TABLE `semana_practica`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `actividades_plan`
--
ALTER TABLE `actividades_plan`
  ADD CONSTRAINT `fk_act_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_plan` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `asistencia_registro`
--
ALTER TABLE `asistencia_registro`
  ADD CONSTRAINT `fk_asist_reg_creado_por` FOREIGN KEY (`creado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asist_reg_firmado_acad_por` FOREIGN KEY (`firmado_academico_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asist_reg_firmado_emp_por` FOREIGN KEY (`firmado_empresarial_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asist_reg_practica` FOREIGN KEY (`practica_id`) REFERENCES `practica` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `director_programa_programa`
--
ALTER TABLE `director_programa_programa`
  ADD CONSTRAINT `fk_dpp_director_usuario` FOREIGN KEY (`director_usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_dpp_programa` FOREIGN KEY (`programa_id`) REFERENCES `programa` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `docente`
--
ALTER TABLE `docente`
  ADD CONSTRAINT `fk_docente_programa` FOREIGN KEY (`programa_id`) REFERENCES `programa` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_docente_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `encuentro`
--
ALTER TABLE `encuentro`
  ADD CONSTRAINT `fk_encuentro_firmado_por_usuario` FOREIGN KEY (`firmado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_encuentro_semana` FOREIGN KEY (`semana_id`) REFERENCES `semana_practica` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `estudiante`
--
ALTER TABLE `estudiante`
  ADD CONSTRAINT `fk_estudiante_programa` FOREIGN KEY (`programa_id`) REFERENCES `programa` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `planes_trabajo_docente`
--
ALTER TABLE `planes_trabajo_docente`
  ADD CONSTRAINT `fk_plan_creado_por` FOREIGN KEY (`creado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_plan_docente` FOREIGN KEY (`docente_id`) REFERENCES `docente` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_plan_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodo` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `plan_detalle`
--
ALTER TABLE `plan_detalle`
  ADD CONSTRAINT `fk_detalle_actividad` FOREIGN KEY (`actividad_id`) REFERENCES `actividades_plan` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detalle_plan` FOREIGN KEY (`plan_id`) REFERENCES `planes_trabajo_docente` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `practica`
--
ALTER TABLE `practica`
  ADD CONSTRAINT `fk_practica_empresa` FOREIGN KEY (`nit_empresa`) REFERENCES `empresa` (`nit`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_practica_estudiante` FOREIGN KEY (`cedula_estudiante`) REFERENCES `estudiante` (`cedula`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_practica_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodo` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_practica_tutor_academico` FOREIGN KEY (`cedula_tutor_academico`) REFERENCES `tutor_academico` (`cedula`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_practica_tutor_empresarial` FOREIGN KEY (`cedula_tutor_empresarial`) REFERENCES `tutor_empresarial` (`cedula`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `seguimiento_historial`
--
ALTER TABLE `seguimiento_historial`
  ADD CONSTRAINT `fk_hist_seguimiento` FOREIGN KEY (`seguimiento_id`) REFERENCES `seguimiento_plan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_hist_usuario` FOREIGN KEY (`cambiado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `seguimiento_plan`
--
ALTER TABLE `seguimiento_plan`
  ADD CONSTRAINT `fk_seg_detalle` FOREIGN KEY (`plan_detalle_id`) REFERENCES `plan_detalle` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_seg_usuario` FOREIGN KEY (`actualizado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `semana_practica`
--
ALTER TABLE `semana_practica`
  ADD CONSTRAINT `fk_semana_practica` FOREIGN KEY (`practica_id`) REFERENCES `practica` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tutor_empresarial`
--
ALTER TABLE `tutor_empresarial`
  ADD CONSTRAINT `fk_tutor_empresarial_empresa` FOREIGN KEY (`nit`) REFERENCES `empresa` (`nit`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
