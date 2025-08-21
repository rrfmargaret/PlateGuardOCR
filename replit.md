# Overview

This is a license plate recognition web application built with a modern full-stack architecture. The system enables users to capture images of license plates using their device camera, extract plate numbers using OCR (Optical Character Recognition) technology, and store the results in a database. The application provides a mobile-first interface for real-time plate detection, data management, and analytics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type-safe development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and CSS variables
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules for consistency across the stack
- **API Design**: RESTful API endpoints for CRUD operations on plate records
- **Data Validation**: Zod schemas for runtime type checking and validation
- **Development**: Hot module replacement and error overlay for development experience

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Definition**: Centralized schema definitions in shared module
- **Migrations**: Drizzle Kit for database migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL for cloud hosting
- **Fallback Storage**: In-memory storage implementation for development/testing

## Core Features Architecture
- **Camera Integration**: WebRTC MediaDevices API for camera access with device enumeration and switching
- **OCR Processing**: Tesseract.js for client-side optical character recognition
- **Image Processing**: Canvas API for image capture and manipulation
- **Real-time Updates**: Query invalidation and refetching for live data updates

## Mobile-First Design
- **Responsive Layout**: Tailwind breakpoints for mobile-first responsive design
- **Bottom Navigation**: Native app-like navigation for mobile devices
- **Touch Interactions**: Optimized for touch interfaces with appropriate sizing
- **Progressive Enhancement**: Works across different screen sizes and capabilities

## External Dependencies

- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **tesseract.js**: Client-side OCR engine for text recognition
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Minimalist client-side routing
- **zod**: Runtime type validation and schema definition
- **tailwindcss**: Utility-first CSS framework
- **vite**: Build tool and development server
- **express**: Web application framework for Node.js