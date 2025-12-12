# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# 🔗 TRIMMR URL Shortener

A modern, full-featured URL shortening service with analytics built with React, Tailwind CSS, and Supabase.

## 🚀 Features

- **URL Shortening**: Create short, memorable links instantly
- **Custom Slugs**: Brand your links with custom names
- **Analytics Dashboard**: Track clicks, locations, and devices
- **QR Code Generation**: Generate QR codes for easy sharing
- **User Authentication**: Secure login/signup with Supabase Auth
- **Link Management**: Edit, disable, or delete your links
- **Real-time Tracking**: Monitor click statistics in real-time

## 📸 Screenshots

| Landing Page | Dashboard | Link Creation |
|-------------|-----------|---------------|
| ![Landing](screenshots/landing.png) | ![Dashboard](screenshots/dashboard.png) | ![Create](screenshots/create.png) |

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (Supabase)
- **Routing**: React Router DOM
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository:**
```bash
git clone https://github.com/rut0607/TRIMMR-URLSHORTNER.git
cd TRIMMR-URLSHORTNER