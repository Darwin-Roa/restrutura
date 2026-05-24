-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3307
-- Tiempo de generación: 16-05-2026 a las 00:10:47
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
-- Base de datos: `mejora_profesoral`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades_plan`
--

CREATE TABLE `actividades_plan` (
  `id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo_valor` enum('S/N','Numerico','Texto','Porcentaje','Opciones') NOT NULL DEFAULT 'Texto',
  `ayuda` text DEFAULT NULL,
  `orden` int(11) NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia_registro`
--

CREATE TABLE `asistencia_registro` (
  `id` int(11) NOT NULL,
  `practica_id` int(11) NOT NULL,
  `semana_id` int(11) NOT NULL,
  `estado` enum('Pendiente','Aprobado','Rechazado') NOT NULL DEFAULT 'Pendiente',
  `actividades` text NOT NULL,
  `horas_cumplidas` decimal(5,2) NOT NULL,
  `enviado_en` datetime DEFAULT NULL,
  `creado_por_usuario_id` int(11) DEFAULT NULL,
  `creado_en` datetime NOT NULL,
  `actualizado_en` datetime DEFAULT NULL,
  `firmado_tutor_empresarial` tinyint(4) NOT NULL DEFAULT 0,
  `firmado_empresarial_en` datetime DEFAULT NULL,
  `firmado_empresarial_por_usuario_id` int(11) DEFAULT NULL,
  `firmado_tutor_academico` tinyint(4) NOT NULL DEFAULT 0,
  `firmado_academico_en` datetime DEFAULT NULL,
  `firmado_academico_por_usuario_id` int(11) DEFAULT NULL,
  `fecha_revision` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_plan`
--

CREATE TABLE `categorias_plan` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `orden` int(11) NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `course`
--

CREATE TABLE `course` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(120) NOT NULL,
  `group` varchar(10) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `period_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `course`
--

INSERT INTO `course` (`id`, `code`, `name`, `group`, `createdAt`, `updatedAt`, `period_id`) VALUES
(1, '9877', 'ESTRUCTURA DE DATOS ', 'T01', '2026-04-22 20:16:08', '2026-04-22 20:16:08', 1),
(2, '9900', 'INTELIGENCIA ARTIFICIAL', 'T01', '2026-04-22 20:16:39', '2026-04-22 20:16:39', 1),
(4, '999', 'qqqq', 'T01', '2026-04-29 00:05:56', '2026-04-29 00:05:56', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `department`
--

CREATE TABLE `department` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `department`
--

INSERT INTO `department` (`id`, `name`, `is_active`, `createdAt`, `updatedAt`) VALUES
(1, 'ingeniería de sistemas  ', 1, '2026-04-22 04:13:36', '2026-04-22 04:13:36'),
(2, 'Psicología ', 1, '2026-04-28 23:57:09', '2026-04-28 23:57:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `director_programa_programa`
--

CREATE TABLE `director_programa_programa` (
  `id` int(11) NOT NULL,
  `director_usuario_id` int(11) NOT NULL,
  `programa_id` int(11) NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL
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
  `tipo_contrato` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa`
--

CREATE TABLE `empresa` (
  `nit` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `firmado_estudiante` tinyint(4) NOT NULL DEFAULT 0,
  `firmado_en` datetime DEFAULT NULL,
  `firmado_por_usuario_id` int(11) DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudiante`
--

CREATE TABLE `estudiante` (
  `cedula` int(11) NOT NULL,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `programa_id` int(11) DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evaluation`
--

CREATE TABLE `evaluation` (
  `id` int(11) NOT NULL,
  `score_students` decimal(3,1) DEFAULT NULL,
  `score_director` decimal(3,1) DEFAULT NULL,
  `score_self` decimal(3,1) DEFAULT NULL,
  `score_total` decimal(3,1) DEFAULT NULL,
  `director_notes` text DEFAULT NULL,
  `student_rep_comments` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `period_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `evaluation`
--

INSERT INTO `evaluation` (`id`, `score_students`, `score_director`, `score_self`, `score_total`, `director_notes`, `student_rep_comments`, `createdAt`, `updatedAt`, `teacher_id`, `period_id`, `created_by`, `course_id`) VALUES
(8, 4.5, 4.2, 4.0, 4.2, 'Excelente desempeÃ±o', 'Muy bueno | Puntual', '2026-04-23 21:32:06', '2026-04-23 23:52:46', 6, 1, 7, NULL),
(9, 2.0, 3.0, 4.2, 3.1, 'mediano desempeÃ±o', 'Muy bueno | inpuntual', '2026-04-23 21:32:16', '2026-04-23 23:52:33', 9, 1, 7, NULL),
(10, 4.5, 4.2, 4.0, 4.2, 'Excelente desempeÃ±o', 'Rep1: Muy bueno|Rep2: Puntual', '2026-04-24 22:00:02', '2026-04-24 22:00:02', 6, 2, 7, NULL),
(11, 4.6, 3.5, 4.1, 4.1, 'El docente presenta un desempeño integral altamente destacado, evidenciando dominio sólido de los contenidos, planificación estructurada y una ejecución pedagógica que favorece el aprendizaje significativo en los estudiantes.\r\nEl docente demuestra un alto nivel de compromiso institucional, cumpliendo de manera oportuna con sus responsabilidades y promoviendo un ambiente académico organizado, respetuoso y orientado a resultados.\r\nSe evidencia una práctica docente consistente, con metodologías claras, uso adecuado de recursos didácticos y una actitud proactiva hacia la mejora continua del proceso de enseñanza.\r\nEl docente mantiene una comunicación efectiva con los estudiantes, fomenta la participación activa en el aula y demuestra habilidades para adaptar sus estrategias según las necesidades del grupo.\r\nEl desempeño del docente es sobresaliente, integrando conocimientos, habilidades pedagógicas y valores institucionales que contribuyen al desarrollo académico de los estudiantes.\r\nSe destaca la capacidad del docente para planificar, ejecutar y evaluar procesos formativos de manera coherente, asegurando el cumplimiento de los objetivos académicos establecidos.\r\nEl docente evidencia liderazgo en el aula, promoviendo el pensamiento crítico, el respeto mutuo y un ambiente propicio para el aprendizaje colaborativo.\r\nSe observa responsabilidad, organización y claridad en la enseñanza, así como una disposición constante para apoyar a los estudiantes en su proceso formativo.\r\nEl docente aplica estrategias didácticas innovadoras, facilitando la comprensión de los contenidos y generando interés en los estudiantes por el aprendizaje.\r\nEl desempeño general del docente refleja compromiso, profesionalismo y una adecuada gestión del tiempo, lo cual impacta positivamente en los resultados académicos.\r\nEl docente demuestra habilidades pedagógicas sólidas, combinadas con una actitud empática y orientada al logro de los objetivos educativos.\r\nSe evidencia un adecuado manejo del aula, promoviendo disciplina, respeto y participación activa por parte de los estudiantes.\r\nEl docente cumple con los lineamientos institucionales, mostrando responsabilidad y compromiso con la calidad educativa.\r\nSe destaca la claridad en la exposición de los temas, así como la capacidad de generar espacios de aprendizaje significativos.\r\nEl docente muestra iniciativa en la implementación de mejoras continuas en su práctica pedagógica, adaptándose a las necesidades del entorno educativo.', 'Gran dominio | Responsable | Explica bien | Clases claras | Paciente | Resuelve dudas | Dinámico | Amable | Motivador | Interesante | Organizado | Buen ritmo | Comprensible | Atento | Didáctico | Buen trato | Inspira confianza | Buen profesor | Participativo | Creativo | Claro al explicar | Ayuda mucho | Buen contenido | Explica paso a paso | Clases útiles | Se hace entender | Buena actitud | Enseña con ejemplos | Comprensivo | Excelente docente', '2026-04-24 22:00:11', '2026-04-24 22:08:40', 9, 2, 7, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evidence`
--

CREATE TABLE `evidence` (
  `id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `verified_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `period_id` int(11) DEFAULT NULL,
  `task_assignment_id` int(11) DEFAULT NULL,
  `plan_action_id` int(11) DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `evidence`
--

INSERT INTO `evidence` (`id`, `file_name`, `file_path`, `file_type`, `file_size`, `verified`, `verified_at`, `createdAt`, `updatedAt`, `teacher_id`, `period_id`, `task_assignment_id`, `plan_action_id`, `verified_by`) VALUES
(1, 'Plan_Mejoramiento_mm (2).pdf', '/uploads/file-1776830972128-583847789.pdf', 'application/pdf', 111931, 0, NULL, '2026-04-22 04:09:32', '2026-04-22 04:09:32', 6, NULL, NULL, NULL, NULL),
(2, 'Plan_Mejoramiento_mm (3).pdf', '/uploads/file-1776888415006-540837273.pdf', 'application/pdf', 112158, 0, '2026-04-22 20:07:21', '2026-04-22 20:06:55', '2026-04-22 20:07:21', 9, NULL, NULL, NULL, 7),
(3, 'Darwin_roa_Actividad2.pdf', '/uploads/file-1776888465823-913336844.pdf', 'application/pdf', 331755, 1, '2026-04-22 20:08:12', '2026-04-22 20:07:45', '2026-04-22 20:08:12', 9, NULL, NULL, NULL, 7),
(4, 'urgencias.xml', '/uploads/file-1776889103276-631453354.xml', 'text/xml', 3766, 0, NULL, '2026-04-22 20:18:23', '2026-04-22 20:18:23', 9, NULL, NULL, NULL, NULL),
(5, 'Plan_Mejoramiento_Profesor_de_Prueba.pdf', '/uploads/file-1776898144561-109550664.pdf', 'application/pdf', 123951, 0, '2026-04-22 22:49:42', '2026-04-22 22:49:04', '2026-04-22 22:49:42', 6, NULL, NULL, NULL, 7),
(6, 'Santiago_Rojas_Actividad2.pdf', '/uploads/file-1776899919048-514195897.pdf', 'application/pdf', 193021, 1, '2026-04-23 18:57:22', '2026-04-22 23:18:39', '2026-04-23 18:57:22', 6, NULL, NULL, NULL, 7),
(7, 'Plan_Mejoramiento_Darwin_Ariel_Roa_Barreto (1).pdf', '/uploads/file-1776901098328-22979246.pdf', 'application/pdf', 125966, 0, NULL, '2026-04-22 23:38:18', '2026-04-22 23:38:18', 6, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fixed_task`
--

CREATE TABLE `fixed_task` (
  `id` int(11) NOT NULL,
  `management_area` varchar(80) DEFAULT NULL,
  `activity` text NOT NULL,
  `expected_product` text NOT NULL,
  `deadline_month` varchar(20) DEFAULT NULL,
  `scope` enum('global','por_curso','individual') DEFAULT 'global',
  `specific_teacher_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `period_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `fixed_task`
--

INSERT INTO `fixed_task` (`id`, `management_area`, `activity`, `expected_product`, `deadline_month`, `scope`, `specific_teacher_id`, `is_active`, `createdAt`, `updatedAt`, `created_by`, `period_id`) VALUES
(1, 'Docencia', 'Actualizar y entrega del Programa Analítico del Curso (PAC) ene le Aula (PDF), al Correo del director (Word), Sistema; de lo(s) cursos(s) asignado(s) .', 'Docuementos actualizados en formato institucional y debidamente cargado.', '2026-06-30', 'individual', 6, 1, '2026-04-22 23:00:24', '2026-04-23 22:57:35', 7, 1),
(2, 'Investigacion', 'Presentar un producto investigativo (artículo, capítulo de libro, producto tenologico,  ponencia o proyecto interdisciplinar).', 'Producto investigativo presentado, aceptado o con constancia de postulación.', '2026-04-24', 'individual', 6, 1, '2026-04-22 23:43:46', '2026-04-23 22:57:35', 7, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `improvement_plan`
--

CREATE TABLE `improvement_plan` (
  `id` int(11) NOT NULL,
  `status` enum('borrador','ai_generated','under_review','approved','rejected') DEFAULT 'borrador',
  `diagnosis_text` text DEFAULT NULL,
  `strengths` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`strengths`)),
  `improvement_opps` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`improvement_opps`)),
  `objectives` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`objectives`)),
  `ai_generated_at` datetime DEFAULT NULL,
  `ai_prompt_context` text DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `director_feedback` text DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `notified_teacher` tinyint(1) DEFAULT 0,
  `notified_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `period_id` int(11) DEFAULT NULL,
  `evaluation_id` int(11) DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `consolidated_comments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`consolidated_comments`)),
  `work_plan` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`work_plan`)),
  `history_analysis` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `improvement_plan`
