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

    const W3XToken = await ethers.getContractFactory("W3XToken");
    const w3xToken = await W3XToken.deploy();

    const SaveERC20 = await ethers.getContractFactory("SaveERC20");
    const saveToken = await SaveERC20.deploy(w3xToken.target);

    return { saveToken, w3xToken, lockedAmount, owner, user1, user2 };
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
  });
});