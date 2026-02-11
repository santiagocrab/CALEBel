import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Register from "./pages/Register";
import MatchResult from "./pages/MatchResult";
import ChatChamber from "./pages/ChatChamber";
import PostChat from "./pages/PostChat";
import RevealResult from "./pages/RevealResult";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/register" element={<Register />} />
          <Route path="/match" element={<MatchResult />} />
          <Route path="/chat" element={<ChatChamber />} />
          <Route path="/post-chat" element={<PostChat />} />
          <Route path="/reveal" element={<RevealResult />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
