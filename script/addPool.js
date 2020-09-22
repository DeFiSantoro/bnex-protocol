require("dotenv-flow").config();
const ethers = require("ethers");
const Web3 = require("web3");
const { abi } = require("../build/contracts/Master.json");
const BN = require("bignumber.js");
const MasterJson = require("../build/contracts/Master.json");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const {
  Pair,
  WBNB,
  Token,
  ChainId,
  BNXTOKEN_ADDRESS_LIST,
} = require("@bnex/sdk");
let tokens = require("./tokens.json");

const NETWORK = 56;

const Master = MasterJson.networks[NETWORK].address;
let provider = new ethers.providers.JsonRpcProvider(
  "https://bsc-dataseed1.binance.org/"
);
let wallet = new ethers.Wallet(`0x${process.env.DEPLOYER_PRIVATE_KEY}`);
wallet = wallet.connect(provider);
var contract = new ethers.Contract(Master, abi, wallet);

tokens = tokens.filter((token) => token.chainId === NETWORK);

tokens.push({
  address: BNXTOKEN_ADDRESS_LIST[NETWORK],
  chainId: NETWORK,
  name: "BnEX Token",
  symbol: "BNX",
  decimals: 18,
  logoURI: "https://bnex.org/images/tokens/BNX.png",
});

let pools = [
  {
    token0: "BUSD",
    token1: "WBNB",
    reward: "100",
  },
  {
    token0: "ETH",
    token1: "WBNB",
    reward: "100",
  },
  {
    token0: "LINK",
    token1: "WBNB",
    reward: "100",
  },
  {
    token0: "DOT",
    token1: "WBNB",
    reward: "100",
  },
  {
    token0: "BTCB",
    token1: "WBNB",
    reward: "100",
  },
  {
    token0: "BNX",
    token1: "WBNB",
    reward: "1000",
  },
  {
    token0: "BNX",
    token1: "BUSD",
    reward: "500",
  },
];

pools = pools.map((pool) => {
  const token0_raw = tokens.find((token) => token.symbol === pool.token0);
  const token1_raw = tokens.find((token) => token.symbol === pool.token1);

  const token0 = new Token(
    token0_raw.chainId,
    token0_raw.address,
    token0_raw.decimals,
    token0_raw.symbol,
    token0_raw.name
  );
  const token1 = new Token(
    token1_raw.chainId,
    token1_raw.address,
    token1_raw.decimals,
    token1_raw.symbol,
    token1_raw.name
  );
  return {
    token0,
    token1,
    reward: pool.reward,
    address: Pair.getAddress(token0, token1),
  };
});

(async () => {
  console.log("Address:", wallet.address);

  for (let index = 0; index < pools.length; index++) {
    const pool = pools[index];
    console.log(
      `Create pool:  ${pool.token0.symbol} - ${pool.token1.symbol} : ${pool.address}`
    );
    const result = await contract.add(pool.reward, pool.address, false, {
      from: wallet.address,
      gasLimit: "3000000",
    });
  }
  console.log(
    "totalAllocPoint:",
    (await contract.totalAllocPoint()).toNumber()
  );
  console.log("N Pools:", (await contract.poolLength()).toNumber());
})();
