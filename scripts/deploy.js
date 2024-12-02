
const hre = require("hardhat")
const { items } = require("../src/items.json")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  const [deployer] = await ethers.getSigners()

  const Auction = await hre.ethers.getContractFactory("Auction")
  const auction = await Auction.deploy()
  await auction.deployed()

  console.log(`Deployed auction Contract at: ${Auction.address}\n`)

  // Listing items...
  for (let i = 0; i < items.length; i++) {
    const transaction = await auction.connect(deployer).list(
      items[i].id,
      items[i].name,
      items[i].category,
      items[i].image,
      tokens(items[i].price),
      items[i].rating,
      items[i].stock,
    )

    await transaction.wait()

    console.log(`Listed item ${items[i].id}: ${items[i].name}`)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
