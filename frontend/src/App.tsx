import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';

// Placeholders rápidos para podermos testar o menu antes de criarmos as páginas finais
const UploadPlaceholder = () => <div className="text-gruvbox-primary font-mono text-xl">$ ./upload_rice.sh</div>;
const ExplorePlaceholder = () => <div className="text-gruvbox-primary font-mono text-xl">$ grep -r "minimalist" /rices</div>;
const LoginPlaceholder = () => <div className="text-gruvbox-primary font-mono text-xl">$ sudo su - login</div>;

function App() {
  return (
    <Routes>
      {/* Rotas DENTRO do Layout da Sidebar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<ExplorePlaceholder />} />
        <Route path="/upload" element={<UploadPlaceholder />} />
      </Route>

      {/* Rota de Login (Fica FORA da Sidebar, ocupando a tela toda) */}
      <Route path="/login" element={<LoginPlaceholder />} />
    </Routes>
  );
}

export default App;