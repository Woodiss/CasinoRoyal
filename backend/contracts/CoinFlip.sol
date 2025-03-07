// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CoinFlip {
    address public owner;
    mapping(address => uint256) public balances;

    // Événement pour afficher le résultat
    event GameResult(address indexed player, bool won, uint256 amount);

    constructor() payable {
        owner = msg.sender;
    }

    function flipCoin(uint256 choice) public payable {
        require(msg.value > 0, "Misez un montant");
        require(choice == 0 || choice == 1, "Choisissez 0 (pile) ou 1 (face)");
        require(address(this).balance >= msg.value * 2, "Contrat sans fonds");

        uint256 random = uint256(
            keccak256(abi.encodePacked(block.prevrandao, block.timestamp))
        ) % 2;

        if (random == choice) {
            payable(msg.sender).transfer(msg.value * 2);

            // (bool success, ) = payable(msg.sender).call{value: msg.value * 2}(
            //     ""
            // );
            // require(success, "Transfer failed");

            emit GameResult(msg.sender, true, msg.value * 2);
        } else {
            emit GameResult(msg.sender, false, 0);
        }
    }

    function withdraw() public {
        require(msg.sender == owner, "Seul l'owner peut retirer");
        uint256 toKeep = 5000 * 10**18; // 5000 ETH en wei
        payable(owner).transfer(address(this).balance - toKeep);
    }

    function balanceOfContract() public view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
