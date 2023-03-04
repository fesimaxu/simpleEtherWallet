import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("etherWallet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployetherWallet() {
   

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("moToken");
    const token = await Token.deploy("Tether", "USDT");

    const Wallet = await ethers.getContractFactory("etherWallet");
    const wallet = await Wallet.deploy();

    return { wallet, owner, otherAccount,token };
  }

  describe("Deployment", function () {
    it("Should check wallet balance", async function () {
      const { wallet } = await loadFixture(deployetherWallet);

      const amount = ethers.utils.parseEther("0")

      expect(await wallet.getBalance()).to.equal(
        amount
      );
    });

    it("Should set the right owner", async function () {
      const { wallet, owner } = await loadFixture(deployetherWallet);

      expect(await wallet.owner()).to.equal(owner.address);
    });

    it("Should receive and hold the funds", async function () {
      const { wallet, token, otherAccount} = await loadFixture(
        deployetherWallet
      );

      await token.mint(otherAccount.address, ethers.utils.parseEther("200000"));

      const amount = ethers.utils.parseEther("20");

        await token
       .connect(otherAccount)
       .approve(wallet.address, amount);

      await token.connect(otherAccount).transfer(wallet.address, amount);

      expect(await wallet.getBalance()).to.equal(
        amount
      );
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {

      it("Should revert with the right error if called from another account", async function () {
        const { wallet, otherAccount, token, owner} = await loadFixture(
          deployetherWallet
        );

        await token.mint(owner.address, ethers.utils.parseEther("200000"));

        const amount = ethers.utils.parseEther("50");

        await token
       .connect(owner)
       .approve(wallet.address, amount);

        await token.connect(owner).transfer(wallet.address, amount);

        // We use lock.connect() to send a transaction from another account
        await expect(wallet.connect(otherAccount).withdraw(amount)).to.be.revertedWith(
          "You aren't the owner"
        );
      });

    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { wallet, token, owner } = await loadFixture(
          deployetherWallet
        );

        await token.mint(owner.address, ethers.utils.parseEther("200000"));
      
  
        const amount = ethers.utils.parseEther("20");

        await token
       .connect(owner)
       .approve(wallet.address, amount);

        const depositedAmount = await wallet.connect(owner).depositFund(amount);

        await expect(wallet.withdraw(amount))
          .to.emit(wallet, "Withdrawal")
          .withArgs(amount, anyValue); // We accept any value as `when` arg
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const { wallet, owner, token } = await loadFixture(
          deployetherWallet
        );

        await token.mint(owner.address, ethers.utils.parseEther("200000"));

        const amount = ethers.utils.parseEther("20");
    

        await expect(wallet.withdraw(amount)).to.changeEtherBalances( 
          [owner],
          [amount, -amount]
        );
      });
    });
  });
});
