"use client";
import { COINFLIP_ABI } from "@/public/coinFlip";
import { useState } from "react";
import { type BaseError, useAccount, useContractWrite, useWaitForTransactionReceipt, useWatchContractEvent, useReadContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { log } from "node:console";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function CoinFlip() {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState("");
  const [lastBetAmount, setLastBetAmount] = useState("")
  const [choice, setChoice] = useState(0);
  const [gameResult, setGameResult] = useState<{ won: boolean; amount: number } | null>(null);
  const [isBetting, setIsBetting] = useState(false);

  // console.log("Amount :" + betAmount, "Choice :" + choice);
  // console.log(address);
  console.log(gameResult);
  console.log(isBetting);

  const { data: hash, writeContract, error } = useContractWrite();

  const handleBet = () => {
    setLastBetAmount(betAmount)
    setGameResult(null);
    setIsBetting(true); // Active le pari en cours
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: COINFLIP_ABI,
      functionName: "flipCoin",
      args: [BigInt(choice)],
      value: parseEther(betAmount),
    });
    console.log("Choice : " + BigInt(choice), "BetAmount : " + BigInt(Number(choice)));
  };

  const withdraw =  () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: COINFLIP_ABI,
      functionName: "withdraw"
    });
    // console.log("Choice : " + BigInt(choice), "BetAmount : " + BigInt(Number(choice)));
  };

  const { data: balance, refetch } = useReadContract({
    abi: COINFLIP_ABI, // ABI du contrat HETIC ERC20
    functionName: "balanceOfContract", // Nom de la fonction à appeler
    address: CONTRACT_ADDRESS, // Adresse du contrat HETIC ERC20
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  console.log({ isLoading: isConfirming, isSuccess: isConfirmed });

  // Écoute de l'évenement GameResult
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: COINFLIP_ABI,
    eventName: "GameResult",
    onLogs(logs) {
      console.log(logs);
      console.log("test logs");

      logs.forEach((log) => {
        const { player, won, amount } = log.args;
        if (player === address) {
          setGameResult({ won, amount: Number(amount) / 1e18 });
          setIsBetting(false); // Active le pari en cours
        }
      });
    },
  });

  return (
    <div className="w-full h-screen bg-indigo-900 flex justify-center items-center flex-col">
      <div className="interface bg-slate-50 p-8 rounded-2xl text-center flex justify-center items-center flex-col">
        <h1 className="text-3xl mb-4 font-semibold">Pile ou Face 🎲</h1>
        <ConnectButton />
        {address && (
          <>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Mise en ETH"
              className="border p-2 rounded mt-4"
            />
            <div className="mt-4 gap-4 flex justify-center">
              <button
                onClick={() => setChoice(0)}
                className={` cursor-pointer p-2 rounded ${choice === 0 ? "bg-blue-500 text-slate-50" : "bg-gray-300"}`}
              >
                Pile
              </button>
              <button
                onClick={() => setChoice(1)}
                className={` cursor-pointer p-2 rounded ${choice === 1 ? "bg-blue-500 text-slate-50" : "bg-gray-300"}`}
              >
                Face
              </button>
            </div>
            <button onClick={handleBet} className="cursor-pointer mt-4 bg-blue-500 text-white p-2 rounded">
              Jouer
            </button>
            {isBetting && (
              <svg className="w-20 h-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <radialGradient id="a11" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)">
                  <stop offset="0" stop-color="#3D1BFF"></stop>
                  <stop offset=".3" stop-color="#3D1BFF" stop-opacity=".9"></stop>
                  <stop offset=".6" stop-color="#3D1BFF" stop-opacity=".6"></stop>
                  <stop offset=".8" stop-color="#3D1BFF" stop-opacity=".3"></stop>
                  <stop offset="1" stop-color="#3D1BFF" stop-opacity="0"></stop>
                </radialGradient>
                <circle
                  transform-origin="center"
                  fill="none"
                  stroke="url(#a11)"
                  stroke-width="15"
                  stroke-linecap="round"
                  stroke-dasharray="200 1000"
                  stroke-dashoffset="0"
                  cx="100"
                  cy="100"
                  r="70"
                >
                  <animateTransform
                    type="rotate"
                    attributeName="transform"
                    calcMode="spline"
                    dur="2"
                    values="360;0"
                    keyTimes="0;1"
                    keySplines="0 0 1 1"
                    repeatCount="indefinite"
                  ></animateTransform>
                </circle>
                <circle
                  transform-origin="center"
                  fill="none"
                  opacity=".2"
                  stroke="#3D1BFF"
                  stroke-width="15"
                  stroke-linecap="round"
                  cx="100"
                  cy="100"
                  r="70"
                ></circle>
              </svg>
            )}
            {gameResult !== null && (
              <p className="mt-4 font-semibold text-center">
                Résultat :{" "}
                <span className={`text-2xl block ${gameResult.won ? "text-green-600" : "text-red-600"}`}>
                  {gameResult.won ? `+ ${gameResult.amount}` : `- ${lastBetAmount}`} ETH
                </span>
              </p>
            )}

            {/* {isConfirming && <div>Waiting for confirmation...</div>}
            {isConfirmed && <div>Transaction confirmed.</div>} */}
            {error && <div className="text-red-600 font-semibold">Error: {(error as BaseError).shortMessage || error.message}</div>}
          </>
        )}
      </div>
      {address === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" && (
            <>
              <button 
                onClick={withdraw}
                className="mt-4 bg-blue-500 text-white p-2 rounded">
                  Récupération des mises
              </button>
              <p>{balance ? formatEther(balance) : "0"} ETH</p>
            </>
          )}
    </div>
  );
}
