import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseEther, decodeEventLog  } from "viem";

describe("CoinFlip", function () {
  async function deployCoinFlipFixture() {
    const [owner, player] = await hre.viem.getWalletClients();
    
    // Ici, on déploie le contrat avec 10 ETH
    const CoinFlip = await hre.viem.deployContract("CoinFlip", [], {
      value: parseEther("10"),
    });

    const publicClient = await hre.viem.getPublicClient();

    return { CoinFlip, owner, player, publicClient };
  }

  it("Devrait avoir 10 ETH juste après le déploiement", async function () {
    // On recharge la fixture
    const { CoinFlip, publicClient } = await loadFixture(deployCoinFlipFixture);

    // On récupère la balance du contrat
    const contractBalance = await publicClient.getBalance({ address: CoinFlip.address });

    // console.log("💰 Balance du contrat :", contractBalance / 10n ** 18n, "ETH");
    
    // On vérifie qu'elle est égale à 10 ETH
    expect(contractBalance).to.equal(parseEther("10"));
  });

  it("Vérifie que l'événement GameResult est bien émis quand on mise", async function () {
    const { CoinFlip, player, publicClient } = await loadFixture(deployCoinFlipFixture);

    // Le joueur mise 1 ETH sur "pile" (0)
    const betAmount = parseEther("1");
    const txHash = await CoinFlip.write.flipCoin([0n], {
      account: player.account,
      value: betAmount,
    });

    // On récupère les logs de la transaction
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    // On cherche un log émis par le contrat CoinFlip
    const eventLog = receipt.logs.find(log => log.address === CoinFlip.address);

    // Vérification qu'on a bien un log
    expect(eventLog).to.not.be.undefined;

    // Décodage de l'événement
    const decodedEvent = decodeEventLog({
      abi: CoinFlip.abi,
      data: eventLog?.data || "0x",
      topics: eventLog?.topics || [],
    });

    // Vérifie que le nom de l'événement est "GameResult"
    expect(decodedEvent.eventName).to.equal("GameResult");
    // console.log("🔔 GameResult émis :", decodedEvent.args);
  });

  it("Doit permettre à l'owner de retirer les fonds", async function () {
    const { CoinFlip, owner, publicClient } = await loadFixture(deployCoinFlipFixture);

    // Vérifie que le contrat a de l'ETH
    const initialBalance = await publicClient.getBalance({ address: CoinFlip.address });
    expect(initialBalance).to.not.equal(0n);

    // L'owner appelle withdraw()
    await CoinFlip.write.withdraw({ account: owner.account });

    // Vérifie que la balance est retombée à 0
    const finalBalance = await publicClient.getBalance({ address: CoinFlip.address });
    expect(finalBalance).to.equal(0n);
  });
});
