import http from 'http';
const req = http.request({
  hostname: 'localhost',
  port: 5173,
  path: '/api/v1/minhas-candidaturas/01a08269-1402-7549-8e20-cbb374475aa3?dataInscricao=2026-09-04T10:00:00.000Z',
  method: 'DELETE',
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, '\nBody:', data));
});
req.end();
