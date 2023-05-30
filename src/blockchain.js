const { mode } = require("crypto-js");
const SHA256 = require("crypto-js/sha256");

class Transaction {
  constructor(fromAddress, toAdderss, amount) {
    this.fromAddress = fromAddress;
    this.toAdderss = toAdderss;
    this.amount = amount;
  }
}

class Block {
  constructor(index, timestamp, transaction, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.transaction = transaction;
    this.previousHash = previousHash;
    this.hash = "";
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transaction) +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log("Block mined: " + this.hash);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block(0, "26/04/2023", "Genesis block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // addBlock(newBlock) {
  //   newBlock.previousHash = this.getLatestBlock().hash;
  //   newBlock.mineBlock(this.difficulty);
  //   this.chain.push(newBlock);
  // }

  minePendingTransaction(miningRewardAddress) {
    let block = new Block(
      this.getLatestBlock().index + 1,
      Date.now(),
      this.pendingTransactions
    );
    block.previousHash = this.getLatestBlock().hash;
    block.mineBlock(this.difficulty);

    console.log("Block succesfully mined!");
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward),
    ];
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAdress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const trans of block.transaction) {
        if (trans.fromAddress == address) {
          balance = balance - trans.amount;
        }
        if (trans.toAdderss == address) {
          balance = balance + trans.amount;
        }
      }
    }
    return balance;
  }

  isValidChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
