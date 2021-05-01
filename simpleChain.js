/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256')


// Configure LevelDB to persist data
const level = require('level')
const chainDB = './chaindata'
const db = level(chainDB)


// 1. import block class
const Block = require('./Block')



/* ===== Blockchain Class ==========================
|  2. Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
  constructor () {
    // ToDo: Genesis block persist as the first block in the blockchain using LevelDB.
    this.getBlockHeight().then((height) => {
      // console.log(height)  // DEBUG
      if (height === -1) this.addBlock(new Block('Genesis block')).then(() => console.log('Genesis block stored!'))
    })
  }




  // 2.1 Add new block <---------------
  // ToDo: addBlock(newBlock) function includes a method to store newBlock with LevelDB.
  async addBlock (newBlock) {
    // previous block height
    let previousBlockHeight = parseInt(await this.getBlockHeight())
    // Block height
    newBlock.height = previousBlockHeight + 1
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0, -3)
    // previous block hash
    if (newBlock.height > 0) {
      let previousBlock = await this.getBlock(previousBlockHeight)
      newBlock.previousBlockHash = previousBlock.hash
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()

    // Adding block object to levelDB ( use 3.2)
    await this.addLevelDBData(newBlock.height, JSON.stringify(newBlock))
  }



  // 2.2. Get block height (use 3.1) <-------------
  // ToDo: Modify getBlockHeight() function to retrieve current block height within the LevelDB chain.
  async getBlockHeight () {
    return await this.getBlockHeightLevel()
  }




  // 2.3 get block (use  3.3) <---------------
  // ToDo: Modify getBlock() function to retrieve a block by it's block heigh within the LevelDB chain.
  async getBlock (blockHeight) {
    // return object as a single string
    return JSON.parse(await this.getLevelDBData(blockHeight))
  }


  // =================   2.4. VALIDATION ============================

  // 2.4.1. validate block <----------------------
  // ToDo: Modify the validateBlock() function to validate a block stored within levelDB
  async validateBlock (blockHeight) {
    // get block object
    let block = await this.getBlock(blockHeight)
    // get block hash
    let blockHash = block.hash
    // remove block hash to test block integrity
    block.hash = ''

    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString()

    // Compare
    if (blockHash === validBlockHash) {
      // return true if block is valid
      return true
    } else {
      console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash)
      return false
    }
  }

  // 2.4.2. Validate blockchain  <-------------------
  // ToDo: Modify the validateChain() function to validate blockchain stored within levelDB
  async validateChain () {
    let errorLog = []
    let blockChainHeight = await this.getBlockHeight()


    for (let i = 0; i < blockChainHeight+1; i++) {

      // validate a single block
      let isValidBlock = await this.validateBlock(i)
      if (!isValidBlock) errorLog.push(i)

      // compare blocks hash link
      let blockHash =  await this.getBlock(i).hash
      let previousHash = await this.getBlock(i + 1).previousBlockHash

      if (blockHash !== previousHash) {
        errorLog.push(i)
      }

    }



    if (errorLog.length > 0) {
      console.log('Block errors = ' + errorLog.length)
      console.log('Blocks: ' + errorLog)
    } else {
      console.log('No errors detected')
    }

  }



// ============= 3. LEVALDB HELPER FUNCTIONS ==============================

  /* ===== level db methods =====================================
  |  Methods responsible for persisting data
  |               |
  |  return new Promise(function(resolve, reject){  // code });
  | 		          |
  |  Learn more: level: https://github.com/Level/level      	|
  |  ==========================================================*/


  // 3.1 get block height <----------------
  getBlockHeightLevel () {
    return new Promise((resolve, reject) => {
      let height = -1
      db.createReadStream().on('data', (data) => {
        height++
      }).on('error', (err) => {
        console.log('Unable to read data stream!', err)
        reject(err)
      }).on('close', () => {
        // console.log('Blockchain height is #' + height)
        resolve(height)
      })
    })
  }



  // 3.2 Data adder  <-----------------------
  // Add data to levelDB with key/value pair
  addLevelDBData (key, value) {
    return new Promise((resolve, reject) => {
      db.put(key, value, (err) => {
        if (err) {
          console.log('Block ' + key + ' submission failed', err)
          reject(err)
        }
        else {
          console.log('Block #' + key + ' stored')
          resolve(value)
        }
      })
    })
  }



  // 3.3 Data getter  <----------------------
  // Get data from levelDB with key
  getLevelDBData (key) {
    return new Promise((resolve, reject) => {
      db.get(key, (err, value) => {
        if (err) {
          console.log('Not found!', err)
          reject(err)
        } else {
          // console.log('Value = ' + value)
          resolve(value)
        }
      })
    })
  }

}
