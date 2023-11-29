const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    nome: DataTypes.STRING,
    email: DataTypes.STRING,
    telefone: DataTypes.STRING,
    endereco: DataTypes.STRING,
    password: DataTypes.STRING,
    DataRegistro: DataTypes.DATE,
    StatusCarteirinha: DataTypes.STRING
  }, {});
  Usuario.associate = function(models) {
    Usuario.hasOne(models.Carteirinhas, { foreignKey: 'usuarioId', as: 'carteirinha' });
  };
  Usuario.prototype.set_password = async function(password) {
    this.password = await bcrypt.hash(password, 10);
    await this.save();
  };
  Usuario.prototype.check_password = async function(password) {
    return await bcrypt.compare(password, this.password);
  };
  return Usuario;
};