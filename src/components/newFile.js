var createCredentialDefaultArgs = {
  publicKey: {
    // Relying Party (a.k.a. - Service):
    rp: {
      name: "Acme",
    },

    // User:
    user: {
      id: new Uint8Array(16),
      name: "john.p.smith@example.com",
      displayName: "John P. Smith",
    },

    pubKeyCredParams: [
      {
        type: "public-key",
        alg: -7,
      },
    ],

    attestation: "direct",

    timeout: 60000,

    challenge: new Uint8Array([
      // must be a cryptographically random number sent from a server
      0x8c, 0x0a, 0x26, 0xff, 0x22, 0x91, 0xc1, 0xe9, 0xb9, 0x4e, 0x2e, 0x17,
      0x1a, 0x98, 0x6a, 0x73, 0x71, 0x9d, 0x43, 0x48, 0xd5, 0xa7, 0x6a, 0x15,
      0x7e, 0x38, 0x94, 0x52, 0x77, 0x97, 0x0f, 0xef,
    ]).buffer,
  },
};

// sample arguments for login
var getCredentialDefaultArgs = {
  publicKey: {
    timeout: 60000,
    // allowCredentials: [newCredential] // see below
    challenge: new Uint8Array([
      // must be a cryptographically random number sent from a server
      0x79, 0x50, 0x68, 0x71, 0xda, 0xee, 0xee, 0xb9, 0x94, 0xc3, 0xc2, 0x15,
      0x67, 0x65, 0x26, 0x22, 0xe3, 0xf3, 0xab, 0x3b, 0x78, 0x2e, 0xd5, 0x6f,
      0x81, 0x26, 0xe2, 0xa6, 0x01, 0x7d, 0x74, 0x50,
    ]).buffer,
  },
};

// register / create a new credential
var cred = await navigator.credentials.create(createCredentialDefaultArgs);
console.log("NEW CREDENTIAL", cred);

// normally the credential IDs available for an account would come from a server
// but we can just copy them from above...
var idList = [
  {
    id: cred.rawId,
    transports: ["usb", "nfc", "ble"],
    type: "public-key",
  },
];
getCredentialDefaultArgs.publicKey.allowCredentials = idList;

var assertation = await navigator.credentials.get(getCredentialDefaultArgs);
console.log("ASSERTION", assertation);

// verify signature on server
var signature = await assertation.response.signature;
console.log("SIGNATURE", signature);

var clientDataJSON = await assertation.response.clientDataJSON;
console.log("clientDataJSON", clientDataJSON);

var authenticatorData = new Uint8Array(
  await assertation.response.authenticatorData
);
console.log("authenticatorData", authenticatorData);

var clientDataHash = new Uint8Array(
  await crypto.subtle.digest("SHA-256", clientDataJSON)
);
console.log("clientDataHash", clientDataHash);

// concat authenticatorData and clientDataHash
var signedData = new Uint8Array(
  authenticatorData.length + clientDataHash.length
);
signedData.set(authenticatorData);
signedData.set(clientDataHash, authenticatorData.length);
console.log("signedData", signedData);

// import key
var key = await crypto.subtle.importKey(
  // The getPublicKey() operation thus returns the credential public key as a SubjectPublicKeyInfo. See:
  //
  // https://w3c.github.io/webauthn/#sctn-public-key-easy
  //
  // crypto.subtle can import the spki format:
  //
  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
  "spki", // "spki" Simple Public Key Infrastructure rfc2692

  cred.response.getPublicKey(),
  {
    // these are the algorithm options
    // await cred.response.getPublicKeyAlgorithm() // returns -7
    // -7 is ES256 with P-256 // search -7 in https://w3c.github.io/webauthn
    // the W3C webcrypto docs:
    //
    // https://www.w3.org/TR/WebCryptoAPI/#informative-references (scroll down a bit)
    //
    // ES256 corrisponds with the following AlgorithmIdentifier:
    name: "ECDSA",
    namedCurve: "P-256",
    hash: { name: "SHA-256" },
  },
  false, //whether the key is extractable (i.e. can be used in exportKey)
  ["verify"] //"verify" for public key import, "sign" for private key imports
);

// Convert signature from ASN.1 sequence to "raw" format
var usignature = new Uint8Array(signature);
var rStart = usignature[4] === 0 ? 5 : 4;
var rEnd = rStart + 32;
var sStart = usignature[rEnd + 2] === 0 ? rEnd + 3 : rEnd + 2;
var r = usignature.slice(rStart, rEnd);
var s = usignature.slice(sStart);
var rawSignature = new Uint8Array([...r, ...s]);

// check signature with public key and signed data
var verified = await crypto.subtle.verify(
  { name: "ECDSA", namedCurve: "P-256", hash: { name: "SHA-256" } },
  key,
  rawSignature,
  signedData.buffer
);
// verified is now true!
console.log("verified", verified);
