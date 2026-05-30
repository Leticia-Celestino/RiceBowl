import { Button } from './components/ui/Button'
import { Input } from './components/ui/Input'
import { Textarea } from './components/ui/Textarea'
import { GlassPanel } from './components/ui/GlassPanel'
import { Tag } from './components/ui/Tag'
import { Avatar } from './components/ui/Avatar'
import { Loader } from './components/ui/Loader'
import { Terminal } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      
      <GlassPanel className="w-full max-w-2xl p-6 flex flex-col gap-8">
        
        {/* Cabeçalho do Teste */}
        <div className="flex items-center justify-between border-b border-gruvbox-gray/20 pb-4">
          <div className="flex items-center gap-3">
            <Terminal className="text-gruvbox-primary" size={24} />
            <h1 className="text-xl font-sans font-bold">1,2,3 Testanto os componentes</h1>
          </div>
          <Loader />
        </div>

        {/* Avatares e Tags */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-mono text-gruvbox-gray">Componentes Visuais</h2>
          <div className="flex items-center gap-4">
            <Avatar alt="Letícia" size="lg" />
            <Avatar src="https://github.com/torvalds.png" alt="Linus" size="md" />
            <div className="flex gap-2 ml-4">
              <Tag label="arch" />
              <Tag label="hyprland" />
              <Tag label="gruvbox" />
            </div>
          </div>
        </div>

        {/* Formulários */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-mono text-gruvbox-gray">Inputs e Textarea</h2>
          <Input label="Título do Rice" placeholder="Ex: Cozy Arch Setup" />
          <Textarea label="Descrição Detalhada" placeholder="Conte sobre suas configurações de Neovim..." />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gruvbox-gray/20">
          <Button variant="ghost">Cancelar</Button>
          <Button variant="danger">Deletar</Button>
          <Button>Salvar Componentes</Button>
        </div>

      </GlassPanel>
      
    </div>
  )
}

export default App