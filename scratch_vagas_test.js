async function test() {
  const urls = [
    "https://dev.ladesa.com.br/api/v1/vagas",
    "https://dev.ladesa.com.br/api/v1/estagios",
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url + "?limit=5");
      console.log(`URL: ${url} -> Status: ${res.status}`);
      if (res.status === 200) {
        const json = await res.json();
        console.log(`Keys:`, Object.keys(json));
        if (json.data) {
          console.log(`Data count:`, json.data.length);
          console.log(`First item keys:`, json.data[0] ? Object.keys(json.data[0]) : "none");
        } else {
          console.log(`Data (no .data):`, Array.isArray(json) ? json.length : "object");
        }
      }
    } catch (e) {
      console.log(`URL: ${url} -> Error: ${e.message}`);
    }
  }
}
test();
