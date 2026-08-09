async function checkMethods() {
  const companyId = "019e1736-3b9d-712a-8cf8-6fa2edf05eaa";
  const addressId = "f4a4c263-7499-42a5-94a7-09d436ed5110";

  const tests = [
    { name: "PUT Company", url: `https://dev.ladesa.com.br/api/v1/empresas/${companyId}`, method: "PUT" },
    { name: "PATCH Company", url: `https://dev.ladesa.com.br/api/v1/empresas/${companyId}`, method: "PATCH" },
    { name: "PUT Address", url: `https://dev.ladesa.com.br/api/v1/enderecos/${addressId}`, method: "PUT" },
    { name: "PATCH Address", url: `https://dev.ladesa.com.br/api/v1/enderecos/${addressId}`, method: "PATCH" }
  ];

  for (const t of tests) {
    try {
      const res = await fetch(t.url, { method: t.method });
      console.log(`${t.name}: status ${res.status}`);
      if (res.status !== 401 && res.status !== 403 && res.status !== 404 && res.status !== 405) {
        const body = await res.json().catch(() => null);
        console.log("Body:", body);
      }
    } catch (e) {
      console.log(`${t.name} error:`, e.message);
    }
  }
}
checkMethods();
