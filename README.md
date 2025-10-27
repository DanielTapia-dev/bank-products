# Bank Products – Frontend Angular

Proyecto desarrollado en **Angular 17** como parte de la prueba técnica para Ntt Data. El enfoque principal de este proyecto es demostrar **capacidades técnicas profesionales**, aplicando **buenas prácticas**, **arquitectura mantenible** y **calidad de código garantizada** mediante **Testing + Coverage + Linter + Husky**.

---

## Características principales implementadas hasta hoy

| Área                 | Implementación                             |
| -------------------- | ------------------------------------------ |
| Framework            | Angular 17                                 |
| Testing              | Jest con Angular                           |
| Code Coverage        | Mínimo requerido: **80%**                  |
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

Comandos:

```bash
npm run test
npm run test:watch
npm run test:cov
```
