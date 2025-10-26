import React, { useState, useEffect } from 'react'
import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
import { parseEther, formatEther } from 'viem'

const MarketCard = ({ market, contractConfig, userAddress, isConnected }) => {
  const [betAmount, setBetAmount] = useState('')
  const [userBet, setUserBet] = useState(null)
  const [currentPrice, setCurrentPrice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Get user's bet information
  const { data: userBetData } = useContractRead({
    ...contractConfig,
    functionName: 'getUserBet',
    args: [market.id, userAddress],
    enabled: !!userAddress
  })

  // Get current price
  const { data: priceData } = useContractRead({
    ...contractConfig,
    functionName: 'getCurrentPrice',
    args: [market.asset],
    watch: true
  })

  // Place bet transaction
  const { write: placeBet, data: placeBetData } = useContractWrite({
    ...contractConfig,
    functionName: 'placeBet',
    args: [market.id],
    value: betAmount ? parseEther(betAmount) : undefined
  })

  // Settle market transaction
  const { write: settleMarket, data: settleData } = useContractWrite({
    ...contractConfig,
    functionName: 'settleMarket',
    args: [market.id]
  })

  // Withdraw funds transaction
  const { write: withdrawFunds, data: withdrawData } = useContractWrite({
    ...contractConfig,
    functionName: 'withdrawFunds',
    args: [market.id]
  })

  // Wait for transactions
  const { isLoading: isPlacingBet } = useWaitForTransaction({
    hash: placeBetData?.hash
  })

  const { isLoading: isSettling } = useWaitForTransaction({
    hash: settleData?.hash
  })

  const { isLoading: isWithdrawing } = useWaitForTransaction({
    hash: withdrawData?.hash
  })

  useEffect(() => {
    if (userBetData) {
      setUserBet({
        betAmount: userBetData.betAmount,
        hasBet: userBetData.hasBet
      })
    }
  }, [userBetData])

  useEffect(() => {
    if (priceData) {
      setCurrentPrice(formatEther(priceData))
    }
  }, [priceData])

  const handlePlaceBet = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      setMessage('Please enter a valid bet amount')
      return
    }

    setLoading(true)
    setMessage('')
    
    try {
      await placeBet()
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSettleMarket = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      await settleMarket()
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawFunds = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      await withdrawFunds()
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString()
  }

  const getMarketStatus = () => {
    if (market.isSettled) return { text: 'Settled', class: 'status-settled' }
    if (Date.now() / 1000 > market.endTime) return { text: 'Ended', class: 'status-ended' }
    return { text: 'Active', class: 'status-active' }
  }

  const status = getMarketStatus()

  return (
    <div className="market-card">
      <div className="market-header">
        <div className="asset-symbol">{market.asset}</div>
        <div className={`market-status ${status.class}`}>
          {status.text}
        </div>
      </div>

      <div className="market-info">
        <div className="info-row">
          <span className="info-label">Target Price:</span>
          <span className="info-value price-highlight">
            ${formatPrice(market.targetPrice)}
          </span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Current Price:</span>
          <span className="info-value">
            {currentPrice ? `$${formatPrice(currentPrice)}` : 'Loading...'}
          </span>
        </div>
        
        <div className="info-row">
          <span className="info-label">End Time:</span>
          <span className="info-value">
            {formatTime(market.endTime)}
          </span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Total Pool:</span>
          <span className="info-value">
            {formatEther(market.totalPool)} ETH
          </span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Participants:</span>
          <span className="info-value">
            {market.participantCount}
          </span>
        </div>
      </div>

      {message && (
        <div className={message.includes('Error') ? 'error' : 'success'}>
          {message}
        </div>
      )}

      <div className="bet-section">
        {!isConnected ? (
          <p>Please connect your wallet to place bets</p>
        ) : userBet?.hasBet ? (
          <div>
            <p>You have placed a bet of {formatEther(userBet.betAmount)} ETH</p>
            {market.isSettled && (
              <button 
                className="btn btn-primary" 
                onClick={handleWithdrawFunds}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw Funds'}
              </button>
            )}
          </div>
        ) : market.isActive && Date.now() / 1000 < market.endTime ? (
          <div>
            <input
              type="number"
              className="bet-input"
              placeholder="Enter bet amount (ETH)"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              step="0.001"
              min="0.001"
            />
            <button 
              className="btn btn-primary" 
              onClick={handlePlaceBet}
              disabled={loading || isPlacingBet}
            >
              {isPlacingBet ? 'Placing Bet...' : 'Place Bet'}
            </button>
          </div>
        ) : (
          <p>This market is no longer accepting bets</p>
        )}

        {!market.isSettled && Date.now() / 1000 >= market.endTime && (
          <button 
            className="btn btn-secondary" 
            onClick={handleSettleMarket}
            disabled={isSettling}
          >
            {isSettling ? 'Settling...' : 'Settle Market'}
          </button>
        )}
      </div>
    </div>
  )
}

export default MarketCard
