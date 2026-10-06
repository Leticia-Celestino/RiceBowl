import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../components/layout/AppSidebar';

export function MainLayout() {
    return (
        <div className="min-h-screen bg-gruvbox-bg">
            <AppSidebar />
            <main className="min-h-screen pb-24 sm:ml-64 sm:pb-0">
                <Outlet />
            </main>
        </div>
    );
}
