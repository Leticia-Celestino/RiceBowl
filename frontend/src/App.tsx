import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Login } from './pages/Login'; 
import { Upload } from './pages/Upload';
import { Profile } from './pages/Profile';
import { CommandPalette } from './components/ui/CommandPalette'; 
import { RequireAuth } from './features/auth/RequireAuth';
import { useAuth } from './features/auth/useAuth';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { SecuritySettings } from './pages/SecuritySettings';

function App() {
  const hydrate = useAuth(state => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <>
      <CommandPalette /> 

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route element={<RequireAuth />}>
            <Route path="/upload" element={<Upload />} />
            <Route path="/settings/security" element={<SecuritySettings />} />
          </Route>
          {/* Mude aqui para capturar o nickname */}
          <Route path="/profile/:nickname" element={<Profile />} /> 
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </>
  );
}

export default App;
