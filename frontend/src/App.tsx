/**
 * Main Application Component
 * 
 * This component serves as the root component of the React application.
 * It sets up the application's provider hierarchy, routing configuration,
 * and global UI components that are available throughout the application.
 * 
 * Purpose:
 * - Configure application-wide providers and context
 * - Set up client-side routing with React Router
 * - Provide global UI components (toasters, tooltips)
 * - Define the application's page structure and navigation
 * 
 * Provider Hierarchy:
 * 1. QueryClientProvider - For React Query state management
 * 2. TooltipProvider - For tooltip functionality
 * 3. BrowserRouter - For client-side routing
 * 4. AppLayout - For consistent application layout
 * 
 * Routing Structure:
 * - Dashboard: Main application dashboard (/)
 * - Tasks: Task management page (/tasks)
 * - Tickets: ServiceNow ticket management (/tickets)
 * - Users: User management page (/users)
 * - Reports: Analytics and reporting (/reports)
 * - Settings: Application configuration (/settings)
 * - NotFound: 404 error page (catch-all route)
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Tickets from "./pages/Tickets";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Create a QueryClient instance for React Query
// This manages server state, caching, and data synchronization
const queryClient = new QueryClient();

/**
 * Main App Component
 * 
 * Renders the complete application with all necessary providers and routing.
 * The component structure follows a provider pattern where each provider
 * wraps the components that need access to its functionality.
 */
const App = () => (
  // QueryClientProvider: Provides React Query functionality for data fetching and caching
  <QueryClientProvider client={queryClient}>
    {/* TooltipProvider: Enables tooltip functionality throughout the application */}
    <TooltipProvider>
      {/* Global Toaster Components: Provide notification system */}
      <Toaster /> {/* Primary toast notifications */}
      <Sonner /> {/* Alternative toast notifications for different use cases */}
      
      {/* BrowserRouter: Enables client-side routing */}
      <BrowserRouter>
        {/* AppLayout: Provides consistent layout structure (header, sidebar, main content) */}
        <AppLayout>
          {/* Routes: Defines the application's page structure */}
          <Routes>
            {/* Dashboard Route: Main application dashboard - default landing page */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Task Management Route: Task creation, editing, and management */}
            <Route path="/tasks" element={<Tasks />} />
            
            {/* Ticket Management Route: ServiceNow ticket integration and management */}
            <Route path="/tickets" element={<Tickets />} />
            
            {/* User Management Route: User administration and role management */}
            <Route path="/users" element={<Users />} />
            
            {/* Reports Route: Analytics, metrics, and reporting functionality */}
            <Route path="/reports" element={<Reports />} />
            
            {/* Settings Route: Application configuration and preferences */}
            <Route path="/settings" element={<Settings />} />
            
            {/* Catch-all Route: Handles 404 errors and unknown routes */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
