import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import EditorForm from './EditorForm';

function Editor() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.userId;
  
      const res = await fetch(`http://localhost:3001/api/posts?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error('Error al cargar los posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este post?')) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No se encontró el token de autenticación');
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:3001/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar el post');
      }
  
      setPosts(posts.filter(post => post.id !== postId));
      setError('');
    } catch (err) {
      setError(err.message || 'Error al eliminar el post');
      console.error('Error al eliminar el post:', err);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar TODOS los posts? Esta acción no se puede deshacer.')) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No se encontró el token de autenticación');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/posts', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar los posts');
      }

      setPosts([]);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al eliminar los posts');
      console.error('Error al eliminar todos los posts:', err);
    }
  };

  if (loading) return <div className="container mt-5">Cargando...</div>;
  if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;

  return (
    <Routes>
      <Route path="/new" element={<EditorForm onPostCreated={fetchPosts} />} />
      <Route path="/:id" element={<EditorForm onPostUpdated={fetchPosts} />} />
      <Route path="/" element={
        <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mis Posts</h2>
        <div>
          <button
            className="btn btn-primary me-2"
            onClick={() => navigate('/editor/new')}
          >
            Nuevo Post
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDeleteAll}
            disabled={posts.length === 0}
          >
            Borrar Todos
          </button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Título</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td>{post.titulo}</td>
                <td>{post.descripcion}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => navigate(`/editor/${post.id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(post.id)}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {posts.length === 0 && (
        <div className="alert alert-info">No hay posts para mostrar.</div>
      )}
    </div>
      } />
    </Routes>
  );
}

export default Editor;