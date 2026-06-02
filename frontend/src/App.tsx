import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login'; 
import { Upload } from './pages/Upload';
import { Profile } from './pages/Profile';
import { CommandPalette } from './components/ui/CommandPalette'; 
import { FastfetchBoot } from './components/ui/FastfetchBoot';


const ExplorePlaceholder = () => <div className="text-gruvbox-primary font-mono text-xl">$ grep -r "minimalist" /rices</div>;

function App() {
  return (
    <>
      <FastfetchBoot />
      <CommandPalette /> 

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<ExplorePlaceholder />} />
          <Route path="/upload" element={<Upload />} /> 
          {/* Mude aqui para capturar o nickname */}
          <Route path="/profile/:nickname" element={<Profile />} /> 
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;