import { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Editor from './Editor';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 px-3">
        {!isAuthenticated ? (
          <>
            <Link to="/register" className="btn btn-link">Registro</Link>
            <Link to="/login" className="btn btn-link">Login</Link>
          </>
        ) : (
          <>
            <Link to="/editor" className="btn btn-link">Mis Posts</Link>
            <button onClick={handleLogout} className="btn btn-link">Cerrar Sesión</button>
          </>
        )}
      </nav>
      <Routes>
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/editor" />} />
        <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/editor" />} />
        <Route path="/editor/*" element={isAuthenticated ? <Editor /> : <Navigate to="/login" />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/editor" /> : 
          <div className="container text-center mt-5">
            <h1>Bienvenido a la app</h1>
            <p>Usa el menú para registrarte o iniciar sesión.</p>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
