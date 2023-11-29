const express = require('express');
const pgp = require('pg-promise')();
const Usuario = require('./Usuario');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const db = pgp(process.env.DATABASE_URL);
const PORT = 8000
const HOST = '0.0.0.0'
const app = express();

app.use(cors({
    origin: '*'
}));
app.use(express.json());


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); 
  }
});

const upload = multer({ storage: storage });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


app.post('/register', upload.single('foto'), async (req, res) => {
  try {
    const { nome, email, telefone, endereco, password } = req.body;
    await Usuario.registrar(db, { nome, email, telefone, endereco, password, foto_perfil: req.file.path });
    res.status(201).send('Usuário registrado com sucesso');
  } catch (error) {
    console.error('Erro ao realizar o cadastro:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.post('/login', async (req, res) => {
  try {
    const token = await Usuario.authenticate(db, req.body.email, req.body.password);
    res.send(token);
  } catch (err) {
    res.status(401).send(err.message);
  }
});

app.post('/solicitar_carteirinha', authenticateToken, async (req, res) => {
  try {
    const usuario = new Usuario(req.user.id, db);
    await usuario.solicitar_carteirinha();
    res.status(200).send('Solicitação de carteirinha registrada com sucesso');
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'Erro ao registrar a solicitação de carteirinha: ' + error.message });}
});

app.get('/usuarios',  async (req, res) => {
    const usuarios = await Usuario.get_usuarios_com_solicitacao(db);
    res.send(usuarios);
    })

app.post('/produzir_carteirinha/:id', async (req, res) => {
  try {
    console.log(req.params.id)
    const usuario = new Usuario(req.params.id, db); 
    await usuario.produzir_carteirinha();
    res.status(200).send('Produção de carteirinha registrada com sucesso');
  } catch (error) {
    res.status(500).send('Erro ao registrar a produção de carteirinha: ' + error.message);
  }
});

app.post('/enviar_carteirinha/:id', async (req, res) => {
  try {
    const usuario = new Usuario(req.params.id, db); 
    await usuario.enviar_carteirinha();
    res.status(200).send('Envio de carteirinha registrado com sucesso');
  } catch (error) {
    res.status(500).send('Erro ao registrar o envio de carteirinha: ' + error.message);
  }
});


app.post('/perfil', authenticateToken, upload.single('foto'), async (req, res) => {
  try {
    const usuario = new Usuario(req.user.id, db); 
    await usuario.salvarFotoPerfil(req.file.path);
    res.status(200).send('Foto de perfil enviada com sucesso');
  } catch (error) {
    res.status(500).send('Erro ao enviar a foto do perfil: ' + error.message);
  }
});

app.get('/perfil/:id/foto', async (req, res) => {
  try {
    const usuario = new Usuario(req.params.id, db); 
    const fotoPerfil = await usuario.buscarFotoPerfil();

    
    const caminhoImagem = path.join('/usr/src/app/', fotoPerfil);

    
    res.download(caminhoImagem);
  } catch (error) {
    res.status(500).send('Erro ao buscar a foto do perfil: ' + error.message);
  }
});

app.listen(PORT, HOST, () => console.log('Servidor rodando na porta 8000'));