import React from 'react'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { Web3Modal } from '@web3modal/react'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

import MarketList from './components/MarketList'
import Header from './components/Header'
import './App.css'

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia],
  [w3mProvider({ projectId: import.meta.env.VITE_PROJECT_ID }), publicProvider()]
)

// Configure wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: import.meta.env.VITE_PROJECT_ID,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

// Configure modal ethereum client
const ethereumClient = new EthereumClient(config, chains)

function App() {
  return (
    <WagmiConfig config={config}>
      <div className="App">
        <Header />
        <main className="main-content">
          <MarketList />
        </main>
        <Web3Modal
          projectId={import.meta.env.VITE_PROJECT_ID}
          ethereumClient={ethereumClient}
        />
      </div>
    </WagmiConfig>
  )
}

export default App
