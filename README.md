# Boda J&L – RSVP Web Application

Sistema web de confirmación de asistencia (RSVP) para la boda de J&L.  
La solución permite a los invitados confirmar su asistencia y preferencias logísticas y alimentarias, almacenando la información de forma estructurada y segura en Google Sheets mediante un backend serverless basado en Google Apps Script.

---

## 1. Objetivo del proyecto

El objetivo de este proyecto es proporcionar un sistema:

- Sencillo para el usuario final
- Robusto a nivel de backend
- Centralizado en Google Sheets
- Sin dependencia de servidores propios
- Fácilmente auditable y mantenible

La aplicación cubre la gestión de:
- Asistencia y no asistencia
- Acompañantes
- Transporte (autobús ida / vuelta)
- Alergias e intolerancias
- Menú vegetariano
- Menú vegano
- Aplicación de preferencias por persona (invitado / pareja)

---

## 2. Arquitectura general

### 2.1 Tecnologías utilizadas

| Componente | Tecnología |
|----------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Hosting | GitHub Pages |
| Backend | Google Apps Script |
| Almacenamiento | Google Sheets |
| Seguridad | Token privado (Script Properties) |

---

## 3. Estructura del repositorio

- index.html # Página principal
- js/form.js # Lógica del formulario y envío
- js/main.js # Navegación y estados
- js/music.js # Música ambiental
- css/form.css # Estilos del formulario
- css/modal.css # Estilos de modales
- css/style-granate.css # Tema visual principal
- img/... # Imagenes utilizadas
- README.md


---

## 4. Backend (Google Apps Script)

### 4.1 Funcionalidad principal

El backend expone un endpoint `doPost` que:

1. Valida el token de seguridad
2. Normaliza los datos recibidos
3. Aplica reglas de negocio
4. Inserta la información en la hoja `Responses`
5. Devuelve una respuesta JSON al frontend

### 4.2 Reglas de negocio clave

- Si el invitado **no tiene pareja**, cualquier preferencia alimentaria se asigna automáticamente al invitado principal.
- Si hay pareja y se marca una opción sin indicar a quién aplica, se asigna por defecto al invitado.
- Nunca se generan estados ambiguos (ej. preferencia marcada sin destinatario).

---

## 5. Seguridad

### 5.1 Token de validación

El sistema utiliza un token privado (`SHEET_TOKEN`) almacenado en las **Script Properties** de Apps Script.

- El token se envía desde el frontend en cada petición
- El backend rechaza cualquier petición sin token válido


---

## 6. Google Sheets

### 6.1 Hoja principal

**Responses**

Contiene todas las respuestas completas, una por envío, con el siguiente criterio:
- Una fila por formulario enviado
- Todas las columnas normalizadas
- Columna `Raw` con el payload completo para auditoría

### 6.2 Hojas auxiliares (vistas)

Las hojas auxiliares **NO reciben datos desde el backend**.  
Se rellenan automáticamente mediante fórmulas `FILTRAR()` basadas en `Responses`.

Ejemplos de hojas:
- Asisten
- No asisten
- Con pareja
- Bus ida
- Bus vuelta
- Ida y vuelta
- Alergias
- Vegetariano
- Vegano

Esto garantiza:
- Cero duplicación de lógica
- Máxima trazabilidad
- Fácil modificación futura

---

## 7. Despliegue

### 7.1 Backend

1. Crear proyecto en Google Apps Script
2. Pegar el código backend
3. Configurar `SHEET_TOKEN`
4. Desplegar como **Aplicación web**
   - Ejecutar como: Propietario
   - Acceso: Cualquiera

### 7.2 Frontend

La web se despliega automáticamente mediante **GitHub Pages**.

Cada commit en la rama configurada lanza el workflow:
pages-build-deployment


Para forzar un redeploy:
```bash
git commit --allow-empty -m "force redeploy"
git push
```

## 8. Autor

**Proyecto desarrollado por Javi**
Boda J&L · 2026
