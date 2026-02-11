import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import VerifyEmail from "./pages/VerifyEmail";
import FindingMatch from "./pages/FindingMatch";
import MatchResult from "./pages/MatchResult";
import ChatChamber from "./pages/ChatChamber";
import PostChat from "./pages/PostChat";
import RevealResult from "./pages/RevealResult";
import NotFound from "./pages/NotFound";
import NoPartner from "./pages/NoPartner";
import TestSetup from "./pages/TestSetup";
import ChatDebug from "./pages/ChatDebug";
import Admin from "./pages/Admin";
import Rematch from "./pages/Rematch";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<><Navbar /><Home /></>} />
        <Route path="/how-it-works" element={<><Navbar /><HowItWorks /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />
        <Route path="/signin" element={<><Navbar /><SignIn /></>} />
        <Route path="/verify" element={<><Navbar /><VerifyEmail /></>} />
        <Route path="/finding-match" element={<><Navbar /><FindingMatch /></>} />
        <Route path="/match" element={<><Navbar /><MatchResult /></>} />
        <Route path="/chat" element={<><Navbar /><ChatChamber /></>} />
        <Route path="/post-chat" element={<><Navbar /><PostChat /></>} />
        <Route path="/reveal" element={<><Navbar /><RevealResult /></>} />
        <Route path="/no-partner" element={<><Navbar /><NoPartner /></>} />
            <Route path="/test-setup" element={<><Navbar /><TestSetup /></>} />
            <Route path="/chat-debug" element={<><Navbar /><ChatDebug /></>} />
            <Route path="/admin" element={<><Navbar /><Admin /></>} />
            <Route path="/rematch" element={<><Navbar /><Rematch /></>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
