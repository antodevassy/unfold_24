const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}
const ID = 1
const NAME = "Shoes"
const CATEGORY = "Clothing"
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
const COST = tokens(1)
const RATING = 4
const STOCK = 5

describe("Auction", () => {
  let auction
  let deployer,buyer
  beforeEach(async () => {
    //setup accounts
    [deployer, buyer] = await ethers.getSigners()
    console.log(deployer,buyer)
    //deploy contracts
    const Auction = await ethers.getContractFactory("Auction")
    auction = await Auction.deploy()
  })
  describe("Deployment",() => {
    it('sets the owner', async () => {
      expect(await auction.owner()).to.equal(deployer.address)
    })
    it('has a name',async () => {
      expect(await auction.name()).to.equal("Auction")
    })
  })
  describe("Listing",() => {
    let transaction
    beforeEach(async () =>{
      transaction = await auction.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )
      await transaction.wait()
    })
    it('Listing', async () => {
    const item = await auction.items(ID);

    expect(item.id).to.equal(ID);
    expect(item.name).to.equal(NAME);
    expect(item.category).to.equal(CATEGORY);
    expect(item.image).to.equal(IMAGE);
    expect(item.cost).to.equal(COST);
    expect(item.rating).to.equal(RATING);
    expect(item.stock).to.equal(STOCK);
    })
    it ("Emits List event", () => {
      expect(transaction).to.emit(auction,"List");
    })
  })
  describe("Buying products",() => {
    let transaction
    beforeEach(async () =>{
      transaction = await auction.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )
      await transaction.wait()
      transaction = await auction.connect(buyer).buy(ID,{ value: COST })
    
    })
    it ("updates buyers orderCount", async () =>{
      const result = await auction.orderCount(buyer.address)
      expect(result).to.equal(1)
    })
    it ("Adds the order", async () =>{
      const order = await auction.orders(buyer.address, 1)
      expect(order.time).to.be.greaterThan(0)
      expect(order.item.name).to.equal(NAME)
    })
    it ("updates contract Balance", async () =>{
      const result = await ethers.provider.getBalance(auction.address)
      console.log(result)
      expect(result).to.equal(COST)
    })
    it ("Emits Buy event", () => {
      expect(transaction).to.emit(auction,"Buy");
    })
  })
  describe("Withdrawing", () => {
    let balanceBefore

    beforeEach(async () => {
      // List a item
      let transaction = await auction.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()

      // Buy a item
      transaction = await auction.connect(buyer).buy(ID, { value: COST })
      await transaction.wait()

      // Get Deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      // Withdraw
      transaction = await auction.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(auction.address)
      expect(result).to.equal(0)
    })
  })
})
