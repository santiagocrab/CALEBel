import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/signin", { replace: true });
    }
  }, [navigate]);

  if (!isAuthenticated()) {
    return null; // Don't render children if not authenticated
  }

  return <>{children}</>;
}
