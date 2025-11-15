import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import { useState } from 'react';
import { getLocalItem } from './helper/localStorage.helper';
import Dashboard from './pages/dashboard';
import ProtectedRoute from './components/protectedRoute';

const App = () => {
    const [authPayload, setAuthPayload] = useState<string | null>(
        getLocalItem('auth_payload')
    );
    const isAuthenticated = Boolean(authPayload);

    return (
        <BrowserRouter>
            <div className="flex h-full w-screen bg-slate-900">
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <Login
                                isAuthenticated={isAuthenticated}
                                onLoginSuccess={() =>
                                    setAuthPayload(getLocalItem('auth_payload'))
                                }
                            />
                        }
                    />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default App;
