require("dotenv-flow").config();
const { bytecode } = require("../build/contracts/UniswapV2Pair.json");
const { keccak256 } = require("@ethersproject/solidity");

// ============ Accounts ============
const account = process.env.DEPLOYER_ACCOUNT;
const adminAccount = process.env.ADMIN_ACCOUNT;
// Mainnet
// const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
// TestNet
const WBNB = "0xae13d989dac2f0debff460ac112a837c89baa7cd";

console.log(`Deployer Account:  ${account}`);
console.log(`Admin Account:  ${adminAccount}`);
// ============ Contracts ============
const UniswapV2Factory = artifacts.require("UniswapV2Factory");
const UniswapV2Router02 = artifacts.require("UniswapV2Router02");
const Multicall = artifacts.require("Multicall");

// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
  await Promise.all([deployBnExContracts(deployer, network, accounts)]);
};
module.exports = migration;

// ============ Deploy Functions ============
async function deployBnExContracts(deployer) {
  // this _could_ go in constants, except that it would cost every consumer of the sdk the CPU to compute the hash
  // and load the JSON.
  const COMPUTED_INIT_CODE_HASH = keccak256(["bytes"], [`${bytecode}`]);

  // console.log("COMPUTED_INIT_CODE_HASH", COMPUTED_INIT_CODE_HASH);
  await deployer.deploy(Multicall);
  await deployer.deploy(UniswapV2Factory, adminAccount);
  await deployer.deploy(UniswapV2Router02, UniswapV2Factory.address, WBNB);
  console.log("Multicall:", Multicall.address);
  console.log("UniswapV2Router02:", UniswapV2Router02.address);
  console.log("UniswapV2Factory:", UniswapV2Factory.address);
}
