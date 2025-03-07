// "use client"
// import { COINFLIP_ABI } from "@/public/coinFlip";
// import { useState } from "react";
// import { useAccount, useContractWrite } from "wagmi";
// import { ConnectButton } from "@rainbow-me/rainbowkit";

// const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Adresse de ton contrat déployé
// // const ABI = [""]; // ABI de ton contrat

// export default function CoinFlip() {
//   const { address } = useAccount();
//   const [betAmount, setBetAmount] = useState("");
//   const [choice, setChoice] = useState(0);
//   console.log(choice);

//   const { write } = useContractWrite({
//     address: CONTRACT_ADDRESS,
//     abi: COINFLIP_ABI,
//     functionName: "flipCoin",
//     args: [choice],
//     overrides: { value: BigInt(betAmount * 1e18) },
//   });

//   return (
//     <div className="w-fit mx-auto p-8 text-center">
//       <h1 className="text-3xl mb-4">Pile ou Face 🎲</h1>
//       <ConnectButton />
//       {address && (
//         <>
//           <input
//             type="number"
//             value={betAmount}
//             onChange={(e) => setBetAmount(e.target.value)}
//             placeholder="Mise en ETH"
//             className="border p-2 rounded mt-4"
//           />
//           <div className="mt-4">
//             <button onClick={() => setChoice(0)} className="bg-gray-300 p-2 rounded">Pile</button>
//             <button onClick={() => setChoice(1)} className="bg-gray-300 p-2 rounded ml-2">Face</button>
//           </div>
//           <button
//             onClick={() => write()}
//             className="mt-4 bg-blue-500 text-white p-2 rounded"
//           >
//             Jouer
//           </button>
//         </>
//       )}
//     </div>
//   );
// }
// "use client"
// import { COINFLIP_ABI } from "@/public/coinFlip";
// import { useState } from "react";
// import { useAccount, useContractWrite } from "wagmi";
// import { ConnectButton } from "@rainbow-me/rainbowkit";

// const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// export default function CoinFlip() {
//   const { address } = useAccount();
//   const [betAmount, setBetAmount] = useState("");
//   const [choice, setChoice] = useState(0);
//   console.log("Amount :" + betAmount,"Choice :" + choice);
//   console.log(address);

//   // Configuration de la transaction avec useContractWrite
//   const { data, isPending, isSuccess, write } = useContractWrite({
//     address: CONTRACT_ADDRESS,
//     abi: COINFLIP_ABI,
//     functionName: "flipCoin",
//   });

//   const handleBet = () => {
//     if (!write) return;
//     write({
//       args: [choice],
//       overrides: { value: BigInt(betAmount * 1e18) },
//     });
//   };

//   console.log({data, isPending, isSuccess, write});

//   return (
//     <div className="w-fit mx-auto p-8 text-center">
//       <h1 className="text-3xl mb-4">Pile ou Face 🎲</h1>
//       <ConnectButton />
//       {address && (
//         <>
//           <input
//             type="number"
//             value={betAmount}
//             onChange={(e) => setBetAmount(e.target.value)}
//             placeholder="Mise en ETH"
//             className="border p-2 rounded mt-4"
//           />
//           <div className="mt-4">
//             <button onClick={() => setChoice(0)} className="bg-gray-300 p-2 rounded">
//               Pile
//             </button>
//             <button onClick={() => setChoice(1)} className="bg-gray-300 p-2 rounded ml-2">
//               Face
//             </button>
//           </div>
//           <button
//             onClick={handleBet}
//             className="mt-4 bg-blue-500 text-white p-2 rounded"
//             disabled={isPending}
//           >
//             {isPending ? "Transaction en cours..." : "Jouer"}
//           </button>
//           {isSuccess && <p className="text-green-500 mt-2">Transaction envoyée ! ✅</p>}
//         </>
//       )}
//     </div>
//   );
// }

"use client";
import { COINFLIP_ABI } from "@/public/coinFlip";
import { useState } from "react";
import { type BaseError, useAccount, useContractWrite, useWaitForTransactionReceipt, useWatchContractEvent, useReadContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function CoinFlip() {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState("");
  const [choice, setChoice] = useState(0);
  const [gameResult, setGameResult] = useState<{ won: boolean; amount: number } | null>(null);

  // console.log("Amount :" + betAmount, "Choice :" + choice);
  // console.log(address);
  

  const { data: hash, writeContract, error } = useContractWrite();

  const handleBet =  () => {
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
    },
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
            className="border p-2 rounded mt-4"
          />
          <div className="mt-4">
            <button onClick={() => setChoice(0)} className="bg-gray-300 p-2 rounded">
              Pile
            </button>
            <button onClick={() => setChoice(1)} className="bg-gray-300 p-2 rounded ml-2">
              Face
            </button>
          </div>
          <button
            onClick={handleBet}
            className="mt-4 bg-blue-500 text-white p-2 rounded"
            // disabled={isPending}
          >
            {/* {isPending ? "Transaction en cours..." : "Jouer"} */}
          </button>
          {/* {isSuccess && (
            <p className="text-green-500 mt-2">Transaction envoyée ! ✅</p>
          )} */}
          {/* <p>{address}</p> */}
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
          {isConfirming && <div>Waiting for confirmation...</div>}
          {isConfirmed && <div>Transaction confirmed.</div>}
          {error && <div>Error: {(error as BaseError).shortMessage || error.message}</div>}
        </>
      )}
    </div>
  );
}
