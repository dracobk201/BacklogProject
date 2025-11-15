import { Navigate } from 'react-router-dom';
import { getLocalItem } from '../helper/localStorage.helper';
import type { LoginResponse, UserRole } from '../types/auth';

interface ProtectedRouteProps {
    isAuthenticated: boolean;
    allowedRoles?: UserRole[];
    children: React.ReactNode;
}

const ProtectedRoute = ({
    isAuthenticated,
    allowedRoles,
    children
}: ProtectedRouteProps) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const authPayloadStr = getLocalItem('auth_payload');
        let role: string | undefined;
        try {
            if (authPayloadStr) {
                const parsed = JSON.parse(authPayloadStr) as LoginResponse;
                role = (parsed.user.role || '').toLowerCase();
            }
        } catch {
            // ignore
        }
        if (!role || !allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
