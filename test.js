/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/

let blockchain = new Blockchain();
// blockchain.getBlockHeight()  // DEBUG
// blockchain.addBlock(new Block('teste'))  // DEBUG

// add 10 blocks in blockchain
(function theLoop (i) {
  setTimeout(() => {
    blockchain.addBlock(new Block(`Block # ${i}`)).then(() => {
      if (--i) theLoop(i)
    })
  }, 100)
})(10)

// validate blockchain
blockchain.validateChain()
