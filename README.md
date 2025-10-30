# Bank Products – Frontend Angular

Proyecto desarrollado en **Angular 17** como parte de la prueba técnica para Ntt Data. El enfoque principal de este proyecto es demostrar **capacidades técnicas profesionales**, aplicando **buenas prácticas**, **arquitectura mantenible** y **calidad de código garantizada** mediante **Testing + Coverage + Linter + Husky**.

---

## ❗ Información Importante

Se implemento un delay de 2 segundos en las peticiones al servidor para poder ver visualmente los skeletons

## Características principales implementadas hasta hoy

| Área                 | Implementación                             |
| -------------------- | ------------------------------------------ |
| Framework            | Angular 17                                 |
| Testing              | Jest con Angular                           |
| Code Coverage        | Mínimo requerido: **70%**                  |
| Hooks de calidad     | Husky + lint-staged                        |
| Estándares de código | ESLint mejorado para Angular               |
| Formateo             | Prettier automático al guardar y commitear |
| Clean Git            | Bloqueo de código sucio vía pre-commit     |
| Calidad continua     | Bloqueo de push si coverage < 70%          |
| Rendimiento          | Lazy rendering                             |
| Arquitectura         | Escalable, modular y desacoplada           |

---

## Calidad del código garantizada

Este proyecto implementa **control automático de calidad**, protegido a nivel local y remoto:

✅ **Pre-commit** – ejecuta ESLint y limpia formato con Prettier  
✅ **Pre-push** – ejecuta Jest con code coverage mínimo del **80%**  
✅ No se permite código con `console.log`  
✅ Los errores de estilo se corrigen automáticamente antes del commit  
✅ Nadie puede subir código que rompa tests o cobertura

---

## Testing configurado con Jest

El proyecto usa **Jest** en lugar de Karma/Jasmine para pruebas unitarias por ser:

- Más rápido
- Mejor soporte en CI/CD
- Mejor desarrollo basado en pruebas (TDD)
- Soporte completo para Angular Standalone y TestBed

## 🖼️ Gestión de imágenes con Amazon S3

Este proyecto permite subir imágenes (por ejemplo logos de productos) directamente a un bucket de **Amazon S3**, generando una URL pública que luego se almacena como referencia del producto.

### ✅ ¿Por qué se hizo así?

Esta es una **prueba técnica exclusivamente Frontend**, por lo que **no se debía modificar el backend ya existente** ni crear servicios adicionales.  
En un escenario real, lo ideal es que el backend procese la subida del archivo a S3, pero en este caso se utilizó una solución 100% frontend usando **AWS Cognito** para autenticación temporal y subir archivos de forma segura.

---

### 🔒 Seguridad aplicada (sin exponer llaves AWS)

No se utilizan **Access Key** ni **Secret Key** en el frontend (mala práctica ❌).  
En su lugar se implementó:

| Componente AWS                 | Uso                                                              |
| ------------------------------ | ---------------------------------------------------------------- |
| **Cognito Identity Pool**      | Genera credenciales temporales IAM para el frontend              |
| **IAM Role restringido**       | Permite solo `PutObject` y `GetObject` en una carpeta del bucket |
| **S3 Bucket Público limitado** | Solo lectura pública de archivos subidos                         |

---

## 🧠 **Arquitectura y buenas prácticas**

### 🧩 Estructura modular por feature

Cada módulo (features/products, shared, core, state) está diseñado para
**independencia total** y **reutilización**.

- `features/products` → Componentes y lógica de producto.
- `shared` → Componentes, pipes, servicios comunes.
- `core` → Configuración global, interceptores y guards.
- `state` → Store reactivo basado en `BehaviorSubject`.

### 🧰 Buenas prácticas aplicadas

✅ Componentes **standalone** (sin NgModules)\
✅ Reutilización de componentes compartidos (tabla, formularios,
toasts)\
✅ Código **type-safe** con TypeScript estricto (`"strict": true`)\
✅ Uso de `trackBy` en \*ngFor para optimizar renderizado\\
✅ Eliminación de dependencias innecesarias\
✅ Convenciones consistentes con ESLint + Prettier

---

## ⚙️ **Pasos para ejecutar el proyecto**

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/<tu-usuario>/bank-products.git
cd bank-products
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Configurar variables de entorno

En el archivo `src/environments/environment.ts` agregar tus credenciales
de AWS Cognito y S3 (En caso de no tener):

```typescript
  production: false,
  apiUrl: '/bp',
  aws: {
    region: 'us-east-2',
    s3: {
      bucket: 'daniel-nttdata',
      prefix: 'products/',
      maxSizeMB: 5,
      allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      publicBaseUrl: '',
    },
    cognito: {
      identityPoolId: 'us-east-2:7dd387cd-1a34-42d7-be5e-8722787c3f9c',
    },
  },
```

### 4️⃣ Ejecutar el proyecto en modo desarrollo

```bash
npm start
```

Abrir <http://localhost:4200> para ver la aplicación.

### 5️⃣ Ejecutar pruebas unitarias

```bash
npm run test
```

### 6️⃣ Ver cobertura de código

```bash
npm run test:cov
```

### 7️⃣ Ejecutar linters manualmente

```bash
npm run lint
```
