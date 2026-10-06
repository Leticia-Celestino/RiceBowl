import { Filter, Search } from 'lucide-react';

interface RiceFiltersProps {
    search: string;
    distro: string;
    windowManager: string;
    onSearchChange: (value: string) => void;
    onDistroChange: (value: string) => void;
    onWindowManagerChange: (value: string) => void;
}

const distros = ['Arch Linux', 'Ubuntu', 'Fedora', 'Debian', 'Zorin'];
const windowManagers = ['Hyprland', 'i3wm', 'GNOME', 'KDE Plasma', 'bspwm'];

export function RiceFilters({
    search,
    distro,
    windowManager,
    onSearchChange,
    onDistroChange,
    onWindowManagerChange,
}: RiceFiltersProps) {
    return (
        <section aria-label="Filtros do feed" className="sticky top-3 z-10 flex flex-col items-center gap-3 rounded-2xl border border-gruvbox-gray/15 bg-gruvbox-panel/85 p-3 shadow-xl backdrop-blur-xl md:flex-row">
            <label className="relative w-full flex-grow">
                <span className="sr-only">Buscar setups</span>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-gray" size={18} aria-hidden="true" />
                <input
                    type="search"
                    placeholder="Buscar por título, descrição ou ferramenta"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="w-full rounded-xl border border-transparent bg-gruvbox-bg/60 py-3 pl-10 pr-4 text-sm text-gruvbox-fg transition-colors placeholder:text-gruvbox-gray/50 focus:border-gruvbox-primary focus:outline-none"
                />
            </label>

            <div className="flex w-full gap-2 md:w-auto">
                <FilterSelect label="Filtrar por distribuição" value={distro} options={distros} emptyLabel="Qualquer distro" onChange={onDistroChange} />
                <FilterSelect label="Filtrar por ambiente gráfico" value={windowManager} options={windowManagers} emptyLabel="Qualquer WM/DE" onChange={onWindowManagerChange} />
            </div>
        </section>
    );
}

interface FilterSelectProps {
    label: string;
    value: string;
    options: string[];
    emptyLabel: string;
    onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, emptyLabel, onChange }: FilterSelectProps) {
    return (
        <label className="relative min-w-0 flex-1 md:flex-none">
            <span className="sr-only">{label}</span>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-gray" size={16} aria-hidden="true" />
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-transparent bg-gruvbox-bg/60 py-3 pl-9 pr-8 text-sm text-gruvbox-fg transition-colors focus:border-gruvbox-primary focus:outline-none"
            >
                <option value="">{emptyLabel}</option>
                {options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
        </label>
    );
}
