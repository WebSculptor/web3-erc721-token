import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SaveERC20 Test", function () {
  async function deployERC20Token() {
    const ONE_GWEI = 1_000_000_000;
    const lockedAmount = ONE_GWEI;

    const [owner, user1, user2] = await ethers.getSigners();
    const amountToDeposit = 100;

    const W3XToken = await ethers.getContractFactory("W3XToken");
    const w3xToken = await W3XToken.deploy();

    const SaveERC20 = await ethers.getContractFactory("SaveERC20");
    const saveToken = await SaveERC20.deploy(w3xToken.target);

    return {
      saveToken,
      w3xToken,
      lockedAmount,
      owner,
      user1,
      user2,
      amountToDeposit,
    };
  }

  async function approveERC20(account: any, address: any, amount: number) {
    const { w3xToken } = await loadFixture(deployERC20Token);
    const address2Signer = await ethers.getSigner(account.address);
    await w3xToken.connect(address2Signer).approve(address, amount);
  }

  describe("Deployment", () => {
    it("should check user balance", async () => {
      const { saveToken, owner } = await loadFixture(deployERC20Token);
      const balance = await saveToken.checkUserBalance(owner);

      expect(balance).to.equal(0);
    });
    it("should set the right owner", async function () {
      const { owner } = await loadFixture(deployERC20Token);

      expect(owner).to.equal(owner.address);
    });
    it("should revert if trying to deposit zero value", async () => {
      const { saveToken, owner } = await loadFixture(deployERC20Token);
      // Trying to deposit zero value should revert
      await expect(saveToken.deposit(0)).to.be.revertedWith(
        "can't save zero value"
      );
    });
    it("should deposit and check savings balnce", async () => {
      const { saveToken, owner, amountToDeposit } = await loadFixture(
        deployERC20Token
      );
      await approveERC20(owner, saveToken.target, amountToDeposit); //Approve Contract

      await saveToken.deposit(amountToDeposit);

      const balance = await saveToken.checkUserBalance(owner.address);
      expect(balance).to.equal(amountToDeposit);
    });
    it("money can be withdrawn by owner", async () => {
      const { w3xToken, saveToken, user1, user2, amountToDeposit } =
        await loadFixture(deployERC20Token);
      const erc20Minted = 1000;
      await w3xToken.transfer(user2.address, erc20Minted);

      const balanceof = await w3xToken.balanceOf(user2.address);
      const balanceof1 = await w3xToken.balanceOf(user1.address);

      await approveERC20(user2, saveToken.target, amountToDeposit); //Approve Contract
      const address2Signer = await ethers.getSigner(user2.address);
      await saveToken.connect(address2Signer).deposit(amountToDeposit);
    });
  });
});
