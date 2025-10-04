const sql = require("mssql");
const dbConfig = require("../config/dbConfig.js");

let pool;

async function conectar() {
  try {
    console.log("Intentando conectar a SQL Server...");
    console.log("Configuración:", {
      server: dbConfig.server,
      database: dbConfig.database,
      instanceName: dbConfig.options.instanceName,
      port: dbConfig.port
    });

    pool = await sql.connect(dbConfig);
    console.log("Conectado a SQL Server exitosamente");
    console.log("Pool de conexiones creado");

    return pool;
  } catch (err) {
    console.error("Error de conexión:");
    console.error("Detalles del error:", err.message);
    throw err;
  }
}

module.exports = {
  sql,
  conectar,
};
