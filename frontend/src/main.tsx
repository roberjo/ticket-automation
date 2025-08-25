/**
 * Main Application Entry Point
 * 
 * This file serves as the primary entry point for the React application.
 * It initializes the React application by creating a root container and
 * rendering the main App component into the DOM.
 * 
 * Purpose:
 * - Bootstrap the React application
 * - Set up the root DOM container
 * - Import global styles and main App component
 * - Initialize the application rendering process
 * 
 * Dependencies:
 * - React DOM for DOM manipulation
 * - Main App component for application structure
 * - Global CSS for application styling
 */

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a React root container and render the main App component
// This initializes the React application and mounts it to the DOM
// The root element with id "root" must exist in the HTML template
createRoot(document.getElementById("root")!).render(<App />);
