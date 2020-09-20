const { expectRevert } = require("@openzeppelin/test-helpers");
const BNXToken = artifacts.require("BNXToken");

contract("BNXToken", ([alice, bob, carol]) => {
  beforeEach(async () => {
    this.bnx = await BNXToken.new({ from: alice });
  });

  it("should have correct name and symbol and decimal", async () => {
    const name = await this.bnx.name();
    const symbol = await this.bnx.symbol();
    const decimals = await this.bnx.decimals();
    assert.equal(name.valueOf(), "BnEX Token");
    assert.equal(symbol.valueOf(), "BNX");
    assert.equal(decimals.valueOf(), "18");
  });

  it("should only allow owner to mint token", async () => {
    await this.bnx.mint(alice, "100", { from: alice });
    await this.bnx.mint(bob, "1000", { from: alice });
    await expectRevert(
      this.bnx.mint(carol, "1000", { from: bob }),
      "Ownable: caller is not the owner"
    );
    const totalSupply = await this.bnx.totalSupply();
    const aliceBal = await this.bnx.balanceOf(alice);
    const bobBal = await this.bnx.balanceOf(bob);
    const carolBal = await this.bnx.balanceOf(carol);
    assert.equal(totalSupply.valueOf(), "1100");
    assert.equal(aliceBal.valueOf(), "100");
    assert.equal(bobBal.valueOf(), "1000");
    assert.equal(carolBal.valueOf(), "0");
  });

  it("should supply token transfers properly", async () => {
    await this.bnx.mint(alice, "100", { from: alice });
    await this.bnx.mint(bob, "1000", { from: alice });
    await this.bnx.transfer(carol, "10", { from: alice });
    await this.bnx.transfer(carol, "100", { from: bob });
    const totalSupply = await this.bnx.totalSupply();
    const aliceBal = await this.bnx.balanceOf(alice);
    const bobBal = await this.bnx.balanceOf(bob);
    const carolBal = await this.bnx.balanceOf(carol);
    assert.equal(totalSupply.valueOf(), "1100");
    assert.equal(aliceBal.valueOf(), "90");
    assert.equal(bobBal.valueOf(), "900");
    assert.equal(carolBal.valueOf(), "110");
  });

  it("should fail if you try to do bad transfers", async () => {
    await this.bnx.mint(alice, "100", { from: alice });
    await expectRevert(
      this.bnx.transfer(carol, "110", { from: alice }),
      "ERC20: transfer amount exceeds balance"
    );
    await expectRevert(
      this.bnx.transfer(carol, "1", { from: bob }),
      "ERC20: transfer amount exceeds balance"
    );
  });
});
