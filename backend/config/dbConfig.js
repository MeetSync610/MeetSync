//  # datos de conexión MSSQL
module.exports = {
  server: "localhost",               // 👈 Usar localhost
  port: 1433,
  database: "MeetSyncDB",
  user: "Dev",                       // 👈 Usuario SQL Server
  password: "MeetSync1029",          // 👈 Contraseña SQL Server
  options: {
    encrypt: true,                   // 👈 Cambiar a true porque en SSMS está "Mandatory"
    trustServerCertificate: true,    // 👈 Mantener como true
    enableArithAbort: true,          // 👈 Opción adicional para estabilidad
    connectionTimeout: 30000,        // 👈 Aumentar timeout
    requestTimeout: 30000            // 👈 Aumentar timeout
  }
};