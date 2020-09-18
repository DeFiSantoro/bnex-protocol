require("dotenv-flow").config();
const ethers = require("ethers");
const Web3 = require("web3");
const { abi } = require("../build/contracts/Master.json");
const BN = require("bignumber.js");
const MasterJson = require("../build/clean/Master.json");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const Master = MasterJson.networks["97"].address;
const LP = "0xd91b9CB068d72F0E8b8bc9ba3A3ea9dEC28F224F";
let provider = new ethers.providers.JsonRpcProvider(
  "https://data-seed-prebsc-2-s1.binance.org:8545/"
);
let wallet = new ethers.Wallet(`0x${process.env.DEPLOYER_PRIVATE_KEY}`);
wallet = wallet.connect(provider);
var contract = new ethers.Contract(Master, abi, wallet);

(async () => {
  console.log("Address:", wallet.address);
  console.log("N Pools:", await contract.poolLength());
  console.log("totalAllocPoint:", await contract.totalAllocPoint());
  console.log(
    "N Pools:",
    await contract.userInfo("0", "0x46F07d1f96B34eF26fc6892D78092781E4157c87")
  );
  console.log(await contract.add("1000", LP, true, { from: wallet.address }));
})();
