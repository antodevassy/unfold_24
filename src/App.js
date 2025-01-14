import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import Auction from './abis/Auction.json'

// Config
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [auction,setAuction] = useState(null)
  const [account, setAccount] = useState(null)

  const [electronics, setElectronics] = useState(null)
  const [clothing, setClothing] = useState(null)
  const [toys, setToys] = useState(null)

  const [item, setItem] = useState({})
  const [toggle, setToggle] = useState(false)

  const togglePop = (item) => {
    setItem(item)
    toggle ? setToggle(false) : setToggle(true)
  }

  const loadBlockChainData = async () =>{
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()
    //connect to smart contracts
    console.log(network)
    console.log(Array.isArray(Auction), Auction)
    const auction = new ethers.Contract(config[network.chainId].dappazon.address, Auction.abi, provider)
    setAuction(auction)

    const items = []
    for (var i=0; i<9;i++){
      const item = await auction.items(i+1)
      console.log(item)
      items.push(item)
    }
    const electronics = items.filter((item) => item.category === 'electronics')
    const clothing = items.filter((item) => item.category === 'clothing')
    const toys = items.filter((item) => item.category === 'toys')

    setElectronics(electronics)
    setClothing(clothing)
    setToys(toys)
  }
  useEffect(()=>{
    loadBlockChainData()
  }, [])
  return (
    <div>
      <Navigation account={account} setAccount={setAccount}/>
      <h2>Auction</h2>
      {electronics && clothing && toys && (
        <>
          <Section title={"Clothing & Jewelry"} items={clothing} togglePop={togglePop} />
          <Section title={"Electronics & Gadgets"} items={electronics} togglePop={togglePop} />
          <Section title={"Toys & Gaming"} items={toys} togglePop={togglePop} />
        </>
      )}

      {toggle && (
        <Product item={item} provider={provider} account={account} dappazon={auction} togglePop={togglePop} />
      )}
    </div>
  );
}

export default App;
