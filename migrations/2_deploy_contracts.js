require("dotenv-flow").config();
const { bytecode } = require("../build/contracts/BnEXPair.json");
const { keccak256 } = require("@ethersproject/solidity");
const BN = require("bignumber.js");

const CHAIN_ID = 97;
// ============ Accounts ============
const account = web3.eth.accounts.privateKeyToAccount(
  `0x${process.env.DEPLOYER_PRIVATE_KEY}`
).address;
const adminAccount = process.env.ADMIN_ACCOUNT;
const WBNBS = {
  97: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
  56: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
};

console.log("########################################################");
console.log(`# Deployer Account:  ${account}`);
console.log(`# Admin Account:  ${adminAccount}`);
console.log("########################################################");
// ============ Contracts ============
const BnEXFactory = artifacts.require("BnEXFactory");
const BnEXRouter = artifacts.require("BnEXRouter");
const Multicall = artifacts.require("Multicall");

const BNXToken = artifacts.require("BNXToken");
const Master = artifacts.require("Master");

// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployBnExContracts1(deployer, network, accounts),
    deployBnExContracts2(deployer, network, accounts),
  ]);
  await initialize(deployer, network, accounts);
  await show(deployer, network, accounts);
  await writeConfig(deployer, network, accounts);
};
module.exports = migration;

// ============ Deploy Uniswap ============
async function deployBnExContracts1(deployer) {
  console.log(
    "# COMPUTED_INIT_CODE_HASH",
    keccak256(["bytes"], [`${bytecode}`])
  );
  console.log(
    getTargetBlockByTimestamp(
      await web3.eth.getBlockNumber(),
      1600876800
    ).toString()
  );
  await deployer.deploy(Multicall);
  await deployer.deploy(BnEXFactory, adminAccount);
  await deployer.deploy(BnEXRouter, BnEXFactory.address, WBNBS[CHAIN_ID]);
}

const getTargetBlockByTimestamp = (actualBlock, targetTimestamp) => {
  return (
    actualBlock +
    (targetTimestamp - Math.floor(Date.now() / 1000)) / 3
  ).toFixed();
};

// ============ Deploy BNX ============
async function deployBnExContracts2(deployer) {
  await deployer.deploy(BNXToken);
  await deployer.deploy(
    Master,
    BNXToken.address,
    adminAccount,
    BN(25).times(1e18).toString(),
    getTargetBlockByTimestamp(
      await web3.eth.getBlockNumber(),
      1600876800
    ).toString()
  );
}

// ============ Init ============
async function initialize(deployer, network, accounts) {
  const token = await new web3.eth.Contract(BNXToken.abi, BNXToken.address);
  console.log(
    await token.methods
      .transferOwnership(Master.address)
      .send({ from: account, gas: 100000 })
  );

  // const master = await new web3.eth.Contract(Master.abi, Master.address);
  // console.log(
  //   await master.methods
  //     .add("50", "0xaa7e657A8Ea30fc6a6a3E9a11af0543724F2e586", false)
  //     .send({ from: account, gas: 3000000 })
  // );
}

// ============ Print ============
async function show(deployer, network, accounts) {
  console.log("\n\n");
  console.log("+ Multicall: ", Multicall.address);
  console.log("+ BnEXRouter: ", BnEXRouter.address);
  console.log("+ BnEXFactory: ", BnEXFactory.address);
  console.log("+ BNXToken: ", BNXToken.address);
  console.log("+ Master: ", Master.address);
}

async function writeConfig(deployer, network, accounts) {
  let config = {
    deployer: account,
    multicall: Multicall.address,
    router: BnEXRouter.address,
    factory: BnEXFactory.address,
    bnx: BNXToken.address,
    master: Master.address,
  };
  // console.log(JSON.stringify(config));
  // fs.writeFileSync("config.json", JSON.stringify(config));
}
