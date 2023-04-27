const { Blockchain, Transaction } = require("./blockchain");

let ltvCoin = new Blockchain();
// console.log("Is mining...");
// ltvCoin.addBlock(new Block(1, Date.now(), { mess: "Hello" }));
// console.log("Is mining...");
// ltvCoin.addBlock(new Block(2, Date.now(), { mess: "Hello" }));

//console.log(JSON.stringify(ltvCoin, null, 4));
//console.log("Is blockchain valid " + ltvCoin.isValidChain());

ltvCoin.createTransaction(new Transaction("Hao", "Thinh", 100));
ltvCoin.createTransaction(new Transaction("Thinh", "Hao", 20));
ltvCoin.createTransaction(new Transaction("Hao", "Thinh", 100));

console.log("Mining!");
ltvCoin.minePendingTransaction("Hao");

console.log("Mining!");
ltvCoin.minePendingTransaction("Hao");

console.log(ltvCoin.getBalanceOfAdress("Hao"));
