const bodyParser = require("body-parser");
const express = require("express");
const { Blockchain, Transaction } = require("./blockchain");
const { initP2PServer, connectToPeer, getSockets } = require("./p2p");

let ltvCoin = new Blockchain();
const httpPort = process.env.PORT || 3000;
const p2pPort = process.env.p2pPort || 6001;

const initHTTPSever = (httpPort) => {
  const app = new express();
  app.use(bodyParser.json());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Config Router
  app.get("/blocks", (req, res) => {
    res.status(200).send(ltvCoin);
  });

  app.post("/createTransaction", (req, res) => {
    const { fromAddress, toAddress, amount } = req.body;
    const newTrans = new Transaction(fromAddress, toAddress, amount);
    ltvCoin.createTransaction(newTrans);
    res.status(200).json({
      message: "OK",
    });
  });

  app.post("/mining", (req, res) => {
    const { address } = req.body;
    ltvCoin.minePendingTransaction(address);
    res.status(200).json({
      message: "OK",
    });
  });

  app.get("/getBalance", (req, res) => {
    const { address } = req.body;
    result = ltvCoin.getBalanceOfAdress(address);
    res.status(200).json({
      balance: result,
    });
  });

  app.get("/getPeers", (req, res) => {
    result = getSockets().map((temp) => {
      temp._socket.remoteAddress + ": " + s._socket.remotePort;
    });
    res.status(200).json({
      peers: result,
    });
  });

  app.post("/addPeer", (req, res) => {
    const { peer } = req.body;
    connectToPeer(peer);
    res.status(200).json({
      message: "Yeah hope it connected",
    });
  });
  ///
  app.listen(httpPort, () => {
    console.log(`App listen on port ${httpPort}`);
  });
};
initHTTPSever(httpPort);
initP2PServer(ltvCoin, p2pPort);
