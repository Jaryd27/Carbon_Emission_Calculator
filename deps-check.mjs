import express from 'express';
import mysql from 'mysql2/promise';

console.log('Express OK:', typeof express === 'function');
console.log('MySQL2 OK:', typeof mysql.createPool === 'function');

// Try a minimal pool create (no connect) just to ensure the method exists:
const pool = mysql.createPool({ host: 'localhost', user: 'root', database: 'test', password: 'x', waitForConnections: true, connectionLimit: 1 });
console.log('Pool created:', typeof pool.getConnection === 'function');

// Optional: ensure your Node sees ES modules properly
console.log('ESM mode:', import.meta.url ? 'yes' : 'no');
