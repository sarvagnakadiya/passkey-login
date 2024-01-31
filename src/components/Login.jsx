import React, { useState } from "react";
import CBOR from "cbor-js";

const Login = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  const [pubKeyObj, setPubKeyObj] = useState([]);

  const passkey = async () => {
    const publicKeyCredentialCreationOptions = {
      challenge: Uint8Array.from("randomStringFromServer", (c) =>
        c.charCodeAt(0)
      ),
      rp: {
        name: "PassKey Login demo",
        id: "passkey-login.vercel.app", // Set a registrable domain suffix or equal to the current domain
      },
      user: {
        id: Uint8Array.from(username, (c) => c.charCodeAt(0)),
        name: username,
        displayName: name,
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      authenticatorSelection: {},
      timeout: 60000,
      attestation: "direct",
    };

    try {
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      });

      // this is a public key obj
      // Id is there in base-64 encoded string
      console.log(pubKeyObj);
      console.log(credential);

      setPubKeyObj(credential);
      console.log(pubKeyObj);

      // -----------------------server side validation---------------------------
      // challange / origin / type are cross validated

      // parsing the clientDataJSON -----------------------------------
      const utf8Decoder = new TextDecoder("utf-8");
      const decodedClientData = utf8Decoder.decode(
        credential.response.clientDataJSON
      );

      // parse the string as an object
      const clientDataObj = JSON.parse(decodedClientData);

      console.log(clientDataObj);

      // {
      //     challenge: "p5aV2uHXr0AOqUk7HQitvi-Ny1....",
      //     origin: "https://webauthn.guide",
      //     type: "webauthn.create"
      // }

      //   Parsing the attestationObject ---------------------------
      const decodedAttestationObj = CBOR.decode(
        credential.response.attestationObject
      );

      console.log(decodedAttestationObj);

      // {
      //     authData: Uint8Array(196),
      //     fmt: "fido-u2f",
      //     attStmt: {
      //         sig: Uint8Array(70),
      //         x5c: Array(1),
      //     },
      // }

      //    Parsing the authenticator data ------------------------

      const { authData } = decodedAttestationObj;

      // get the length of the credential ID
      const dataView = new DataView(new ArrayBuffer(2));
      const idLenBytes = authData.slice(53, 55);
      idLenBytes.forEach((value, index) => dataView.setUint8(index, value));
      const credentialIdLength = dataView.getUint16();

      // get the credential ID
      const credentialId = authData.slice(55, 55 + credentialIdLength);

      // get the public key object
      const publicKeyBytes = authData.slice(55 + credentialIdLength);

      // the publicKeyBytes are encoded again as CBOR
      const publicKeyObject = CBOR.decode(publicKeyBytes.buffer);
      console.log(publicKeyObject);
    } catch (error) {
      console.error("Error creating credentials:", error);
    }
  };

  const signIn = async () => {
    const assertation = await navigator.credentials.get({
      publicKey: {
        challenge: Uint8Array.from("randomStringFromServer", (c) =>
          c.charCodeAt(0)
        ),
        rpId: "passkey-login.vercel.app",
      },
      mediation: "optional",
    });

    console.log("ASSERTION: ", assertation);

    /////

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

    //////

    console.log(pubKeyObj);
    var key = await crypto.subtle.importKey(
      // The getPublicKey() operation thus returns the credential public key as a SubjectPublicKeyInfo. See:
      //
      // https://w3c.github.io/webauthn/#sctn-public-key-easy
      //
      // crypto.subtle can import the spki format:
      //
      // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
      "spki", // "spki" Simple Public Key Infrastructure rfc2692

      pubKeyObj.response.getPublicKey(),
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

    // the older code

    /* try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from("randomStringFromServer", (c) =>
            c.charCodeAt(0)
          ),
          rpId: "localhost",
        },
        mediation: "optional",
      });

      console.log(assertion);

      console.log("authenticator:", assertion.response.authenticatorData);
      console.log("client:", assertion.response.clientDataJSON);

      const authenticatorDataBytes = assertion.response.authenticatorData;

      var hashedClientDataJSON = new Uint8Array(
        await crypto.subtle.digest("SHA-256", assertion.response.clientDataJSON)
      );
      console.log("clientDataHash", hashedClientDataJSON);

      const signedData = authenticatorDataBytes + hashedClientDataJSON;

      const signatureIsValid = pubKeyObj.verify(
        assertion.response.signature,
        signedData
      );

      console.log(signatureIsValid);

      if (signatureIsValid) {
        return "Hooray! User is authenticated! 🎉";
      } else {
        return "Verification failed. 😭";
      }
    } catch (error) {
      console.error("Error during login:", error);
      return "Error during login.";
    } */
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md w-full bg-opacity-75 p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-600"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            className="mt-1 p-2 border border-gray-300 rounded-md w-full bg-opacity-50 text-gray-800"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-600"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            className="mt-1 p-2 border border-gray-300 rounded-md w-full bg-opacity-50 text-gray-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {/* <h4>{pubKeyObj}</h4> */}
        <button
          onClick={() => passkey()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-6"
        >
          SignUp
        </button>
        <button
          onClick={() => signIn()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          SignIn
        </button>
      </div>
    </div>
  );
};

export default Login;
