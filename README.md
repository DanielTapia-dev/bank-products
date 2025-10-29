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
| Calidad continua     | Bloqueo de push si coverage < 80%          |

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

### 🏗️ Arquitectura simple

````txt
Angular (Frontend) ── archivo → AWS S3
        │
        └── Obtiene credenciales seguras desde Cognito (IAM temporal)

Comandos:

```bash
npm run test
npm run test:watch
npm run test:cov
````
