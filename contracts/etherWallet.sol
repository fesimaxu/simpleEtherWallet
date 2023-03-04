// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract etherWallet {
    address payable public owner;

    event Withdrawal(uint amount);

    constructor(){
        owner = payable(msg.sender);
    }

    mapping(address => uint256) balance;

   receive() external payable{}

    function withdraw(uint256 _amount) public {
        // Uncomment this line, and the import of "hardhat/console.sol", to print a log in your terminal
        require(msg.sender == owner, "You aren't the owner");

        emit Withdrawal(address(this).balance);

        payable(msg.sender).transfer(_amount);
    }

    function getBalance() external view returns(uint bal){
        return address(this).balance;
    }


}
