# OptimaFlow Sales Intelligence

Una aplicación móvil de inteligencia de ventas que ayuda a concesionarios de automóviles y empresas de movilidad eléctrica en Europa a generar oportunidades de venta cualificadas mediante análisis inteligente y estrategias de prospección personalizadas.

## 🎯 Descripción General

OptimaFlow es una plataforma de sales intelligence que automatiza la investigación de empresas objetivo y genera estrategias de prospección personalizadas. Utiliza inteligencia artificial para analizar debilidades en procesos de ventas e identificar oportunidades de mejora, permitiendo a los equipos de ventas enfocarse en prospectos de alto valor.

**Mercado objetivo:**
- Concesionarios de automóviles
- Distribuidores de vehículos eléctricos (EV)
- Empresas de movilidad eléctrica
- Empresas B2B automotrices

**Geografía:** Alemania, Francia, España, Italia, Países Bajos

## ✨ Características Principales

### 🔍 Análisis Inteligente
- Búsqueda de empresas objetivo con filtros por país y tipo
- Análisis automático de debilidades en procesos de ventas
- Puntuación de oportunidad basada en IA
- Identificación de ineficiencias en captura de leads y seguimiento

### 📋 Generación de Estrategias
- Mensajes de prospección personalizados
- Hipótesis de debilidades comerciales
- Ángulos de descubrimiento para llamadas de ventas
- Objeciones comunes y respuestas sugeridas
- Hook de posicionamiento de 15 minutos

### 📊 Seguimiento de Oportunidades
- Panel de control de oportunidades con filtros por estado
- Estados: Contactado, En Progreso, Cerrado, Perdido
- Timeline de actividades (llamadas, emails, reuniones, notas, propuestas)
- Historial completo de interacciones por oportunidad
- Puntuación de oportunidad y métricas de progreso

### 💾 Gestión de Datos
- Almacenamiento local con AsyncStorage
- Base de datos MySQL para persistencia en servidor
- Estrategias guardadas para reutilización
- Sincronización entre dispositivos

### 🎨 Experiencia de Usuario
- Interfaz responsive para móvil (portrait 9:16)
- Modo claro y oscuro con cambio dinámico
- Feedback háptico en interacciones
- Navegación por tabs intuitiva
- Diseño siguiendo Apple Human Interface Guidelines

## 🛠️ Stack Tecnológico

### Frontend
- **React Native 0.81** - Framework móvil
- **Expo SDK 54** - Plataforma de desarrollo
- **TypeScript 5.9** - Tipado estático
- **Expo Router 6** - Navegación
- **NativeWind 4** - Tailwind CSS para React Native
- **React 19** - Librería UI

### Backend
- **Node.js** - Runtime
- **Express.js** - Framework web
- **tRPC 11.7** - API type-safe
- **Drizzle ORM 0.44** - Gestión de base de datos

### Base de Datos
- **MySQL** - Base de datos relacional
- **Drizzle Kit** - Migraciones y esquema

### Herramientas
- **pnpm** - Gestor de paquetes
- **Vitest** - Testing
- **Prettier** - Formateador de código
- **ESLint** - Linter

## 📦 Estructura del Proyecto