--

INSERT INTO `improvement_plan` (`id`, `status`, `diagnosis_text`, `strengths`, `improvement_opps`, `objectives`, `ai_generated_at`, `ai_prompt_context`, `reviewed_at`, `director_feedback`, `approved_at`, `notified_teacher`, `notified_at`, `createdAt`, `updatedAt`, `deletedAt`, `teacher_id`, `period_id`, `evaluation_id`, `reviewed_by`, `consolidated_comments`, `work_plan`, `history_analysis`) VALUES
(45, 'approved', 'El presente Plan de Mejoramiento Profesoral se elabora a partir de los resultados de la Evaluación del Desempeño profesoral correspondiente al periodo académico 2026-1, los cuales se relacionan a continuación. Este proceso evaluativo contó con la participación de actores clave del ámbito académico, entre ellos estudiantes, profesores (autoevaluación) y líderes de procesos, así como con la verificación del cumplimiento de compromisos, evidencias e informes, lo que permitió una valoración integral de la práctica profesoral. Los resultados obtenidos constituyen el principal insumo para identificar fortalezas que deben mantenerse y oportunidades de mejora que orientan las acciones de fortalecimiento, con el propósito de contribuir al mejoramiento continuo de la calidad académica del programa.', '[\"Dominio sólido de los contenidos de la asignatura, facilitando la comprensión de los estudiantes.\",\"Alto sentido de responsabilidad y compromiso con sus labores docentes.\",\"Puntualidad en el cumplimiento de sus compromisos académicos y horarios de clase.\",\"Desempeño general muy satisfactorio, reflejado en las evaluaciones de los diferentes actores.\"]', '[\"Fomentar la innovación continua en las estrategias pedagógicas y didácticas para enriquecer la experiencia de aprendizaje de los estudiantes.\"]', '[\"Implementar nuevas metodologías y herramientas didácticas que promuevan un aprendizaje más interactivo y significativo.\"]', '2026-04-24 19:54:13', NULL, NULL, NULL, '2026-04-24 21:22:39', 0, NULL, '2026-04-24 19:54:13', '2026-04-24 21:22:39', NULL, 6, 1, 8, 7, '[\"Gran dominio de los temas impartidos.\",\"Demuestra responsabilidad en el cumplimiento de sus funciones.\",\"Presenta un desempeño muy bueno en general.\",\"Es puntual en el desarrollo de sus actividades académicas.\"]', NULL, NULL),
(46, 'borrador', 'El presente Plan de Mejoramiento Profesoral se elabora a partir de los resultados de la Evaluación del Desempeño profesoral correspondiente al periodo académico 2026-1, los cuales se relacionan a continuación. Este proceso evaluativo contó con la participación de actores clave del ámbito académico, entre ellos estudiantes, profesores (autoevaluación) y líderes de procesos, así como con la verificación del cumplimiento de compromisos, evidencias e informes, lo que permitió una valoración integral de la práctica profesoral. Los resultados obtenidos constituyen el principal insumo para identificar fortalezas que deben mantenerse y oportunidades de mejora que orientan las acciones de fortalecimiento, con el propósito de contribuir al mejoramiento continuo de la calidad académica del programa.', '[\"Desempeño general positivo en su labor docente.\",\"Compromiso con la autoevaluación y la mejora continua, reflejado en una alta calificación de autoevaluación y una valoración total favorable.\"]', '[\"Fortalecer el dominio disciplinar y pedagógico de los contenidos del curso.\",\"Mejorar la puntualidad y el cumplimiento de las responsabilidades académicas.\"]', '[\"Consolidar el dominio temático y la didáctica para la efectiva transmisión del conocimiento en el aula.\",\"Asegurar la puntualidad y la responsabilidad en todas las actividades y compromisos académicos.\"]', '2026-04-24 19:54:51', NULL, NULL, NULL, NULL, 0, NULL, '2026-04-24 19:54:51', '2026-04-24 19:54:51', NULL, 9, 1, 9, 7, '[\"Medio dominio de los contenidos\",\"Irresponsabilidad\",\"Muy bueno\",\"Inpuntualidad\"]', NULL, NULL),
(52, 'approved', 'El presente Plan de Mejoramiento Profesoral se elabora a partir de los resultados de la Evaluación del Desempeño profesoral correspondiente al periodo académico 2025-2, los cuales se relacionan a continuación. Este proceso evaluativo contó con la participación de actores clave del ámbito académico, entre ellos estudiantes, profesores (autoevaluación) y líderes de procesos, así como con la verificación del cumplimiento de compromisos, evidencias e informes, lo que permitió una valoración integral de la práctica profesoral. Los resultados obtenidos constituyen el principal insumo para identificar fortalezas que deben mantenerse y oportunidades de mejora que orientan las acciones de fortalecimiento, con el propósito de contribuir al mejoramiento continuo de la calidad académica del programa.', '[\"Demuestra una excelente organización y puntualidad en el desarrollo de sus actividades académicas.\",\"Posee una gran capacidad didáctica, explicando claramente los contenidos y utilizando ejemplos pertinentes, lo que facilita el aprendizaje.\",\"Mantiene una actitud profesional, comprometida y respetuosa, con buena comunicación y trato hacia los estudiantes.\",\"Es responsable, metódico y flexible, cumpliendo los objetivos del curso y manejando eficientemente el tiempo.\"]', '[\"Optimizar la gestión del tiempo para asegurar la puntualidad en todas las actividades académicas.\",\"Fortalecer las estrategias pedagógicas para garantizar la claridad y profundidad en la explicación de los contenidos.\",\"Fomentar una mayor interacción y escucha activa con los estudiantes para atender sus inquietudes y necesidades.\",\"Desarrollar un ambiente de clase más cercano y participativo, equilibrando la seriedad con la apertura.\"]', '[\"Garantizar la puntualidad en el inicio y desarrollo de todas las sesiones y actividades académicas.\",\"Mejorar la claridad y efectividad de las explicaciones de los contenidos del curso.\",\"Incrementar la participación estudiantil y la atención a sus necesidades e inquietudes.\",\"Crear un ambiente de aprendizaje que combine el rigor académico con la cercanía y apertura.\"]', '2026-04-28 22:20:53', NULL, NULL, NULL, '2026-04-28 22:20:53', 0, NULL, '2026-04-28 22:20:53', '2026-04-28 22:20:53', NULL, 10, 2, NULL, 7, '[\"Los estudiantes y directores destacan la organización, puntualidad, claridad en la explicación y evaluación, responsabilidad, didáctica, accesibilidad, buen trato, cumplimiento de objetivos, metodología, profesionalismo, compromiso, orden, dinamismo, uso de ejemplos, capacidad motivadora, buena comunicación, respeto y flexibilidad del profesor. Sin embargo, se mencionan aspectos a mejorar como la impuntualidad, la necesidad de mejorar la claridad en algunas explicaciones y una mayor escucha a los estudiantes, así como la percepción de \'seriedad\'.\"]', '[]', 'No se cuenta con historial previo para análisis comparativo.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `management_area`
--

CREATE TABLE `management_area` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `management_area`
--

INSERT INTO `management_area` (`id`, `name`, `is_active`, `createdAt`, `updatedAt`) VALUES
(1, 'Docencia', 1, '2026-04-22 22:55:07', '2026-04-22 22:55:07'),
(2, 'Investigacion', 1, '2026-04-22 22:55:17', '2026-04-22 22:55:17'),
(3, 'Extensión', 1, '2026-04-28 23:56:43', '2026-04-28 23:56:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_resets_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2026_05_14_000000_create_permissions_table', 2),
(6, '2026_05_14_000001_create_self_evaluations_table', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `period`
--

CREATE TABLE `period` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `period`
--

INSERT INTO `period` (`id`, `name`, `start_date`, `end_date`, `is_active`, `createdAt`, `updatedAt`, `created_by`) VALUES
(1, '2026-1', '2026-01-01', '2026-06-30', 1, '2026-04-22 03:10:07', '2026-04-28 22:26:06', NULL),
(2, '2025-2', '2025-07-31', '2025-12-31', 0, '2026-04-22 20:23:39', '2026-04-28 22:26:06', 8),
(3, '2026-2', '2026-08-03', '2026-11-30', 0, '2026-04-28 23:55:05', '2026-04-28 23:55:05', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodo`
--

CREATE TABLE `periodo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planes_trabajo_docente`
--

CREATE TABLE `planes_trabajo_docente` (
  `id` int(11) NOT NULL,
  `docente_id` int(11) NOT NULL,
  `periodo_id` int(11) NOT NULL,
  `estado` enum('Borrador','Revisión','Aprobado','Rechazado') NOT NULL DEFAULT 'Borrador',
  `creado_por_usuario_id` int(11) NOT NULL,
  `observaciones_director` text DEFAULT NULL,
  `creado_en` datetime NOT NULL,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_action`
--

CREATE TABLE `plan_action` (
  `id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `order_num` int(11) DEFAULT NULL,
  `aspect` text NOT NULL,
  `concrete_action` text NOT NULL,
  `verifiable_product` text NOT NULL,
  `expected_goal` text DEFAULT NULL,
  `deadline` varchar(30) DEFAULT NULL,
  `status` enum('pending','in_progress','completed','verified','rejected') DEFAULT 'pending',
  `course_id` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `plan_action`
--

INSERT INTO `plan_action` (`id`, `plan_id`, `order_num`, `aspect`, `concrete_action`, `verifiable_product`, `expected_goal`, `deadline`, `status`, `course_id`, `createdAt`, `updatedAt`) VALUES
(93, 45, 1, 'Fomentar la innovación continua en las estrategias pedagógicas y didácticas para enriquecer la experiencia de aprendizaje de los estudiantes.', 'Investigar y aplicar al menos una nueva estrategia pedagógica o herramienta tecnológica en el desarrollo de las clases del próximo periodo académico.', 'Informe breve que describa la estrategia o herramienta implementada, su impacto observado y evidencias de su aplicación (ej. plan de clase modificado, material didáctico innovador, encuestas a estudiantes).', 'Mejorar la participación y el engagement de los estudiantes, así como la efectividad del proceso de enseñanza-aprendizaje a través de la innovación.', '2026-06-30', 'pending', NULL, '2026-04-24 19:54:13', '2026-04-24 19:54:13'),
(94, 46, 1, 'Fortalecer el dominio disciplinar y pedagógico de los contenidos del curso.', 'Participar activamente en programas de formación y actualización disciplinar, y revisar y ajustar la planificación de las sesiones de clase para asegurar la profundidad y claridad en la exposición de los temas.', 'Certificados de asistencia a cursos o talleres de actualización, y planeaciones de clase revisadas que evidencien la incorporación de estrategias para el fortalecimiento del dominio temático.', 'Lograr una enseñanza más efectiva y un mayor nivel de comprensión por parte de los estudiantes, mejorando la percepción sobre el dominio del profesor.', '2026-06-30', 'pending', NULL, '2026-04-24 19:54:51', '2026-04-24 19:54:51'),
(95, 46, 2, 'Mejorar la puntualidad y el cumplimiento de las responsabilidades académicas.', 'Implementar un sistema de gestión de tiempo personal y establecer recordatorios para garantizar la llegada puntual a todas las actividades académicas y la entrega oportuna de documentos y calificaciones.', 'Registro de asistencia y puntualidad sin incidencias, y cumplimiento del 100% de las fechas límite para la entrega de informes y calificaciones.', 'Fomentar un ambiente de respeto y eficiencia, y asegurar el cumplimiento de los compromisos institucionales y académicos.', '2026-06-30', 'pending', NULL, '2026-04-24 19:54:51', '2026-04-24 19:54:51'),
(106, 52, 1, 'Optimizar la gestión del tiempo para asegurar la puntualidad en todas las actividades académicas.', 'Establecer y adherirse estrictamente a un horario de inicio y finalización de clases, así como de entrega de actividades.', 'Registro de asistencia y puntualidad en las sesiones de clase y cumplimiento de cronogramas.', 'Reducir a cero los incidentes de impuntualidad en las sesiones y actividades programadas.', '2025-11-30', 'pending', NULL, '2026-04-28 22:20:53', '2026-04-28 22:20:53'),
(107, 52, 2, 'Fortalecer las estrategias pedagógicas para garantizar la claridad y profundidad en la explicación de los contenidos.', 'Incorporar diversas metodologías de enseñanza, como el uso de recursos audiovisuales y ejemplos prácticos, y solicitar retroalimentación periódica sobre la claridad de las explicaciones.', 'Planificación de clases que evidencie la diversificación de estrategias didácticas y encuestas de satisfacción estudiantil.', 'Incrementar la comprensión de los estudiantes sobre los temas complejos del curso.', '2025-11-30', 'pending', NULL, '2026-04-28 22:20:53', '2026-04-28 22:20:53'),
(108, 52, 3, 'Fomentar una mayor interacción y escucha activa con los estudiantes para atender sus inquietudes y necesidades.', 'Destinar espacios específicos en cada sesión para preguntas y debates, y establecer canales de comunicación abiertos para consultas.', 'Registro de participación en clase y evidencias de atención a consultas estudiantiles (ej. correos, foros).', 'Mejorar la percepción de los estudiantes sobre la atención a sus inquietudes y necesidades académicas.', '2025-11-30', 'pending', NULL, '2026-04-28 22:20:53', '2026-04-28 22:20:53'),
(109, 52, 4, 'Desarrollar un ambiente de clase más cercano y participativo, equilibrando la seriedad con la apertura.', 'Integrar actividades colaborativas y dinámicas que promuevan la participación activa y un ambiente de confianza, manteniendo el rigor académico.', 'Diseño de actividades de clase que incluyan dinámicas participativas y observación de aula.', 'Fomentar un ambiente de aprendizaje más interactivo y menos formal sin comprometer la calidad académica.', '2025-11-30', 'pending', NULL, '2026-04-28 22:20:53', '2026-04-28 22:20:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_detalle`
--

CREATE TABLE `plan_detalle` (
  `id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `actividad_id` int(11) NOT NULL,
  `meta_valor` varchar(255) DEFAULT NULL,
  `meta_descripcion` text DEFAULT NULL,
  `ponderacion` decimal(5,2) DEFAULT NULL,
  `requiere_evidencia` tinyint(4) NOT NULL DEFAULT 0,
  `creado_en` datetime NOT NULL,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `practica`
--

CREATE TABLE `practica` (
  `id` int(11) NOT NULL,
  `cedula_estudiante` int(11) NOT NULL,
  `nit_empresa` varchar(255) NOT NULL,
  `cedula_tutor_academico` int(11) NOT NULL,
  `cedula_tutor_empresarial` int(11) NOT NULL,
  `periodo_id` int(11) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('Activa','Finalizada','Cancelada') NOT NULL DEFAULT 'Activa',
  `activo` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programa`
--

CREATE TABLE `programa` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recognition`
--

CREATE TABLE `recognition` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `ai_generated` tinyint(1) DEFAULT 1,
  `published` tinyint(1) DEFAULT 0,
  `published_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `period_id` int(11) DEFAULT NULL,
  `plan_id` int(11) DEFAULT NULL,
  `published_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_name` varchar(255) NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimiento_historial`
--

CREATE TABLE `seguimiento_historial` (
  `id` bigint(20) NOT NULL,
  `seguimiento_id` int(11) NOT NULL,
  `valor_avance` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `evidencia_url` varchar(255) DEFAULT NULL,
  `evidencia_nombre` varchar(255) DEFAULT NULL,
  `estado` enum('Pendiente','En Revisión','Aprobado','Rechazado') NOT NULL DEFAULT 'Pendiente',
  `cambiado_por_usuario_id` int(11) NOT NULL,
  `cambiado_en` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimiento_plan`
--

CREATE TABLE `seguimiento_plan` (
  `id` int(11) NOT NULL,
  `plan_detalle_id` int(11) NOT NULL,
  `valor_avance` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `evidencia_url` varchar(255) DEFAULT NULL,
  `evidencia_nombre` varchar(255) DEFAULT NULL,
  `estado` enum('Pendiente','En Revisión','Aprobado','Rechazado') NOT NULL DEFAULT 'Pendiente',
  `actualizado_por_usuario_id` int(11) NOT NULL,
  `fecha_actualizacion` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `self_evaluations`
--

CREATE TABLE `self_evaluations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `period_id` int(11) DEFAULT NULL,
  `reflection` text NOT NULL,
  `rating` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `semana_practica`
--

CREATE TABLE `semana_practica` (
  `id` int(11) NOT NULL,
  `practica_id` int(11) NOT NULL,
  `numero_semana` varchar(255) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `student_comment`
--

CREATE TABLE `student_comment` (
  `id` int(11) NOT NULL,
  `comment_text` text NOT NULL,
  `sentiment` enum('positive','negative','neutral') DEFAULT NULL,
  `source` enum('student','representative') DEFAULT 'student',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `evaluation_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `student_comment`
--

INSERT INTO `student_comment` (`id`, `comment_text`, `sentiment`, `source`, `createdAt`, `updatedAt`, `evaluation_id`, `course_id`) VALUES
(101, 'medio dominio', 'negative', 'student', '2026-04-23 23:52:37', '2026-04-23 23:52:37', 9, NULL),
(102, 'irresponsable', 'negative', 'student', '2026-04-23 23:52:37', '2026-04-23 23:52:37', 9, NULL),
(103, 'Muy bueno', 'positive', 'representative', '2026-04-23 23:52:39', '2026-04-23 23:52:39', 9, NULL),
(104, 'inpuntual', 'negative', 'representative', '2026-04-23 23:52:39', '2026-04-23 23:52:39', 9, NULL),
(105, 'Gran dominio', 'positive', 'student', '2026-04-23 23:52:49', '2026-04-23 23:52:49', 8, NULL),
(106, 'Responsable', 'positive', 'student', '2026-04-23 23:52:49', '2026-04-23 23:52:49', 8, NULL),
(107, 'Muy bueno', 'positive', 'representative', '2026-04-23 23:52:51', '2026-04-23 23:52:51', 8, NULL),
(108, 'Puntual', 'positive', 'representative', '2026-04-23 23:52:51', '2026-04-23 23:52:51', 8, NULL),
(109, 'Est1: Gran dominio', 'neutral', 'student', '2026-04-24 22:00:05', '2026-04-24 22:00:05', 10, NULL),
(110, 'Est2: Responsable', 'neutral', 'student', '2026-04-24 22:00:05', '2026-04-24 22:00:05', 10, NULL),
(111, 'Rep1: Muy bueno', 'neutral', 'representative', '2026-04-24 22:00:09', '2026-04-24 22:00:09', 10, NULL),
(112, 'Rep2: Puntual', 'neutral', 'representative', '2026-04-24 22:00:09', '2026-04-24 22:00:09', 10, NULL),
(173, 'Falta de organización', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(174, 'Impuntual', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(175, 'Explicación poco clara', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(176, 'Baja responsabilidad', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(177, 'Mala gestión del tiempo', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(178, 'Poco didáctico', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(179, 'Poco accesible', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(180, 'Trato inadecuado', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(181, 'No cumple objetivos', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(182, 'Evaluación poco clara', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(183, 'Desordenado', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(184, 'Poco profesional', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(185, 'Bajo compromiso', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(186, 'Falta de planificación', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(187, 'Clases monótonas', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(188, 'Escasos ejemplos', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(189, 'Desmotiva al grupo', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(190, 'Comunicación deficiente', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(191, 'Falta de respeto', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(192, 'Inflexible', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(193, 'No escucha sugerencias', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(194, 'Poco innovador', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(195, 'No usa recursos', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(196, 'Poca empatía', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(197, 'Orientación insuficiente', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(198, 'Débil liderazgo', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(199, 'Mala planificación', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(200, 'Injusto en evaluaciones', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(201, 'Poco colaborativo', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(202, 'Actitud pasiva', 'negative', 'student', '2026-04-24 22:08:46', '2026-04-24 22:08:46', 11, NULL),
(203, 'Gran dominio', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(204, 'Responsable', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(205, 'Explica bien', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(206, 'Clases claras', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(207, 'Paciente', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(208, 'Resuelve dudas', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(209, 'Dinámico', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(210, 'Amable', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(211, 'Motivador', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(212, 'Interesante', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(213, 'Organizado', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(214, 'Buen ritmo', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(215, 'Comprensible', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(216, 'Atento', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(217, 'Didáctico', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(218, 'Buen trato', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(219, 'Inspira confianza', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(220, 'Buen profesor', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(221, 'Participativo', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(222, 'Creativo', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(223, 'Claro al explicar', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(224, 'Ayuda mucho', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(225, 'Buen contenido', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(226, 'Explica paso a paso', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(227, 'Clases útiles', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(228, 'Se hace entender', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(229, 'Buena actitud', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(230, 'Enseña con ejemplos', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(231, 'Comprensivo', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL),
(232, 'Excelente docente', 'positive', 'representative', '2026-04-24 22:08:50', '2026-04-24 22:08:50', 11, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `task_assignment`
--

CREATE TABLE `task_assignment` (
  `id` int(11) NOT NULL,
  `status` enum('pending','in_progress','completed','verified','rejected') DEFAULT 'pending',
  `completed_at` datetime DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `fixed_task_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `period_id` int(11) DEFAULT NULL,
  `custom_deadline` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `task_assignment`
--

INSERT INTO `task_assignment` (`id`, `status`, `completed_at`, `course_id`, `createdAt`, `updatedAt`, `fixed_task_id`, `teacher_id`, `period_id`, `custom_deadline`) VALUES
(11, 'pending', NULL, NULL, '2026-04-24 01:47:31', '2026-04-24 01:47:31', 1, 6, 1, NULL),
(12, 'pending', NULL, NULL, '2026-04-24 01:47:31', '2026-04-24 01:47:31', 2, 6, 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `teacher_course`
--

CREATE TABLE `teacher_course` (
  `id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `period_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `teacher_course`
--

INSERT INTO `teacher_course` (`id`, `createdAt`, `updatedAt`, `teacher_id`, `course_id`, `period_id`) VALUES
(1, '2026-04-22 20:16:16', '2026-04-22 20:16:16', 6, 1, 1),
(2, '2026-04-22 20:17:27', '2026-04-22 20:17:27', 6, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tutor_academico`
--

CREATE TABLE `tutor_academico` (
  `cedula` int(11) NOT NULL,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tutor_empresarial`
--

CREATE TABLE `tutor_empresarial` (
  `cedula` int(11) NOT NULL,
  `nit` varchar(255) NOT NULL,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','director','profesor') NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `password`, `role`, `department`, `is_active`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
(6, 'Profesor de Prueba', 'profesor6@usb.edu.co', '$2b$10$eCNm2GxN6MQEF/QbhCo/R.EQ6h8RPOlE/6nmYZTJIyfJeZQ6FVdue', 'profesor', 'ingeniería de sistemas', 1, '2026-04-22 03:10:07', '2026-04-23 22:48:48', NULL),
(7, 'Director Johel', 'director@usb.edu.co', '$2b$10$eCNm2GxN6MQEF/QbhCo/R.EQ6h8RPOlE/6nmYZTJIyfJeZQ6FVdue', 'director', 'ingeniería de sistemas', 1, '2026-04-22 03:10:07', '2026-04-23 22:48:48', NULL),
(8, 'Super Admin', 'admin@usb.edu.co', '$2b$10$eCNm2GxN6MQEF/QbhCo/R.EQ6h8RPOlE/6nmYZTJIyfJeZQ6FVdue', 'admin', 'Rectoría', 1, '2026-04-22 03:10:07', '2026-04-22 03:10:07', NULL),
(9, 'Darwin Ariel Roa Barreto', 'd_roa2@unisimon.edu.co', '$2b$10$FMvocqWMurS.FS69FoIC0eGd49Wem46Ld22cONKFcZ88oX5uFVMia', 'profesor', 'ingeniería de sistemas', 1, '2026-04-22 04:14:26', '2026-04-23 22:48:48', NULL),
(10, 'Maria Garcia ', 'profesar6@usb.edu.co', '$2b$10$sNJ1Ut9jFsnzFHBJdqRIpuu0NIs9AgVPbs6i89K4whHNPC1JXdSpm', 'profesor', 'ingeniería de sistemas', 1, '2026-04-28 22:08:59', '2026-04-28 22:19:20', NULL),
(11, 'Johel Enrique Rodriguez', 'director1@usb.edu.co', '$2b$10$v2orXO0snJtB7V0nwd2/7uvEVmPtB4SnXdRfqbBWiJkPwTPWqT/9S', 'director', 'ingeniería de sistemas', 1, '2026-04-29 00:07:48', '2026-05-09 13:43:25', NULL),
(12, 'Ana Gomez', 'ana0.689154948708484@test.com', '$2y$10$JkoARSnQQmqAf48TJ5TnxuXsyK4fxNK3LEXnNQM/ZYAJWmlrRxbNW', 'profesor', 'Matemáticas', 1, '2026-05-14 23:36:44', '2026-05-14 23:36:44', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_has_permissions`
--

CREATE TABLE `user_has_permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `cedula` int(11) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('Admin','Director','Profesor','Estudiante') NOT NULL DEFAULT 'Estudiante',
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actividades_plan`
--
ALTER TABLE `actividades_plan`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `asistencia_registro`
--
ALTER TABLE `asistencia_registro`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `categorias_plan`
--
ALTER TABLE `categorias_plan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `nombre_2` (`nombre`),
  ADD UNIQUE KEY `nombre_3` (`nombre`),
  ADD UNIQUE KEY `nombre_4` (`nombre`),
  ADD UNIQUE KEY `nombre_5` (`nombre`),
  ADD UNIQUE KEY `nombre_6` (`nombre`),
  ADD UNIQUE KEY `nombre_7` (`nombre`),
  ADD UNIQUE KEY `nombre_8` (`nombre`),
  ADD UNIQUE KEY `nombre_9` (`nombre`),
  ADD UNIQUE KEY `nombre_10` (`nombre`),
  ADD UNIQUE KEY `nombre_11` (`nombre`),
  ADD UNIQUE KEY `nombre_12` (`nombre`),
  ADD UNIQUE KEY `nombre_13` (`nombre`),
  ADD UNIQUE KEY `nombre_14` (`nombre`),
  ADD UNIQUE KEY `nombre_15` (`nombre`),
  ADD UNIQUE KEY `nombre_16` (`nombre`),
  ADD UNIQUE KEY `nombre_17` (`nombre`),
  ADD UNIQUE KEY `nombre_18` (`nombre`),
  ADD UNIQUE KEY `nombre_19` (`nombre`),
  ADD UNIQUE KEY `nombre_20` (`nombre`),
  ADD UNIQUE KEY `nombre_21` (`nombre`),
  ADD UNIQUE KEY `nombre_22` (`nombre`),
  ADD UNIQUE KEY `nombre_23` (`nombre`),
  ADD UNIQUE KEY `nombre_24` (`nombre`),
  ADD UNIQUE KEY `nombre_25` (`nombre`),
  ADD UNIQUE KEY `nombre_26` (`nombre`),
  ADD UNIQUE KEY `nombre_27` (`nombre`),
  ADD UNIQUE KEY `nombre_28` (`nombre`),
  ADD UNIQUE KEY `nombre_29` (`nombre`),
  ADD UNIQUE KEY `nombre_30` (`nombre`),
  ADD UNIQUE KEY `nombre_31` (`nombre`),
  ADD UNIQUE KEY `nombre_32` (`nombre`),
  ADD UNIQUE KEY `nombre_33` (`nombre`),
  ADD UNIQUE KEY `nombre_34` (`nombre`),
  ADD UNIQUE KEY `nombre_35` (`nombre`),
  ADD UNIQUE KEY `nombre_36` (`nombre`),
  ADD UNIQUE KEY `nombre_37` (`nombre`),
  ADD UNIQUE KEY `nombre_38` (`nombre`),
  ADD UNIQUE KEY `nombre_39` (`nombre`),
  ADD UNIQUE KEY `nombre_40` (`nombre`),
  ADD UNIQUE KEY `nombre_41` (`nombre`),
  ADD UNIQUE KEY `nombre_42` (`nombre`),
  ADD UNIQUE KEY `nombre_43` (`nombre`),
  ADD UNIQUE KEY `nombre_44` (`nombre`),
  ADD UNIQUE KEY `nombre_45` (`nombre`),
  ADD UNIQUE KEY `nombre_46` (`nombre`),
  ADD UNIQUE KEY `nombre_47` (`nombre`),
  ADD UNIQUE KEY `nombre_48` (`nombre`),
  ADD UNIQUE KEY `nombre_49` (`nombre`),
  ADD UNIQUE KEY `nombre_50` (`nombre`),
  ADD UNIQUE KEY `nombre_51` (`nombre`),
  ADD UNIQUE KEY `nombre_52` (`nombre`),
  ADD UNIQUE KEY `nombre_53` (`nombre`),
  ADD UNIQUE KEY `nombre_54` (`nombre`),
  ADD UNIQUE KEY `nombre_55` (`nombre`),
  ADD UNIQUE KEY `nombre_56` (`nombre`),
  ADD UNIQUE KEY `nombre_57` (`nombre`),
  ADD UNIQUE KEY `nombre_58` (`nombre`);

--
-- Indices de la tabla `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`id`),
  ADD KEY `period_id` (`period_id`);

--
-- Indices de la tabla `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `name_24` (`name`),
  ADD UNIQUE KEY `name_25` (`name`),
  ADD UNIQUE KEY `name_26` (`name`),
  ADD UNIQUE KEY `name_27` (`name`),
  ADD UNIQUE KEY `name_28` (`name`),
  ADD UNIQUE KEY `name_29` (`name`),
  ADD UNIQUE KEY `name_30` (`name`),
  ADD UNIQUE KEY `name_31` (`name`),
  ADD UNIQUE KEY `name_32` (`name`),
  ADD UNIQUE KEY `name_33` (`name`),
  ADD UNIQUE KEY `name_34` (`name`),
  ADD UNIQUE KEY `name_35` (`name`),
  ADD UNIQUE KEY `name_36` (`name`),
  ADD UNIQUE KEY `name_37` (`name`),
  ADD UNIQUE KEY `name_38` (`name`),
  ADD UNIQUE KEY `name_39` (`name`),
  ADD UNIQUE KEY `name_40` (`name`),
  ADD UNIQUE KEY `name_41` (`name`),
  ADD UNIQUE KEY `name_42` (`name`),
  ADD UNIQUE KEY `name_43` (`name`),
  ADD UNIQUE KEY `name_44` (`name`),
  ADD UNIQUE KEY `name_45` (`name`),
  ADD UNIQUE KEY `name_46` (`name`),
  ADD UNIQUE KEY `name_47` (`name`),
  ADD UNIQUE KEY `name_48` (`name`),
  ADD UNIQUE KEY `name_49` (`name`),
  ADD UNIQUE KEY `name_50` (`name`),
  ADD UNIQUE KEY `name_51` (`name`),
  ADD UNIQUE KEY `name_52` (`name`),
  ADD UNIQUE KEY `name_53` (`name`),
  ADD UNIQUE KEY `name_54` (`name`),
  ADD UNIQUE KEY `name_55` (`name`),
  ADD UNIQUE KEY `name_56` (`name`),
  ADD UNIQUE KEY `name_57` (`name`),
  ADD UNIQUE KEY `name_58` (`name`);

--
-- Indices de la tabla `director_programa_programa`
--
ALTER TABLE `director_programa_programa`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `docente`
--
ALTER TABLE `docente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_2` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_3` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_4` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_5` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_6` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_7` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_8` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_9` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_10` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_11` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_12` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_13` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_14` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_15` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_16` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_17` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_18` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_19` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_20` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_21` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_22` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_23` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_24` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_25` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_26` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_27` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_28` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_29` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_30` (`usuario_id`),
  ADD UNIQUE KEY `usuario_id_31` (`usuario_id`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `cedula_2` (`cedula`),
  ADD UNIQUE KEY `cedula_3` (`cedula`),
  ADD UNIQUE KEY `cedula_4` (`cedula`),
  ADD UNIQUE KEY `cedula_5` (`cedula`),
  ADD UNIQUE KEY `cedula_6` (`cedula`),
  ADD UNIQUE KEY `cedula_7` (`cedula`),
  ADD UNIQUE KEY `cedula_8` (`cedula`),
  ADD UNIQUE KEY `cedula_9` (`cedula`),
  ADD UNIQUE KEY `cedula_10` (`cedula`),
  ADD UNIQUE KEY `cedula_11` (`cedula`),
  ADD UNIQUE KEY `cedula_12` (`cedula`),
  ADD UNIQUE KEY `cedula_13` (`cedula`),
  ADD UNIQUE KEY `cedula_14` (`cedula`),
  ADD UNIQUE KEY `cedula_15` (`cedula`),
  ADD UNIQUE KEY `cedula_16` (`cedula`),
  ADD UNIQUE KEY `cedula_17` (`cedula`),
  ADD UNIQUE KEY `cedula_18` (`cedula`),
  ADD UNIQUE KEY `cedula_19` (`cedula`),
  ADD UNIQUE KEY `cedula_20` (`cedula`),
  ADD UNIQUE KEY `cedula_21` (`cedula`),
  ADD UNIQUE KEY `cedula_22` (`cedula`),
  ADD UNIQUE KEY `cedula_23` (`cedula`),
  ADD UNIQUE KEY `cedula_24` (`cedula`),
  ADD UNIQUE KEY `cedula_25` (`cedula`),
  ADD UNIQUE KEY `cedula_26` (`cedula`),
  ADD UNIQUE KEY `cedula_27` (`cedula`),
  ADD UNIQUE KEY `cedula_28` (`cedula`),
  ADD UNIQUE KEY `cedula_29` (`cedula`),
  ADD UNIQUE KEY `cedula_30` (`cedula`),
  ADD UNIQUE KEY `cedula_31` (`cedula`),
  ADD KEY `programa_id` (`programa_id`);

--
-- Indices de la tabla `empresa`
--
ALTER TABLE `empresa`
  ADD PRIMARY KEY (`nit`);

--
-- Indices de la tabla `encuentro`
--
ALTER TABLE `encuentro`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estudiante`
--
ALTER TABLE `estudiante`
  ADD PRIMARY KEY (`cedula`),
  ADD KEY `programa_id` (`programa_id`);

--
-- Indices de la tabla `evaluation`
--
ALTER TABLE `evaluation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `period_id` (`period_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indices de la tabla `evidence`
--
ALTER TABLE `evidence`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `period_id` (`period_id`),
  ADD KEY `task_assignment_id` (`task_assignment_id`),
  ADD KEY `plan_action_id` (`plan_action_id`),
  ADD KEY `verified_by` (`verified_by`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indices de la tabla `fixed_task`
--
ALTER TABLE `fixed_task`
  ADD PRIMARY KEY (`id`),
  ADD KEY `specific_teacher_id` (`specific_teacher_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indices de la tabla `improvement_plan`
--
ALTER TABLE `improvement_plan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `period_id` (`period_id`),
  ADD KEY `evaluation_id` (`evaluation_id`),
  ADD KEY `reviewed_by` (`reviewed_by`);

--
-- Indices de la tabla `management_area`
--
ALTER TABLE `management_area`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `name_24` (`name`),
  ADD UNIQUE KEY `name_25` (`name`),
  ADD UNIQUE KEY `name_26` (`name`),
  ADD UNIQUE KEY `name_27` (`name`),
  ADD UNIQUE KEY `name_28` (`name`),
  ADD UNIQUE KEY `name_29` (`name`),
  ADD UNIQUE KEY `name_30` (`name`),
  ADD UNIQUE KEY `name_31` (`name`),
  ADD UNIQUE KEY `name_32` (`name`),
  ADD UNIQUE KEY `name_33` (`name`),
  ADD UNIQUE KEY `name_34` (`name`),
  ADD UNIQUE KEY `name_35` (`name`),
  ADD UNIQUE KEY `name_36` (`name`),
  ADD UNIQUE KEY `name_37` (`name`),
  ADD UNIQUE KEY `name_38` (`name`),
  ADD UNIQUE KEY `name_39` (`name`),
  ADD UNIQUE KEY `name_40` (`name`),
  ADD UNIQUE KEY `name_41` (`name`),
  ADD UNIQUE KEY `name_42` (`name`),
  ADD UNIQUE KEY `name_43` (`name`),
  ADD UNIQUE KEY `name_44` (`name`),
  ADD UNIQUE KEY `name_45` (`name`),
  ADD UNIQUE KEY `name_46` (`name`),
  ADD UNIQUE KEY `name_47` (`name`),
  ADD UNIQUE KEY `name_48` (`name`),
  ADD UNIQUE KEY `name_49` (`name`),
  ADD UNIQUE KEY `name_50` (`name`),
  ADD UNIQUE KEY `name_51` (`name`),
  ADD UNIQUE KEY `name_52` (`name`),
  ADD UNIQUE KEY `name_53` (`name`),
  ADD UNIQUE KEY `name_54` (`name`),
  ADD UNIQUE KEY `name_55` (`name`),
  ADD UNIQUE KEY `name_56` (`name`),
  ADD UNIQUE KEY `name_57` (`name`),
  ADD UNIQUE KEY `name_58` (`name`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `period`
--
ALTER TABLE `period`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `name_24` (`name`),
  ADD UNIQUE KEY `name_25` (`name`),
  ADD UNIQUE KEY `name_26` (`name`),
  ADD UNIQUE KEY `name_27` (`name`),
  ADD UNIQUE KEY `name_28` (`name`),
  ADD UNIQUE KEY `name_29` (`name`),
  ADD UNIQUE KEY `name_30` (`name`),
  ADD UNIQUE KEY `name_31` (`name`),
  ADD UNIQUE KEY `name_32` (`name`),
  ADD UNIQUE KEY `name_33` (`name`),
  ADD UNIQUE KEY `name_34` (`name`),
  ADD UNIQUE KEY `name_35` (`name`),
  ADD UNIQUE KEY `name_36` (`name`),
  ADD UNIQUE KEY `name_37` (`name`),
  ADD UNIQUE KEY `name_38` (`name`),
  ADD UNIQUE KEY `name_39` (`name`),
  ADD UNIQUE KEY `name_40` (`name`),
  ADD UNIQUE KEY `name_41` (`name`),
  ADD UNIQUE KEY `name_42` (`name`),
  ADD UNIQUE KEY `name_43` (`name`),
  ADD UNIQUE KEY `name_44` (`name`),
  ADD UNIQUE KEY `name_45` (`name`),
  ADD UNIQUE KEY `name_46` (`name`),
  ADD UNIQUE KEY `name_47` (`name`),
  ADD UNIQUE KEY `name_48` (`name`),
  ADD UNIQUE KEY `name_49` (`name`),
  ADD UNIQUE KEY `name_50` (`name`),
  ADD UNIQUE KEY `name_51` (`name`),
  ADD UNIQUE KEY `name_52` (`name`),
  ADD UNIQUE KEY `name_53` (`name`),
  ADD UNIQUE KEY `name_54` (`name`),
  ADD UNIQUE KEY `name_55` (`name`),
  ADD UNIQUE KEY `name_56` (`name`),
  ADD UNIQUE KEY `name_57` (`name`),
  ADD UNIQUE KEY `name_58` (`name`),
  ADD UNIQUE KEY `name_59` (`name`),
  ADD UNIQUE KEY `name_60` (`name`),
  ADD UNIQUE KEY `name_61` (`name`),
  ADD UNIQUE KEY `name_62` (`name`),
  ADD KEY `created_by` (`created_by`);

--
-- Indices de la tabla `periodo`
--
ALTER TABLE `periodo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `nombre_2` (`nombre`),
  ADD UNIQUE KEY `nombre_3` (`nombre`),
  ADD UNIQUE KEY `nombre_4` (`nombre`),
  ADD UNIQUE KEY `nombre_5` (`nombre`),
  ADD UNIQUE KEY `nombre_6` (`nombre`),
  ADD UNIQUE KEY `nombre_7` (`nombre`),
  ADD UNIQUE KEY `nombre_8` (`nombre`),
  ADD UNIQUE KEY `nombre_9` (`nombre`),
  ADD UNIQUE KEY `nombre_10` (`nombre`),
  ADD UNIQUE KEY `nombre_11` (`nombre`),
  ADD UNIQUE KEY `nombre_12` (`nombre`),
  ADD UNIQUE KEY `nombre_13` (`nombre`),
  ADD UNIQUE KEY `nombre_14` (`nombre`),
  ADD UNIQUE KEY `nombre_15` (`nombre`),
  ADD UNIQUE KEY `nombre_16` (`nombre`),
  ADD UNIQUE KEY `nombre_17` (`nombre`),
  ADD UNIQUE KEY `nombre_18` (`nombre`),
  ADD UNIQUE KEY `nombre_19` (`nombre`),
  ADD UNIQUE KEY `nombre_20` (`nombre`),
  ADD UNIQUE KEY `nombre_21` (`nombre`),
  ADD UNIQUE KEY `nombre_22` (`nombre`),
  ADD UNIQUE KEY `nombre_23` (`nombre`),
  ADD UNIQUE KEY `nombre_24` (`nombre`),
  ADD UNIQUE KEY `nombre_25` (`nombre`),
  ADD UNIQUE KEY `nombre_26` (`nombre`),
  ADD UNIQUE KEY `nombre_27` (`nombre`),
  ADD UNIQUE KEY `nombre_28` (`nombre`),
  ADD UNIQUE KEY `nombre_29` (`nombre`),
  ADD UNIQUE KEY `nombre_30` (`nombre`),
  ADD UNIQUE KEY `nombre_31` (`nombre`);

--
-- Indices de la tabla `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_unique` (`name`);

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indices de la tabla `planes_trabajo_docente`
--
ALTER TABLE `planes_trabajo_docente`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `plan_action`
--
ALTER TABLE `plan_action`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indices de la tabla `plan_detalle`
--
ALTER TABLE `plan_detalle`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `practica`
--
ALTER TABLE `practica`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cedula_estudiante` (`cedula_estudiante`),
  ADD KEY `nit_empresa` (`nit_empresa`);

--
-- Indices de la tabla `programa`
--
ALTER TABLE `programa`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `recognition`
--
ALTER TABLE `recognition`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `period_id` (`period_id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `published_by` (`published_by`);

--
-- Indices de la tabla `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_has_permissions_role_name_permission_id_unique` (`role_name`,`permission_id`),
  ADD KEY `role_has_permissions_permission_id_foreign` (`permission_id`);

--
-- Indices de la tabla `seguimiento_historial`
--
ALTER TABLE `seguimiento_historial`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `seguimiento_plan`
--
ALTER TABLE `seguimiento_plan`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `self_evaluations`
--
ALTER TABLE `self_evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `self_evaluations_teacher_id_index` (`teacher_id`),
  ADD KEY `self_evaluations_period_id_index` (`period_id`);

--
-- Indices de la tabla `semana_practica`
--
ALTER TABLE `semana_practica`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `student_comment`
--
ALTER TABLE `student_comment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `evaluation_id` (`evaluation_id`);

--
-- Indices de la tabla `task_assignment`
--
ALTER TABLE `task_assignment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `fixed_task_id` (`fixed_task_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `period_id` (`period_id`);

--
-- Indices de la tabla `teacher_course`
--
ALTER TABLE `teacher_course`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `period_id` (`period_id`);

--
-- Indices de la tabla `tutor_academico`
--
ALTER TABLE `tutor_academico`
  ADD PRIMARY KEY (`cedula`);

--
-- Indices de la tabla `tutor_empresarial`
--
ALTER TABLE `tutor_empresarial`
  ADD PRIMARY KEY (`cedula`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`),
  ADD UNIQUE KEY `email_41` (`email`),
  ADD UNIQUE KEY `email_42` (`email`),
  ADD UNIQUE KEY `email_43` (`email`),
  ADD UNIQUE KEY `email_44` (`email`),
  ADD UNIQUE KEY `email_45` (`email`),
  ADD UNIQUE KEY `email_46` (`email`),
  ADD UNIQUE KEY `email_47` (`email`),
  ADD UNIQUE KEY `email_48` (`email`),
  ADD UNIQUE KEY `email_49` (`email`),
  ADD UNIQUE KEY `email_50` (`email`),
  ADD UNIQUE KEY `email_51` (`email`),
  ADD UNIQUE KEY `email_52` (`email`),
  ADD UNIQUE KEY `email_53` (`email`),
  ADD UNIQUE KEY `email_54` (`email`),
  ADD UNIQUE KEY `email_55` (`email`),
  ADD UNIQUE KEY `email_56` (`email`),
  ADD UNIQUE KEY `email_57` (`email`),
  ADD UNIQUE KEY `email_58` (`email`),
  ADD UNIQUE KEY `email_59` (`email`),
  ADD UNIQUE KEY `email_60` (`email`),
  ADD UNIQUE KEY `email_61` (`email`),
  ADD UNIQUE KEY `email_62` (`email`),
  ADD UNIQUE KEY `email_63` (`email`);

--
-- Indices de la tabla `user_has_permissions`
--
ALTER TABLE `user_has_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_has_permissions_user_id_permission_id_unique` (`user_id`,`permission_id`),
  ADD KEY `user_has_permissions_permission_id_foreign` (`permission_id`),
  ADD KEY `user_has_permissions_user_id_index` (`user_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividades_plan`
--
ALTER TABLE `actividades_plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asistencia_registro`
--
ALTER TABLE `asistencia_registro`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias_plan`
--
ALTER TABLE `categorias_plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `course`
--
ALTER TABLE `course`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `department`
--
ALTER TABLE `department`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `evaluation`
--
ALTER TABLE `evaluation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `evidence`
--
ALTER TABLE `evidence`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `fixed_task`
--
ALTER TABLE `fixed_task`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `improvement_plan`
--
ALTER TABLE `improvement_plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT de la tabla `management_area`
--
ALTER TABLE `management_area`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `period`
--
ALTER TABLE `period`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `periodo`
--
ALTER TABLE `periodo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `planes_trabajo_docente`
--
ALTER TABLE `planes_trabajo_docente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plan_action`
--
ALTER TABLE `plan_action`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT de la tabla `plan_detalle`
--
ALTER TABLE `plan_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `practica`
--
ALTER TABLE `practica`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programa`
--
ALTER TABLE `programa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `recognition`
--
ALTER TABLE `recognition`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT de la tabla `self_evaluations`
--
ALTER TABLE `self_evaluations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `semana_practica`
--
ALTER TABLE `semana_practica`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `student_comment`
--
ALTER TABLE `student_comment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=271;

--
-- AUTO_INCREMENT de la tabla `task_assignment`
--
ALTER TABLE `task_assignment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `teacher_course`
--
ALTER TABLE `teacher_course`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `user_has_permissions`
--
ALTER TABLE `user_has_permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `course`
--
ALTER TABLE `course`
  ADD CONSTRAINT `course_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `period` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `docente`
--
ALTER TABLE `docente`
  ADD CONSTRAINT `docente_ibfk_1` FOREIGN KEY (`programa_id`) REFERENCES `programa` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `estudiante`
--
ALTER TABLE `estudiante`
  ADD CONSTRAINT `estudiante_ibfk_1` FOREIGN KEY (`programa_id`) REFERENCES `programa` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `evaluation`
--
ALTER TABLE `evaluation`
  ADD CONSTRAINT `evaluation_ibfk_123` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `evaluation_ibfk_124` FOREIGN KEY (`period_id`) REFERENCES `period` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `evaluation_ibfk_125` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `evidence`
--
ALTER TABLE `evidence`
  ADD CONSTRAINT `evidence_ibfk_237` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `evidence_ibfk_238` FOREIGN KEY (`period_id`) REFERENCES `period` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `evidence_ibfk_239` FOREIGN KEY (`task_assignment_id`) REFERENCES `task_assignment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `evidence_ibfk_240` FOREIGN KEY (`plan_action_id`) REFERENCES `plan_action` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `evidence_ibfk_241` FOREIGN KEY (`verified_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `fixed_task`
--
ALTER TABLE `fixed_task`
  ADD CONSTRAINT `fixed_task_ibfk_1` FOREIGN KEY (`specific_teacher_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fixed_task_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `improvement_plan`
--
ALTER TABLE `improvement_plan`
  ADD CONSTRAINT `improvement_plan_ibfk_181` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `improvement_plan_ibfk_182` FOREIGN KEY (`period_id`) REFERENCES `period` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `improvement_plan_ibfk_183` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluation` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `improvement_plan_ibfk_184` FOREIGN KEY (`reviewed_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `period`
--
ALTER TABLE `period`
  ADD CONSTRAINT `period_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `plan_action`
--
ALTER TABLE `plan_action`
  ADD CONSTRAINT `plan_action_ibfk_121` FOREIGN KEY (`plan_id`) REFERENCES `improvement_plan` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `plan_action_ibfk_122` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `practica`
--
ALTER TABLE `practica`
  ADD CONSTRAINT `practica_ibfk_61` FOREIGN KEY (`cedula_estudiante`) REFERENCES `estudiante` (`cedula`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `practica_ibfk_62` FOREIGN KEY (`nit_empresa`) REFERENCES `empresa` (`nit`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `recognition`
--
ALTER TABLE `recognition`
  ADD CONSTRAINT `recognition_ibfk_174` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `recognition_ibfk_175` FOREIGN KEY (`period_id`) REFERENCES `period` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `recognition_ibfk_176` FOREIGN KEY (`plan_id`) REFERENCES `improvement_plan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `recognition_ibfk_177` FOREIGN KEY (`published_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `student_comment`
--
ALTER TABLE `student_comment`
  ADD CONSTRAINT `student_comment_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluation` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `task_assignment`
--
ALTER TABLE `task_assignment`
  ADD CONSTRAINT `task_assignment_ibfk_240` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `task_assignment_ibfk_241` FOREIGN KEY (`fixed_task_id`) REFERENCES `fixed_task` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `task_assignment_ibfk_242` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `task_assignment_ibfk_243` FOREIGN KEY (`period_id`) REFERENCES `period` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `teacher_course`
--
ALTER TABLE `teacher_course`
  ADD CONSTRAINT `teacher_course_ibfk_184` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `teacher_course_ibfk_185` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `teacher_course_ibfk_186` FOREIGN KEY (`period_id`) REFERENCES `period` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_has_permissions`
--
ALTER TABLE `user_has_permissions`
  ADD CONSTRAINT `user_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
