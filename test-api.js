import http from 'http';
const body = JSON.stringify({ motivo: 'Teste cancelamento' });
const req = http.request({
  hostname: 'localhost',
  port: 5173,
  path: '/api/v1/minhas-candidaturas/01a06fed-fd1e-71df-baf5-633643434f39',
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    // Need cookie? The user's request showed: XHRDELETE http://localhost:5173/api/v1/minhas-candidaturas/...
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, '\nBody:', data));
});
req.write(body);
req.end();
