import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Blogs } from './components/Blogs';
import CreateBlog from './components/pages/CreateBlog';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import SingleBlog from './components/pages/SingleBlog';
import Profile from './components/pages/Profile';
import MyProfile from './components/pages/MyProfile';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};


const App = () => {
  return (
    <main className="dark">
      <Navbar />
      <Routes>
        <Route path="/" element={<Blogs />} />
        <Route path="/posts/:id" element={<SingleBlog />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateBlog />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};

export default App;