const bodyParser = require("body-parser");
const express = require("express");
const { Blockchain, Transaction } = require("./blockchain");

let ltvCoin = new Blockchain();

const httpPort = process.env.PORT || 3000;

const initHTTPSever = (httpPort) => {
  const app = new express();
  app.use(bodyParser.json());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Config Router
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

  ///
  app.listen(httpPort, () => {
    console.log(`App listen on port ${httpPort}`);
  });
};

initHTTPSever(httpPort);
