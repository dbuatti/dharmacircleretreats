import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import RetreatDetail from "./pages/RetreatDetail";
import PublicRegistration from "./pages/PublicRegistration";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { toast } from "sonner";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, isAdmin } = useSession();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e2a5e]"></div>
      </div>
    );
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    // Show a friendly access denied message
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-light text-[#1e2a5e] uppercase tracking-widest">Access Restricted</h1>
          <p className="text-gray-600 font-serif italic">
            This area is for authorized administrators only.
          </p>
          <p className="text-sm text-gray-500">
            Your email: <strong>{session.user?.email}</strong>
          </p>
          <button 
            onClick={() => window.location.href = 'mailto:dharmacircleretreats@gmail.com?subject=Admin Access Request'}
            className="text-[#1e2a5e] hover:underline text-sm"
          >
            Request Access
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="block w-full mt-4 px-4 py-2 bg-[#1e2a5e] text-white rounded-none uppercase tracking-[0.2em] text-[10px]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

const AdminOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, isAdmin } = useSession();

  useEffect(() => {
    if (!loading && session && !isAdmin) {
      toast.error('Admin access required');
    }
  }, [session, loading, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e2a5e]"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <SessionProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/retreat/:id" 
              element={
                <ProtectedRoute>
                  <RetreatDetail />
                </ProtectedRoute>
              } 
            />
            <Route path="/register/:id" element={<PublicRegistration />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </SessionProvider>
);

export default App;