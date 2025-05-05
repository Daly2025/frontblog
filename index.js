import express from 'express';
import cors from 'cors';
const jwt = require('jsonwebtoken');  // Añadir al inicio del archivo

const app = express();

app.use(cors());
app.use(express.json());

// API routes
// In-memory data store
let posts = [];

// CRUD operations
app.get('/api/posts', (req, res) => {
  const userId = req.query.userId;
  
  if (userId) {
    const userPosts = posts.filter(post => post.userId === userId);
    return res.json(userPosts);
  }
  
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  const newPost = req.body;
  newPost._id = Date.now().toString();
  posts.push(newPost);
  res.status(201).json(newPost);
});

app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p._id === req.params.id);
  if (!post) return res.status(404).json({ message: 'Post no encontrado' });
  res.json(post);
});

app.put('/api/posts/:id', (req, res) => {
  const index = posts.findIndex(p => p._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Post no encontrado' });
  posts[index] = { ...posts[index], ...req.body };
  res.json(posts[index]);
});

app.delete('/api/posts/:id', (req, res) => {
  const index = posts.findIndex(p => p.id === req.params.id);  // Cambiado de _id a id
  if (index === -1) return res.status(404).json({ message: 'Post no encontrado' });
  posts.splice(index, 1);
  res.sendStatus(204);
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Verificar credenciales (esto es solo un ejemplo)
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Crear token con el ID del usuario
  const token = jwt.sign(
    { id: user.id },  // Cambiado de userId a id
    'tu_secreto',        
    { expiresIn: '1h' }   
  );

  res.json({ token });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});