```
optimaflow-mobile-app/
├── app/                          # Rutas y pantallas (Expo Router)
│   ├── _layout.tsx              # Layout raíz con providers
│   └── (tabs)/
│       ├── _layout.tsx          # Configuración de tabs
│       ├── index.tsx            # Home screen
│       ├── opportunities.tsx    # Seguimiento de oportunidades
│       ├── opportunity-detail.tsx # Detalles de oportunidad
│       ├── search.tsx           # Búsqueda de empresas
│       ├── analysis.tsx         # Análisis de empresa
│       ├── strategy.tsx         # Generación de estrategia
│       └── saved.tsx            # Estrategias guardadas
├── components/                   # Componentes reutilizables
│   ├── screen-container.tsx     # Contenedor con SafeArea
│   ├── haptic-tab.tsx           # Tab con feedback háptico
│   └── ui/
│       └── icon-symbol.tsx      # Mapeo de iconos
├── hooks/                        # Custom hooks
│   ├── use-colors.ts            # Hook de colores del tema
│   ├── use-color-scheme.ts      # Hook de esquema de color
│   └── use-auth.ts              # Hook de autenticación
├── lib/                          # Utilidades y contextos
│   ├── theme-provider.tsx       # Proveedor de tema
│   ├── trpc.ts                  # Cliente tRPC
│   └── utils.ts                 # Funciones utilitarias
├── constants/                    # Constantes
│   └── theme.ts                 # Paleta de colores
├── assets/                       # Recursos estáticos
│   └── images/
│       ├── icon.png             # Logo de la app
│       ├── splash-icon.png      # Icono de splash
│       └── favicon.png          # Favicon web
├── drizzle/                      # Esquema de base de datos
│   └── schema.ts                # Definición de tablas
├── server/                       # Backend
│   ├── _core/
│   │   ├── index.ts             # Punto de entrada del servidor
│   │   ├── trpc.ts              # Configuración de tRPC
│   │   ├── env.ts               # Variables de entorno
│   │   └── cookies.ts           # Gestión de cookies
│   ├── services/
│   │   └── company-analyzer.ts  # Servicio de análisis con IA
│   ├── db.ts                    # Funciones de base de datos
│   └── routers.ts               # Rutas tRPC
├── app.config.ts                # Configuración de Expo
├── tailwind.config.js           # Configuración de Tailwind
├── theme.config.js              # Paleta de colores
├── package.json                 # Dependencias
└── tsconfig.json                # Configuración de TypeScript
```

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- pnpm 9.12.0+
- Expo CLI
- Git

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/optimaflow7-byte/optimaflow-mobile-app.git
cd optimaflow-mobile-app
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
# Editar .env.local con tus valores
```

4. **Ejecutar migraciones de base de datos**
```bash
pnpm db:push
```

5. **Iniciar el servidor de desarrollo**
```bash
pnpm dev
```

El servidor estará disponible en:
- **Metro (Expo):** http://localhost:8081
- **API (tRPC):** http://localhost:3000

### Acceder a la Aplicación

#### En Expo Go (Dispositivo Real)
```bash
pnpm qr
```
Escanea el código QR con tu dispositivo usando Expo Go.

#### En Navegador Web
```bash
pnpm dev:metro
```
Abre http://localhost:8081 en tu navegador.

#### En Simulador iOS/Android
```bash
pnpm ios      # Simulador iOS
pnpm android  # Emulador Android
```

## 📱 Pantallas Principales

### Home Screen
- Estadísticas rápidas (estrategias, países)
- Botón de nueva investigación
- Investigaciones recientes
- Acceso rápido a seguimiento y análisis
- **Botón de cambio de tema** (Light/Dark)

### Búsqueda de Empresas
- Búsqueda por nombre de empresa
- Filtros por país (Alemania, Francia, España, Italia, Países Bajos)
- Filtros por tipo (Concesionario, Distribuidor EV, Empresa B2B)
- Resultados con información de contacto

### Análisis de Empresa
- Análisis automático de debilidades
- Puntuación de oportunidad (0-10)
- Debilidades identificadas:
  - Captura de leads
  - Sistema de seguimiento
  - Velocidad de respuesta
  - Claridad del proceso de ventas
  - Indicadores de uso de CRM

### Generación de Estrategia
- Mensaje de prospección personalizado
- Hipótesis de debilidad principal
- 2 ángulos de descubrimiento para llamada
- Objeciones comunes y respuestas
- Hook de posicionamiento de 15 minutos

### Seguimiento de Oportunidades
- Lista de oportunidades con filtros por estado
- Puntuación de oportunidad
- Cambio de estado (Contactado → En Progreso → Cerrado/Perdido)
- Búsqueda y filtrado

### Detalles de Oportunidad
- Información de la empresa
- Timeline visual de actividades
- Agregar nuevas actividades:
  - Llamadas
  - Emails
  - Reuniones
  - Notas
  - Propuestas
- Historial completo con fechas

### Estrategias Guardadas
- Biblioteca de estrategias generadas
- Búsqueda y filtrado
- Eliminación de estrategias
- Reutilización de estrategias anteriores

## 🔌 Integración con IA

La aplicación utiliza el LLM integrado del servidor para:

### Análisis de Empresas
- Analiza debilidades en procesos de ventas
- Genera puntuación de oportunidad
- Identifica ineficiencias específicas
- Proporciona insights accionables

### Generación de Estrategias
- Crea mensajes personalizados por empresa
- Genera hipótesis de debilidades
- Propone ángulos de descubrimiento
- Anticipa objeciones comunes
- Desarrolla hooks de posicionamiento

**Endpoint:** `/api/trpc/company.analyze` y `/api/trpc/company.generateStrategy`

## 💾 Base de Datos

### Tablas Principales

#### `users`
```sql
- id (INT, PK)
- openId (VARCHAR, UNIQUE)
- name (VARCHAR)
- email (VARCHAR)
- role (ENUM: 'user', 'admin')
- lastSignedIn (DATETIME)
- createdAt (DATETIME)
```

#### `opportunities`
```sql
- id (INT, PK)
- userId (INT, FK)
- companyName (VARCHAR)
- country (VARCHAR)
- companyType (VARCHAR)
- status (ENUM: 'contactado', 'en_progreso', 'cerrado', 'perdido')
- opportunityScore (INT 0-10)
- strategyId (VARCHAR)
- contactDate (DATETIME)
- lastActivityDate (DATETIME)
- createdAt (DATETIME)
```

#### `activities`
```sql
- id (INT, PK)
- opportunityId (INT, FK)
- type (ENUM: 'llamada', 'email', 'reunion', 'nota', 'propuesta')
- title (VARCHAR)
- notes (TEXT)
- result (VARCHAR)
- createdAt (DATETIME)
```

## 🔐 Autenticación

La aplicación soporta autenticación OAuth:
- Login con Google
- Login con Apple
- Sesiones persistentes con cookies seguras

## 🎨 Temas y Estilos

### Colores de Marca OptimaFlow

**Modo Claro:**
- Primario: `#0A7EA4` (Azul OptimaFlow)
- Fondo: `#FFFFFF`
- Superficie: `#F5F5F5`
- Texto: `#11181C`
- Acento: `#F59E0B` (Ámbar)

