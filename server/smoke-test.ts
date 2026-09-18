// smoke-test.ts
import {
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
} from "@solana/web3.js";

async function testKora() {
  const connection = new Connection("https://api.devnet.solana.com");
  // Usuario dummy que no tiene SOL para pagar gas
  const dummyUser = Keypair.generate();

  // Transacción dummy: el usuario se transfiere 0 SOL a sí mismo
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: dummyUser.publicKey,
      toPubkey: dummyUser.publicKey,
      lamports: 0,
    }),
  );

  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  // Ponemos la pubkey de tu MAIN SIGNER como el que pagará el gas
  // (es la pubkey que derivamos de tu fee-payer-keypair.json)
  const feePayerPubkey = "oKwdt6pPhZGCmfnb5UKoCwtRoMWLCUhrymAGLm8mkxH";
  tx.feePayer = new PublicKey(feePayerPubkey);

  // El usuario dummy firma la instrucción
  tx.sign(dummyUser);

  // Serializamos la transacción
  const serializedTx = tx
    .serialize({ requireAllSignatures: false })
    .toString("base64");

  console.log("Enviando TX a Kora...");
  //   console.log("Serialized TX:", serializedTx);

  // Le pedimos a Kora que la co-firme y la mande a la red
  const response = await fetch("http://localhost:8080", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getConfig",
      params: {
        transaction: serializedTx,
      },
    }),
  });

  //   const textj = await response.json();
  // console.log("Respuesta response:", String(response.statusText));
  const text = await response.text();
  console.log("Respuesta cruda de Kora:", text);
  try {
    const data = JSON.parse(text);
    console.log("JSON Parseado:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("No era JSON válido.");
  }
}

testKora();
