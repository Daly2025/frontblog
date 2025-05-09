import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function EditorForm({ onPostCreated, onPostUpdated }) {
  const [form, setForm] = useState({ title: '', description: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Error al cargar el post');
      const data = await res.json();
      setForm(data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const validatedForm = {
      title: form.title.trim(),
      description: form.description.trim(),
      content: form.content.trim()
    };

    if (!validatedForm.title || !validatedForm.description || !validatedForm.content) {
      throw new Error('Todos los campos son requeridos');
    }

    if (validatedForm.title.length < 3) {
      throw new Error('El título debe tener al menos 3 caracteres');
    }

    if (validatedForm.description.length < 10) {
      throw new Error('La descripción debe tener al menos 10 caracteres');
    }

    if (validatedForm.content.length < 20) {
      throw new Error('El contenido debe tener al menos 20 caracteres');
    }

    return validatedForm;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);  // Iniciar el estado de carga
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
    
      // Verificar y decodificar el token
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Token inválido');
      }
      
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      if (!decodedToken || !decodedToken.id) {
        throw new Error('Token no contiene información del usuario');
      }
      const userId = decodedToken.id;
    
      let validatedForm;
      try {
        validatedForm = validateForm();
      } catch (validationError) {
        setError(validationError.message);
        setLoading(false);  // Detener el estado de carga si hay error de validación
        return;
      }
      
      const url = id
        ? `http://localhost:3001/api/posts/${id}`
        : 'http://localhost:3001/api/posts';
      const method = id ? 'PUT' : 'POST';
    
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo: validatedForm.title,
          descripcion: validatedForm.description,
          contenido: validatedForm.content,
          userId: userId
        }),
      });
    
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }
    
      // Llamar a la función de actualización correspondiente
      if (id) {
        onPostUpdated?.();
      } else {
        onPostCreated?.();
      }
      
      navigate('/editor');
    } catch (err) {
      setError(err.message);
      console.error('Error al crear/actualizar el post:', err);
    } finally {
      setLoading(false);  // Asegurar que el estado de carga se detenga
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">{id ? 'Editar Post' : 'Nuevo Post'}</h2>
      {loading && <div className="alert alert-info">Guardando cambios...</div>}
      <form onSubmit={handleSubmit} className="border p-4 rounded bg-light">
        <div className="mb-3">
          <label className="form-label">Título</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea
            name="description"
            className="form-control"
            value={form.description}
            onChange={handleChange}
            rows="2"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Contenido</label>
          <textarea
            name="content"
            className="form-control"
            value={form.content}
            onChange={handleChange}
            rows="10"
            required
          />
        </div>
        {error && <div className="alert alert-danger mb-3">{error}</div>}
        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/editor')}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {id ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditorForm;