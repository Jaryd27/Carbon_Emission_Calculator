// server/db.js  (ESM)
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'amp.nrgeneration.com',
  user: 'GHG_Calculator',
  password: 'nrg3n3r@t!on',
  database: 'GHG_Data',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
