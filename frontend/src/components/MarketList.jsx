import React, { useState, useEffect } from 'react'
import { useAccount, useContract, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
import MarketCard from './MarketCard'

const MarketList = () => {
  const { address, isConnected } = useAccount()
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Contract configuration
  const contractConfig = {
    address: import.meta.env.VITE_CONTRACT_ADDRESS,
    abi: [
      {
        "inputs": [],
        "name": "marketCounter",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "uint256", "name": "_marketId", "type": "uint256"}],
        "name": "getMarketInfo",
        "outputs": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "asset", "type": "string"},
          {"internalType": "uint256", "name": "targetPrice", "type": "uint256"},
          {"internalType": "uint256", "name": "endTime", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "bool", "name": "isSettled", "type": "bool"},
          {"internalType": "uint256", "name": "totalPool", "type": "uint256"},
          {"internalType": "uint256", "name": "participantCount", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "uint256", "name": "_marketId", "type": "uint256"}],
        "name": "placeBet",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "uint256", "name": "_marketId", "type": "uint256"}],
        "name": "settleMarket",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "uint256", "name": "_marketId", "type": "uint256"}],
        "name": "withdrawFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "uint256", "name": "_marketId", "type": "uint256"},
          {"internalType": "address", "name": "_user", "type": "address"}
        ],
        "name": "getUserBet",
        "outputs": [
          {"internalType": "uint256", "name": "betAmount", "type": "uint256"},
          {"internalType": "bool", "name": "hasBet", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "string", "name": "_asset", "type": "string"}],
        "name": "getCurrentPrice",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  }

  // Get market counter
  const { data: marketCounter } = useContractRead({
    ...contractConfig,
    functionName: 'marketCounter',
    watch: true
  })

  // Load markets
  useEffect(() => {
    const loadMarkets = async () => {
      if (!marketCounter || marketCounter === 0n) {
        setLoading(false)
        return
      }

      try {
        const marketPromises = []
        for (let i = 0; i < Number(marketCounter); i++) {
          marketPromises.push(
            fetch(`/api/market/${i}`).catch(() => null) // Fallback for when API is not available
          )
        }
        
        // For now, we'll create mock data since we don't have the full contract ABI loaded
        const mockMarkets = []
        for (let i = 0; i < Number(marketCounter); i++) {
          mockMarkets.push({
            id: i,
            asset: i % 2 === 0 ? 'ETH' : 'BTC',
            targetPrice: i % 2 === 0 ? '2000' : '30000',
            endTime: Date.now() + (3600 * 1000), // 1 hour from now
            isActive: true,
            isSettled: false,
            totalPool: '0.2',
            participantCount: 0
          })
        }
        
        setMarkets(mockMarkets)
        setLoading(false)
      } catch (err) {
        setError('Failed to load markets')
        setLoading(false)
      }
    }

    loadMarkets()
  }, [marketCounter])

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading markets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h2>Active Markets</h2>
        <p>Place your blind bets on cryptocurrency prices</p>
      </div>
      
      {markets.length === 0 ? (
        <div className="loading">No markets available</div>
      ) : (
        <div className="market-grid">
          {markets.map((market) => (
            <MarketCard 
              key={market.id} 
              market={market} 
              contractConfig={contractConfig}
              userAddress={address}
              isConnected={isConnected}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MarketList
