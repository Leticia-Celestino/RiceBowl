import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function RequireAuth() {
    const isAuthenticated = useAuth(state => state.isAuthenticated);
    const isHydrating = useAuth(state => state.isHydrating);
    const location = useLocation();

    if (isHydrating) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}
