import { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store';
import LoginPage from './presentation/pages/LoginPage';
import RegisterPage from './presentation/pages/RegisterPage';
import HomePage from './presentation/pages/HomePage';
import AboutPage from './presentation/pages/AboutPage';
import ContactPage from './presentation/pages/ContactPage';
import MainAdminDashboard from './presentation/pages/MainAdminDashboard';
import DistrictAdminDashboard from './presentation/pages/DistrictAdminDashboard';
import MemberDashboard from './presentation/pages/MemberDashboard';
import { UserRole } from './common/enums';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: UserRole[] }) => {
  // @ts-ignore
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const userRole = user?.role;

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <div>Access Denied</div>;
  }
  return children;
};

// Dashboard Dispatcher
const Dashboard = () => {
  // @ts-ignore - Assuming auth slice shape
  const { user } = useSelector((state: any) => state.auth);
  const role = user?.role;

  switch (role) {
    case UserRole.MAIN_ADMIN: return <MainAdminDashboard />;
    case UserRole.DISTRICT_ADMIN: return <DistrictAdminDashboard />;
    case UserRole.MEMBER: return <MemberDashboard />;
    default: return <div>Unknown Role or Not Authorized</div>;
  }
};

// Public Route Component (Redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  // @ts-ignore
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Routes (Always accessible) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth Routes (Accessible only if NOT logged in) */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/admin" element={<PublicRoute><LoginPage /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </Provider>
  );
}

export default App;
