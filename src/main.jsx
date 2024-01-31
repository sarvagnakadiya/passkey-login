import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { modeTestnet } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { WagmiConfig, createConfig } from "wagmi";

const chains = [modeTestnet];

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: "O5NYvtwLMNG0LjAXPQEk0YJT2l3UxTAY", // or infuraId
    walletConnectProjectId: "4c1fb4009a66dfd6a5f0c2babec3254b",
    chains,

    // Required
    appName: "MultiSig",

    // Optional
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <WagmiConfig config={config}>
    <ConnectKitProvider>
      <App />
    </ConnectKitProvider>
  </WagmiConfig>
);
