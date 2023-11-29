const bcrypt = require('bcrypt');
const Carteirinhas = require('./Carteirinhas');
const jwt = require('jsonwebtoken');

class Usuario {
  constructor(usuarioId, db) {
    this.usuarioId = usuarioId;
    this.db = db;
    this.carteirinha = new Carteirinhas(usuarioId, db);
  }

  async set_password(password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.db.none('UPDATE usuarios SET password = $1 WHERE usuarioid = $2', [hashedPassword, this.usuarioId]);
  }

  async check_password(password) {
    const user = await this.db.one('SELECT * FROM usuarios WHERE usuarioid = $1', [this.usuarioId]);
    return await bcrypt.compare(password, user.password);
  }

  static async authenticate(db, email, password) {
    const user = await db.one('SELECT * FROM usuarios WHERE email = $1', [email]);
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (passwordMatches) {
      const token = jwt.sign({ id: user.usuarioid, nome: user.nome, admin: user.admin, email: user.email }, 'your_jwt_secret');
      return {token};
    } else {
      throw new Error('Senha incorreta');
    }
  }

  async find_by_email(email) {
    return await this.db.one('SELECT * FROM usuarios WHERE email = $1', [email]);
  }

  async solicitar_carteirinha() {
    await this.carteirinha.registrar_solicitacao();
  }

  async produzir_carteirinha() {
    await this.carteirinha.marcar_producao_como_concluida();
  }

  async enviar_carteirinha() {
    await this.carteirinha.marcar_envio_como_concluido();
  }

  static async registrar(db, usuario) {
    const hashedPassword = await bcrypt.hash(usuario.password, 10);
    await db.none('INSERT INTO usuarios (nome, email, telefone, endereco, password, dataregistro, statuscarteirinha, foto_perfil) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)', [usuario.nome, usuario.email, usuario.telefone, usuario.endereco, hashedPassword, 'Pendente', usuario.foto_perfil]);
  }
   static async get_usuarios_com_solicitacao(db) {
    return await db.many('select * from usuarios join carteirinhas on usuarios.usuarioid = carteirinhas.usuarioid ');
  }

  async salvarFotoPerfil(localImagem) {
    try {
      await this.db.none('UPDATE usuarios SET foto_perfil = $1 WHERE usuarioid = $2', [localImagem, this.usuarioId]);
    } catch (error) {
      console.error('Erro ao salvar a foto do perfil:', error);
      throw error;
    }
  }

  async buscarFotoPerfil() {
    try {
      const user = await this.db.one('SELECT foto_perfil FROM usuarios WHERE usuarioid = $1', [this.usuarioId]);
      return user.foto_perfil;
    } catch (error) {
      console.error('Erro ao buscar a foto do perfil:', error);
      throw error;
    }
  }
}

module.exports = Usuario;