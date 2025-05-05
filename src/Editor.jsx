import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import EditorForm from './EditorForm';

function Editor() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

  const handleDelete = async (postId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este post?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Error al eliminar el post');
      setPosts(posts.filter(post => post._id !== postId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="container mt-5">Cargando...</div>;
  if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;

  return (
    <Routes>
      <Route path="/new" element={<EditorForm />} />
      <Route path="/:id" element={<EditorForm />} />
      <Route path="/" element={
        <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mis Posts</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/editor/new')}
        >
          Nuevo Post
        </button>
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
              <tr key={post._id}>
                <td>{post.titulo}</td>
                <td>{post.descripcion}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => navigate(`/editor/${post._id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(post._id)}
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