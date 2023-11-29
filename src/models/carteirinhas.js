module.exports = (sequelize, DataTypes) => {
  const Carteirinhas = sequelize.define('Carteirinhas', {
    usuarioId: DataTypes.INTEGER,
    DataSolicitacao: DataTypes.DATE,
    StatusSolicitacao: DataTypes.STRING,
    DataProducao: DataTypes.DATE,
    StatusProducao: DataTypes.STRING,
    DataEnvio: DataTypes.DATE,
    StatusEnvio: DataTypes.STRING
  }, {});
  Carteirinhas.associate = function(models) {
    Carteirinhas.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
  };
  return Carteirinhas;
};