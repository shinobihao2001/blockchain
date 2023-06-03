const Blockchain = require("./blockchain").Blockchain;
const { WebSocket } = require("ws");
const { mode } = require("crypto-js");

let sockets = []; // list of connected nodes
// let dmCoin = new Blockchain();
// console.log(dmCoin);
const MessageType = {
  QUERY_LATEST: 0,
  QUERY_ALL: 1,
  RESPONSE_BLOCKCHAIN: 2,
};

class Message {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }
}

const write = (ws, mess) => {
  ws.send(JSON.stringify(mess));
};
const boardcast = (mess) => {
  sockets.forEach((ws) => {
    write(ws, mess);
  });
};

const JSONToObject = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.log(e);
    return null;
  }
};
const initMessageHandler = (ws, ltvCoin) => {
  ws.on("message", (data) => {
    const mess = JSONToObject(data);
    if (mess === null) {
      console.log("couldn't parse mess to object");
      return;
    }
    console.log("Received mess: " + JSON.stringify(mess));
    switch (mess.type) {
      case MessageType.QUERY_LATEST:
        write(ws, responseLatestMsg(ltvCoin));
        break;
      case MessageType.QUERY_ALL:
        write(ws, responseAllMsg(ltvCoin));
        break;
      case MessageType.RESPONSE_BLOCKCHAIN:
        const receivedBlocks = JSONToObject(mess.data);
        if (receivedBlocks === null) {
          console.log("invalid blocks received");
          console.log(mess.data);
          break;
        }
        handleBlockchainResponse(ltvCoin, receivedBlocks);
        break;
    }
  });
};

const handleBlockchainResponse = (ltvCoin, receivedBlocks) => {
  if (receivedBlocks.length === 0) {
    console.log("Received block chain size of 0");
    return;
  }

  const latestBlockReceived = receivedBlocks[receivedBlocks.lnegth - 1];
  const latestBlockHeld = ltvCoin.getLatestBlock();

  if (latestBlockHeld.index < latestBlockReceived.index) {
    if (ltvCoin.addBlock(latestBlockReceived)) {
      boardcast(responseLatestMsg());
    } else if (receivedBlocks.length === 1) {
      console.log("Receive don't enough ask for more");
      boardcast(queryAllMsg());
    } else {
      console.log("Received blocks is longer than we had replace it ");
      ltvCoin.replaceChain(receivedBlocks);
    }
  } else {
    console.log("Received blockchain is not longer than our blockchain");
  }
};

const initErrorHandler = (ws) => {
  const closeConnection = (itWs) => {
    console.log("connection failed to peer: " + itWs);
    const index = sockets.indexOf(itWs);
    if (index !== -1) {
      sockets.splice(index, 1);
    }
  };
  ws.on("close", () => closeConnection(ws));
  ws.on("error", () => closeConnection(ws));
};
//////////// KIND OF QUERY and it reponse
const queryLatestBlockMsg = () => {
  return new Message(MessageType.QUERY_LATEST, null);
};
const responseLatestMsg = (ltvCoin) => {
  return new Message(
    MessageType.RESPONSE_BLOCKCHAIN,
    JSON.stringify(ltvCoin.getLatestBlock())
  );
};

const queryAllMsg = () => {
  return new Message(MessageType.QUERY_ALL, null);
};
const responseAllMsg = (ltvCoin) => {
  return new Message(MessageType.RESPONSE_BLOCKCHAIN, JSON.stringify(ltvCoin));
};

const broadcastLatest = () => {
  boardcast(responseLatestMsg());
};
///////////

function initP2PServer(ltvCoin, p2pPort) {
  const server = new WebSocket.Server({ port: p2pPort });

  server.on("connection", (ws) => {
    console.log(
      ws._socket.remoteAddress +
        ":" +
        ws._socket.remotePort +
        " is try to connecting"
    );
    initConnection(ws, ltvCoin);
  });
  console.log("listening websocket p2p port on: " + p2pPort);
}

const initConnection = (ws, ltvCoin) => {
  sockets.push(ws); // thêm nodes vào danh sách
  initMessageHandler(ws, ltvCoin);
  initErrorHandler(ws);
  write(ws, queryLatestBlockMsg()); // when connect ask for latest block it have
};

const connectToPeer = (newPeer, ltvCoin) => {
  const ws = new WebSocket(newPeer);
  ws.on("open", () => {
    initConnection(ws, ltvCoin);
  });
  ws.on("error", () => {
    console.log("Connect error");
  });
};
const getSockets = () => sockets;
module.exports.initP2PServer = initP2PServer;
module.exports.broadcastLatest = broadcastLatest;
module.exports.connectToPeer = connectToPeer;
module.exports.getSockets = getSockets;
