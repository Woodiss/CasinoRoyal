"use client"
import { COINFLIP_ABI } from "@/public/coinFlip";
import { useState } from "react";
import { useAccount, useContractWrite } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Adresse de ton contrat déployé
// const ABI = [""]; // ABI de ton contrat

export default function CoinFlip() {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState("");
  const [choice, setChoice] = useState(0);
  
  const { write } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: COINFLIP_ABI,
    functionName: "flipCoin",
    args: [choice],
    overrides: { value: BigInt(betAmount * 1e18) },
  });

  return (
    <div className="w-fit mx-auto p-8 text-center">
      <h1 className="text-3xl mb-4">Pile ou Face 🎲</h1>
      <ConnectButton />
      {address && (
        <>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Mise en ETH"
            className="border p-2 rounded"
          />
          <div className="mt-4">
            <button onClick={() => setChoice(0)} className="bg-gray-300 p-2 rounded">Pile</button>
            <button onClick={() => setChoice(1)} className="bg-gray-300 p-2 rounded ml-2">Face</button>
          </div>
          <button
            onClick={() => write()}
            className="mt-4 bg-blue-500 text-white p-2 rounded"
          >
            Jouer
          </button>
        </>
      )}
    </div>
  );
}
