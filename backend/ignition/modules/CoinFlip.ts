// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Ce module utilise Hardhat Ignition pour gérer le déploiement du smart contrat coinFlip.
const coinFlipModule = buildModule("coinFlipModule", (m) => {
  // Déploiement du smart contrat coinFlip
  const coinFlip = m.contract("CoinFlip");

  return { coinFlip };
});

export default coinFlipModule;