async function test() {
  try {
    const res = await fetch("https://dev.ladesa.com.br/api/v1/estagios?limit=100");
    const json = await res.json();
    console.log(`Total stages in API:`, json.data ? json.data.length : "unknown");
    if (json.data && json.data.length > 0) {
      console.log("Sample stage item:", JSON.stringify(json.data[0], null, 2));
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
