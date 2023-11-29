class Carteirinhas {
  constructor(usuarioId, db) {
    this.usuarioId = usuarioId;
    this.db = db;
  }

  async marcar_producao_como_concluida() {
    await this.db.none('UPDATE carteirinhas SET produzida = true, dataproducao = NOW() WHERE usuarioid = $1', [this.usuarioId]);
  }

  async marcar_envio_como_concluido() {
    await this.db.none('UPDATE carteirinhas SET enviada = true, dataenvio = NOW() WHERE usuarioid = $1', [this.usuarioId]);
  }

  async registrar_solicitacao() {
    const hasSolicitacao = await this.db.oneOrNone('SELECT * FROM carteirinhas WHERE usuarioid = $1', [this.usuarioId]);
    if (hasSolicitacao) {
      throw new Error('Já existe uma solicitação de carteirinha para este usuário');
    }
    await this.db.none('INSERT INTO carteirinhas (usuarioid, datasolicitacao, produzida, enviada) VALUES ($1, NOW(), false, false)', [this.usuarioId]);
  }
}

module.exports = Carteirinhas;