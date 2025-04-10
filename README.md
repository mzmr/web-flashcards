# Web Flashcards

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description
Web Flashcards is a web application designed to facilitate the creation of educational flashcards. It offers two primary functionalities:

- **AI Flashcard Generation:** Automatically generate flashcards from a provided text input.
- **Manual Flashcard Creation:** Create flashcards manually by entering text for the front and back.

This application utilizes spaced repetition techniques to enhance learning efficiency, while providing a user-friendly interface for managing flashcard sets and secure user authentication.

## Tech Stack
- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase
- **AI Integration:** Openrouter.ai for flashcard generation
- **CI/CD & Hosting:** GitHub Actions & DigitalOcean
- **Node.js Version:** 22.14.0 (as specified in .nvmrc)

## Getting Started Locally
1. **Clone the repository:**
   ```bash
   git clone https://github.com/mzmr/web-flashcards.git
   cd web-flashcards
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Ensure you are using Node.js version 22.14.0:**
   ```bash
   nvm use
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Available Scripts
- `npm run dev` - Starts the development server.
- `npm run build` - Builds the project for production.
- `npm run preview` - Previews the production build locally.
- `npm run astro` - Runs Astro CLI commands.
- `npm run lint` - Runs ESLint to check for code issues.
- `npm run lint:fix` - Automatically fixes lint issues.
- `npm run format` - Formats the codebase using Prettier.

## Project Scope
The project is centered around the following key features:

- **AI-Generated Flashcards:** Process input text to automatically generate flashcards.
- **Manual Flashcard Creation:** Provide users with the ability to manually create and edit flashcards.
- **Flashcard Management:** View, edit, and delete individual flashcards or entire flashcard sets.
- **User Authentication:** Support for user registration, login, and secure session management.

## Project Status
This project is currently an MVP and is under active development.

## License
This project is licensed under the MIT License. 