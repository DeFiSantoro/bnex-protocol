const fs = require("fs");

const networks = ["1", "4", "56", "97", "1001"];
const mypath = "./build/contracts/";

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, (err, filenames) => {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach((filename) => {
      fs.readFile(dirname + filename, "utf-8", function (err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
  });
}

readFiles(
  mypath,
  function (filename, content) {
    let cleaned = {};

    const load = JSON.parse(content);
    cleaned["abi"] = load["abi"];
    cleaned["bytecode"] = load["bytecode"];
    cleaned["networks"] = {};
    networks.map((i) => {
      cleaned["networks"][i] = { address: "0x0" };
      if (load["networks"].hasOwnProperty(i)) {
        cleaned["networks"][i]["links"] = load["networks"][i]["links"];
        cleaned["networks"][i]["address"] = load["networks"][i]["address"];
        cleaned["networks"][i]["transactionHash"] =
          load["networks"][i]["transactionHash"];
      }
      fs.writeFileSync(
        "../bnex-sdk/src/abi/" + filename,
        JSON.stringify(cleaned)
      );
      fs.writeFileSync("./build/clean/" + filename, JSON.stringify(cleaned));
    });
  },
  function (err) {
    throw err;
  }
);
