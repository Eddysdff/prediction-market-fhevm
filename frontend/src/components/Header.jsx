import React from 'react'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'

const Header = () => {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({
    address: address,
  })

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="wallet-section">
      <div className="header">
        <h1>🔮 FHEVM Prediction Market</h1>
        <p>Blind betting on cryptocurrency prices</p>
      </div>
      
      <div className="wallet-info">
        {isConnected ? (
          <>
            <div>
              <div className="wallet-address">{formatAddress(address)}</div>
              <div className="balance">
                Balance: {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 ETH'}
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => disconnect()}>
              Disconnect
            </button>
          </>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={() => connect({ connector: connectors[0] })}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  )
}

export default Header
