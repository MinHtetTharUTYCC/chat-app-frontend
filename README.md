# Chat App Frontend

[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/MinHtetTharUTYCC/chat-app-frontend)

This is the frontend for a modern, real-time chat application built with Next.js and TypeScript. It features direct and group messaging, user presence, real-time notifications, and a clean, responsive interface powered by Shadcn/ui and Tailwind CSS.

## 🚀 Live Demo
[Chat App](https://chat-app-dusky-chi.vercel.app/)

## Features

-   **Authentication**: Secure user login and registration with session management using JWT and refresh tokens.
-   **Real-Time Chat**: Direct (1-on-1) and group conversations powered by Socket.IO.
-   **Presence System**: See when users are online, offline, or their last seen status, updated in real-time.
-   **Typing Indicators**: Know when another user is typing a message.
-   **Message Management**: Send, edit, delete, and pin messages within a chat.
-   **Group Management**: Create groups, update group titles, invite new members, add existing users, and leave groups.
-   **Search Functionality**: Search for chats in the sidebar and search for specific messages within a conversation.
-   **Notifications**: Real-time pop-up notifications for new messages, group invites, pinned messages, and more.
-   **Theming**: Switch between light and dark modes.
-   **Responsive Design**: A seamless experience on both desktop and mobile devices.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand) & [TanStack Query](https://tanstack.com/query/latest)
-   **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) built on [Radix UI](https://www.radix-ui.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Real-time Communication**: [Socket.IO Client](https://socket.io/docs/v4/client-api/)
-   **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
-   **HTTP Client**: [Axios](https://axios-http.com/)

## Project Structure

The codebase is organized to maintain separation of concerns and improve scalability.

```
/
├── app/                  # Next.js App Router: layouts, pages, and routes
│   ├── (auth)/           # Authentication-related pages (login, register)
│   └── chats/            # Main chat interface layout and pages
├── components/           # Reusable React components
│   ├── auth/             # Authentication forms and logic
│   ├── chat/             # Chat-specific components (sidebar, window, messages)
│   ├── ui/               # Reusable UI primitives from Shadcn/ui
│   └── ...
├── hooks/                # Custom React hooks
│   ├── chats/            # TanStack Query hooks for chat data
│   ├── messages/         # TanStack Query hooks for message data
│   └── ...
├── lib/                  # Utility functions, API client, and helpers
├── services/             # API service layer, organized by domain
└── types/                # TypeScript type definitions
```

## Getting Started

Follow these steps to get the development environment running.

### Prerequisites

-   Node.js (v20.9.0 or later)
-   [pnpm](https://pnpm.io/) package manager
-   A running instance of the corresponding backend server.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/minhtettharutycc/chat-app-frontend.git
    cd chat-app-frontend
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the URL of your running backend API.

    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

4.  **Run the development server:**
    The application will start on `http://localhost:9000`.
    ```bash
    pnpm dev
    ```

## Available Scripts

-   `pnpm dev`: Runs the application in development mode at `http://localhost:9000`.
-   `pnpm build`: Creates an optimized production build of the application.
-   `pnpm start`: Starts the production server from the build files.
-   `pnpm lint`: Runs ESLint to check for code quality and style issues.
