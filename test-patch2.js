import http from 'http';
const body = JSON.stringify({ situacao: 'CANCELLED', motivo: 'Teste' });
const req = http.request({
  hostname: 'localhost',
  port: 5173,
  path: '/api/v1/minhas-candidaturas/01a06fed-fd1e-71df-baf5-633643434f39',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  }
}, (res) => {
  console.log('Status:', res.statusCode);
});
req.write(body);
req.end();
