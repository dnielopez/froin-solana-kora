// URL por defecto donde corre el servidor local de Kora
const KORA_RPC_URL = "http://localhost:8080";

async function testKoraServer() {
  // Construcción del cuerpo JSON-RPC 2.0 estándar que espera Kora
  const jsonRpcPayload = {
    jsonrpc: "2.0",
    id: 1,
    method: "get_status", // Método común para verificar la salud del nodo Kora
    params: [],
  };

  try {
    console.log(`Enviando petición de prueba a Kora en: ${KORA_RPC_URL}...`);

    const response = await fetch(KORA_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Descomenta la línea de abajo si tu servidor requiere API Key o HMAC
        // 'Authorization': 'Bearer TU_API_KEY_DE_KORA'
      },
      body: JSON.stringify(jsonRpcPayload),
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor HTTP: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("\n✅ Respuesta recibida exitosamente del servidor Kora:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("\n❌ Error al intentar conectar con el servidor Kora:");
    console.error(error.message);
  }
}

// Ejecutar la prueba
testKoraServer();
