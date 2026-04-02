import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import EventPage from "./pages/EventPage";
import Preferences from "./pages/Preferences";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/journalist/Dashboard";
import ArticleEditor from "./pages/journalist/ArticleEditor";
import JournalistOnboarding from "./pages/journalist/JournalistOnboarding";
import ArticlePage from "./pages/ArticlePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) => {
  const { user, loading, roles } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        Cargando...
      </div>
    );
  if (!user) return <Navigate to="/" replace />;
  // Check against the full roles array so dual-role users aren't blocked
  if (requiredRole && !roles.includes(requiredRole as "reader" | "journalist" | "admin"))
    return <Navigate to="/feed" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/feed" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/article/:id" element={<ProtectedRoute><ArticlePage /></ProtectedRoute>} />
            <Route path="/event/:id" element={<ProtectedRoute><EventPage /></ProtectedRoute>} />
            <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            {/* Journalist onboarding — accessible to any logged-in user */}
            <Route
              path="/journalist/onboarding"
              element={<ProtectedRoute><JournalistOnboarding /></ProtectedRoute>}
            />
            {/* Journalist-only routes */}
            <Route
              path="/journalist/dashboard"
              element={<ProtectedRoute requiredRole="journalist"><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/journalist/editor"
              element={<ProtectedRoute requiredRole="journalist"><ArticleEditor /></ProtectedRoute>}
            />
            <Route
              path="/journalist/editor/:id"
              element={<ProtectedRoute requiredRole="journalist"><ArticleEditor /></ProtectedRoute>}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
