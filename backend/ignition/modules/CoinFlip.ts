// Hardhat Ignition - Déploiement de CoinFlip avec des fonds initiaux
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const CoinFlipModule = buildModule("CoinFlipModule", (m) => {
  // Définition du montant de départ en ETH
  const initialBalance = m.getParameter("initialBalance", parseEther("10"));

  // Déploiement du contrat avec les fonds initiaux
  const coinFlip = m.contract("CoinFlip", [], {
    value: initialBalance, // 💰 Envoie 10 ETH au contrat dès son déploiement
  });

  return { coinFlip };
});

export default CoinFlipModule;
