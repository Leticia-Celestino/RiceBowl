import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login'; 
import { Upload } from './pages/Upload';
import { Profile } from './pages/Profile';
import { CommandPalette } from './components/ui/CommandPalette'; 
import { FastfetchBoot } from './components/ui/FastfetchBoot';
import { RequireAuth } from './features/auth/RequireAuth';
import { useAuth } from './features/auth/useAuth';

function App() {
  const hydrate = useAuth(state => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <>
      <FastfetchBoot />
      <CommandPalette /> 

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Home />} />
          <Route element={<RequireAuth />}>
            <Route path="/upload" element={<Upload />} />
          </Route>
          {/* Mude aqui para capturar o nickname */}
          <Route path="/profile/:nickname" element={<Profile />} /> 
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
