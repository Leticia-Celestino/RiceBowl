import type { ComponentType, InputHTMLAttributes } from 'react';
import type { LucideProps } from 'lucide-react';

interface FilePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    label: string;
    file: File | null;
    emptyLabel: string;
    icon: ComponentType<LucideProps>;
    accent?: 'primary' | 'accent';
    onChange: (file: File | null) => void;
}

export function FilePicker({ label, file, emptyLabel, icon: Icon, accent = 'primary', onChange, ...inputProps }: FilePickerProps) {
    const selectedClass = accent === 'accent'
        ? 'border-gruvbox-accent bg-gruvbox-accent/10 text-gruvbox-accent'
        : 'border-gruvbox-primary bg-gruvbox-primary/10 text-gruvbox-primary';

    return (
        <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase text-gruvbox-gray">{label}</span>
            <label className={`flex cursor-pointer items-center gap-3 rounded-md border border-dashed p-3 transition-colors ${
                file ? selectedClass : 'border-gruvbox-gray/30 text-gruvbox-gray hover:bg-gruvbox-gray/5'
            }`}>
                <Icon size={20} aria-hidden="true" />
                <span className="truncate font-sans text-sm">{file?.name ?? emptyLabel}</span>
                <input
                    {...inputProps}
                    type="file"
                    className="sr-only"
                    onChange={(event) => onChange(event.target.files?.[0] ?? null)}
                />
            </label>
        </div>
    );
}
