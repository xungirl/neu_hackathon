import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatAssistant from './components/ChatAssistant';
import Home from './pages/Home';
import Matching from './pages/Matching';
import Adoption from './pages/Adoption';
import PetDetails from './pages/PetDetails';
import PostPet from './pages/PostPet';
import Login from './pages/Login';
import Register from './pages/Register';

const LostFound = lazy(() => import('./pages/LostFound'));

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth pages — no Navbar/Footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main app layout */}
          <Route path="/*" element={
            <div className="min-h-screen flex flex-col bg-gray-50 font-body">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/match" element={<Matching />} />
                <Route path="/lost-found" element={<Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div></div>}><LostFound /></Suspense>} />
                <Route path="/adoption" element={<Adoption />} />
                <Route path="/adoption/:id" element={<PetDetails />} />
                <Route path="/post" element={<PostPet />} />
              </Routes>
              <Footer />
              <ChatAssistant />
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
