// index.ts
import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { AddressInfo } from 'net';
import { QueryBuilder } from 'knex';
import connection from './connection';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const app = express();

app.use(express.json());
app.use(cors());


app.post('/signup', async (req: Request, res: Response) => {
  const { username, password, role } = req.body;

  try {
    // Verifica se o usuário já existe
    const existingUser = await connection('users').where({ username }).first();

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Criptografa a senha antes de armazenar no banco de dados
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insere o novo usuário no banco de dados
    const newUser = await connection('users').insert({
      username,
      password: hashedPassword,
      role,
    }).returning('*');

    res.status(201).json({
      id: newUser[0].id,
      username: newUser[0].username,
      role: newUser[0].role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await connection('users').where({ username }).first();

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'secret');

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/musica', async (req: Request, res: Response) => {
  const { titulo, artista } = req.body;
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const newMusica = await connection('musica').insert({
      titulo,
      artista,
    }).returning('*');

    res.status(201).json({
      id: newMusica[0].id,
      titulo: newMusica[0].titulo,
      artista: newMusica[0].artista,
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/musicas', async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const { filter, page = '1', limit = '10', order = 'asc' } = req.query;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    let query = connection('musica').select('*');

    if (filter && typeof filter === 'string') {
      query = query.where('titulo', 'like', `%${filter}%`);
    }

    if (order && (order === 'asc' || order === 'desc')) {
      query = query.orderBy('titulo', order);
    }

    const musicas = await query.limit(Number(limit)).offset((Number(page) - 1) * Number(limit));

    res.status(200).json(musicas);
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/playlist', async (req: Request, res: Response) => {
  const { nome, descricao, criador } = req.body;
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const newPlaylist = await connection('playlist').insert({
      nome,
      descricao,
      criador,
    }).returning('*');

    res.status(201).json({
      id: newPlaylist[0].id,
      nome: newPlaylist[0].nome,
      descricao: newPlaylist[0].descricao,
      criador: newPlaylist[0].criador,
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/playlist/:id/musica', async (req: Request, res: Response) => {
  const { musica_id } = req.body;
  const { id: playlist_id } = req.params;
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const newPlaylistMusica = await connection('playlist_musica').insert({
      playlist_id,
      musica_id,
    }).returning('*');

    res.status(201).json({
      playlist_id: newPlaylistMusica[0].playlist_id,
      musica_id: newPlaylistMusica[0].musica_id,
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/playlists', async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const { filter, page = '1', limit = '10', order = 'asc' } = req.query;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    let query = connection('playlist').select('*');

    if (filter && typeof filter === 'string') {
      query = query.where('nome', 'like', `%${filter}%`);
    }

    if (order && (order === 'asc' || order === 'desc')) {
      query = query.orderBy('nome', order);
    }

    const playlists = await query.limit(Number(limit)).offset((Number(page) - 1) * Number(limit));

    res.status(200).json(playlists);
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/playlist/:id/musicas', async (req: Request, res: Response) => {
  const { id: playlist_id } = req.params;
  const token = req.headers.authorization;
  const { filter, page = '1', limit = '10', order = 'asc' } = req.query;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    let query = connection('playlist_musica')
      .join('musica', 'playlist_musica.musica_id', 'musica.id')
      .where('playlist_id', playlist_id)
      .select('musica.*');

    if (filter && typeof filter === 'string') {
      query = query.where('musica.titulo', 'like', `%${filter}%`);
    }

    if (order && (order === 'asc' || order === 'desc')) {
      query = query.orderBy('musica.titulo', order);
    }

    const musicas = await query.limit(Number(limit)).offset((Number(page) - 1) * Number(limit));

    res.status(200).json(musicas);
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/playlist/:playlist_id/musica/:musica_id', async (req: Request, res: Response) => {
  const { playlist_id, musica_id } = req.params;
  const { titulo, artista} = req.body;
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    await connection('musica')
      .where('id', musica_id)
      .update({
        titulo,
        artista
      });

    res.status(200).json({ message: 'Música atualizada com sucesso.' });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/playlist/:playlist_id/musica/:musica_id', async (req: Request, res: Response) => {
  const { playlist_id, musica_id } = req.params;
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    await connection('playlist_musica')
      .where({
        playlist_id,
        musica_id
      })
      .delete();

    res.status(200).json({ message: 'Música deletada da playlist com sucesso.' });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const server = app.listen(process.env.PORT || 3003, () => {
  if (server) {
    const address = server.address() as AddressInfo;
    console.log(`Server is running in http://localhost:${address.port}`);
  } else {
    console.error(`Failure upon starting server.`);
  }
});
