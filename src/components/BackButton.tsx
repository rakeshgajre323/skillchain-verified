import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Floating back button shown in the top-left of the screen on every route
 * except the home page. Uses browser history when available, otherwise
 * falls back to navigating to the home page.
 */
export function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/") return null;

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      aria-label="Go back"
      className="fixed top-20 left-4 z-50 shadow-md backdrop-blur bg-background/80"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      Back
    </Button>
  );
}