**Modo Oscuro:**
- Primario: `#0A7EA4`
- Fondo: `#151718`
- Superficie: `#1E2022`
- Texto: `#ECEDEE`
- Acento: `#F59E0B`

### Cambio de Tema
Usa el botón circular en la esquina superior derecha del home screen para cambiar entre modo claro y oscuro. El cambio es inmediato y afecta toda la aplicación.

## 📡 API tRPC

### Rutas Disponibles

#### Análisis de Empresas
```typescript
// Analizar debilidades de una empresa
POST /api/trpc/company.analyze
{
  companyName: string
  country: string
  type: string
}

// Generar estrategia de prospección
POST /api/trpc/company.generateStrategy
{
  companyName: string
  country: string
  type: string
  analysis: { weaknesses, hypothesis, insights, opportunityScore }
}
```

#### Gestión de Oportunidades
```typescript
// Listar oportunidades del usuario
GET /api/trpc/opportunities.list
{ userId: number }

// Crear oportunidad
POST /api/trpc/opportunities.create
{
  userId: number
  companyName: string
  country: string
  companyType: string
  opportunityScore: number
  strategyId?: string
}

// Obtener detalles de oportunidad
GET /api/trpc/opportunities.get
{ id: number }

// Actualizar estado
POST /api/trpc/opportunities.update
{
  id: number
  status: 'contactado' | 'en_progreso' | 'cerrado' | 'perdido'
}

// Eliminar oportunidad
POST /api/trpc/opportunities.delete
{ id: number }
```

#### Gestión de Actividades
```typescript
// Listar actividades de oportunidad
GET /api/trpc/activities.list
{ opportunityId: number }

// Crear actividad
POST /api/trpc/activities.create
{
  opportunityId: number
  type: 'llamada' | 'email' | 'reunion' | 'nota' | 'propuesta'
  title: string
  notes?: string
  result?: string
}

// Eliminar actividad
POST /api/trpc/activities.delete
{ id: number }
```

## 🧪 Testing

Ejecutar pruebas unitarias:
```bash
pnpm test
```

Ejecutar pruebas en modo watch:
```bash
pnpm test --watch
```

## 📝 Convenciones de Código

### Estructura de Componentes
```typescript
import { View, Text, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function MyScreen() {
  const colors = useColors();
  
  return (
    <ScreenContainer className="p-6">
      <View className="gap-4">
        <Text className="text-2xl font-bold text-foreground">
          Título
        </Text>
      </View>
    </ScreenContainer>
  );
}
```

### Estilos con Tailwind
- Usar `className` en lugar de `style`
- Usar tokens de color: `text-foreground`, `bg-primary`, etc.
- No usar prefijo `dark:` (se aplica automáticamente)
- Usar `gap-X` para espaciado entre elementos

### Naming Conventions
- Componentes: PascalCase (`MyComponent.tsx`)
- Hooks: camelCase con prefijo `use` (`useColors.ts`)
- Funciones: camelCase (`handlePress()`)
- Constantes: UPPER_SNAKE_CASE (`MAX_RETRIES`)

## 🚀 Deployment

### Build para Producción
```bash
# Build web
pnpm build

# Build Android
eas build --platform android

# Build iOS
eas build --platform ios
```

### Variables de Entorno Requeridas
```
DATABASE_URL=mysql://user:password@host:port/database
NODE_ENV=production
OWNER_OPEN_ID=your_open_id
```

## 📚 Documentación Adicional

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [tRPC Documentation](https://trpc.io/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [NativeWind Documentation](https://www.nativewind.dev/)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📋 Roadmap

- [ ] Dashboard con métricas de oportunidades
- [ ] Recordatorios automáticos de seguimiento
- [ ] Exportación de estrategias en PDF
- [ ] Integración con calendario del dispositivo
- [ ] Compartir estrategias por email
- [ ] Análisis de tendencias de ventas
- [ ] Integración con CRM externos
- [ ] Sincronización en tiempo real

## 📄 Licencia

Este proyecto está bajo licencia privada. Todos los derechos reservados © 2026 OptimaFlow.

## 👥 Equipo

Desarrollado por el equipo de OptimaFlow.

## 📞 Soporte

Para soporte y preguntas, contacta a: support@optimaflow.com

## 🙏 Agradecimientos

- Expo y React Native community
- Tailwind CSS
- tRPC
- Drizzle ORM

---

**Última actualización:** Febrero 2026

**Versión:** 1.0.0

**Estado:** En desarrollo activo
