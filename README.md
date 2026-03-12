# Wasap Creativ

Plataforma SaaS para agentes de WhatsApp con IA, integrada con backend en Convex y enfoque multi-organización.

## Qué es este proyecto

Wasap Creativ es una base de producto para crear y operar agentes conversacionales sobre WhatsApp, con autenticación, manejo de webhooks, prompts del agente y aislamiento por organización.

## El reto

El reto principal fue **conectar mensajería real, lógica de producto y backend moderno en una sola arquitectura confiable**.

No era suficiente con responder mensajes. Había que resolver:

- verificación y recepción de webhooks de WhatsApp
- integración con IA en tiempo real
- separación segura entre organizaciones
- una base lista para escalar como SaaS

## Cómo lo resolví

- Organicé el proyecto sobre Next.js + Convex para combinar UI y backend reactivo.
- Integré el flujo de webhook para Meta/WhatsApp.
- Planteé una arquitectura con scoping por organización para entornos multi-tenant.
- Dejé preparado el sistema para trabajar prompts dinámicos del agente y despliegue en Vercel.

## Stack

- Next.js
- React
- TypeScript
- Convex
- OpenAI API
- Clerk
- Tailwind CSS
- WhatsApp Cloud API

## Lo que hace valioso este proyecto

Este proyecto demuestra capacidad para construir software conectado a canales reales de negocio. Es valioso porque combina **IA, mensajería, producto SaaS y arquitectura backend** en una misma solución.

## Aprendizajes

- Los productos conversacionales requieren tanta arquitectura como UX.
- WhatsApp como canal exige fiabilidad, validación y buen manejo de eventos.
- Multi-tenancy bien planteado desde el inicio evita muchos problemas futuros.

## Desarrollo local

```bash
npm install
npx convex dev
npm run dev
```

## Enlace del proyecto

- Repositorio: https://github.com/adriaavila/wasap-creativ