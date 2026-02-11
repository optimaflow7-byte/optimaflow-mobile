# OptimaFlow Sales Intelligence - Mobile App Design

## Overview
OptimaFlow Sales Intelligence es una aplicación móvil diseñada para equipos de ventas en concesionarios de automóviles y empresas de movilidad eléctrica en Europa. La aplicación permite investigar empresas objetivo, analizar debilidades en sus procesos de ventas y generar estrategias de prospección personalizadas.

## Design Principles
- **Orientación**: Portrait (9:16)
- **Uso**: Una mano
- **Estilo**: Diseño limpio, ejecutivo, enfocado en productividad
- **Estándar**: Apple Human Interface Guidelines (HIG)

## Screen List

### 1. **Home Screen** (Pantalla Principal)
- Bienvenida con nombre del usuario
- Resumen rápido de empresas investigadas
- Botón principal: "Nueva Investigación"
- Acceso rápido a investigaciones recientes
- Tab bar con navegación principal

### 2. **Company Search Screen** (Búsqueda de Empresas)
- Campo de búsqueda por nombre de empresa
- Filtros: País (Alemania, Francia, Países Bajos, España, Italia)
- Filtros: Tipo (Concesionario, Distribuidor EV, Empresa de Movilidad)
- Lista de resultados con nombre, ubicación, tipo
- Botón para iniciar investigación

### 3. **Company Analysis Screen** (Análisis de Empresa)
- Información básica de la empresa
- Indicadores de debilidades identificadas:
  - Captura de leads
  - Sistema de seguimiento
  - Velocidad de respuesta
  - Claridad del proceso de ventas
  - Indicadores de uso de CRM
- Puntuación de oportunidad (1-10)
- Botón: "Generar Estrategia"

### 4. **Strategy Generation Screen** (Generación de Estrategia)
- Mensaje de prospección personalizado (LinkedIn/Email)
- Hipótesis de ineficiencia principal
- 2 ángulos de descubrimiento para llamada
- Objeciones probables y respuestas
- Hook de posicionamiento (15 minutos)
- Opciones: Copiar, Compartir, Guardar

### 5. **Saved Strategies Screen** (Estrategias Guardadas)
- Lista de todas las estrategias generadas
- Búsqueda y filtrado
- Vista previa de cada estrategia
- Opciones: Editar, Eliminar, Compartir

### 6. **Settings Screen** (Configuración)
- Perfil del usuario
- Preferencias de país objetivo
- Preferencias de tipo de empresa
- Tono de comunicación (formal, amigable, agresivo)
- Exportar datos
- Acerca de

## Primary Content and Functionality

### Home Screen
- **Contenido**: Tarjeta de bienvenida, contador de investigaciones, lista de últimas 3 investigaciones
- **Funcionalidad**: Navegar a búsqueda, acceder a estrategias guardadas, ver detalles de investigación reciente

### Company Search Screen
- **Contenido**: Barra de búsqueda, filtros desplegables, grid de resultados
- **Funcionalidad**: Buscar empresas, filtrar por país/tipo, iniciar análisis

### Company Analysis Screen
- **Contenido**: Tarjeta de información de empresa, indicadores de debilidades, puntuación
- **Funcionalidad**: Ver análisis, generar estrategia, guardar para más tarde

### Strategy Generation Screen
- **Contenido**: Secciones de mensaje, hipótesis, ángulos, objeciones, hook
- **Funcionalidad**: Copiar texto, compartir, guardar, editar

### Saved Strategies Screen
- **Contenido**: Lista scrollable de estrategias con preview
- **Funcionalidad**: Buscar, filtrar, ver detalles, eliminar

### Settings Screen
- **Contenido**: Formularios de preferencias
- **Funcionalidad**: Actualizar configuración, exportar datos

## Key User Flows

### Flow 1: Nueva Investigación
1. Usuario toca "Nueva Investigación" en Home
2. Navega a Company Search
3. Busca o filtra empresa
4. Selecciona empresa de resultados
5. Navega a Company Analysis
6. Revisa debilidades identificadas
7. Toca "Generar Estrategia"
8. Navega a Strategy Generation
9. Revisa estrategia completa
10. Guarda o comparte

### Flow 2: Revisar Estrategias Guardadas
1. Usuario toca "Estrategias Guardadas" en Home
2. Navega a Saved Strategies
3. Busca o filtra estrategias
4. Toca estrategia para ver detalles
5. Copia, comparte o edita

### Flow 3: Configurar Preferencias
1. Usuario toca ícono de configuración en tab bar
2. Navega a Settings
3. Actualiza preferencias
4. Guarda cambios

## Color Choices

### Brand Colors
- **Primary**: #0A7EA4 (Azul profesional - confianza, tecnología)
- **Secondary**: #1E40AF (Azul oscuro - énfasis)
- **Accent**: #F59E0B (Ámbar - llamadas a acción)

### Semantic Colors
- **Background**: #FFFFFF (Light) / #151718 (Dark)
- **Surface**: #F5F5F5 (Light) / #1E2022 (Dark)
- **Foreground**: #11181C (Light) / #ECEDEE (Dark)
- **Muted**: #687076 (Light) / #9BA1A6 (Dark)
- **Success**: #22C55E (Verde - éxito)
- **Warning**: #F59E0B (Ámbar - advertencia)
- **Error**: #EF4444 (Rojo - error)

## Typography
- **Display**: SF Pro Display (iOS) / Roboto (Android)
- **Body**: SF Pro Text (iOS) / Roboto (Android)
- **Sizes**: 12px (caption), 14px (body), 16px (subheading), 18px (heading), 24px (display)

## Interaction Patterns
- **Buttons**: Scale 0.97 + haptic feedback on tap
- **List Items**: Opacity 0.7 on press
- **Navigation**: Smooth transitions between screens
- **Loading**: Spinner centered con mensaje
- **Error**: Toast notifications con opción de reintentar

## Accessibility
- Mínimo contraste WCAG AA
- Tamaños de toque mínimo 44x44pt
- Soporte para VoiceOver (iOS) y TalkBack (Android)
- Etiquetas descriptivas en todos los elementos interactivos
