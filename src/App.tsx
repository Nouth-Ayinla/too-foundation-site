import { BrowserRouter, Routes, Route } from "react-router-dom";
// React + Vite conversion
import Layout from "./components/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Impact from "./pages/Impact";
import GetInvolved from "./pages/GetInvolved";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Contact from "./pages/Contact";
import Donate from "./pages/Donate";
import Volunteer from "./pages/Volunteer";
import FAQ from "./pages/FAQ";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="about" element={<About />} />
          <Route path="impact" element={<Impact />} />
          <Route path="get-involved" element={<GetInvolved />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="events" element={<Events />} />
          <Route path="event/:slug" element={<EventDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="donate" element={<Donate />} />
          <Route path="volunteer" element={<Volunteer />} />
          <Route path="faq" element={<FAQ />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
