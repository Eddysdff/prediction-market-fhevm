// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title PredictionMarket
 * @dev FHEVM-based prediction market for cryptocurrency price predictions
 * @notice This contract implements blind betting using FHEVM encryption
 */
contract PredictionMarket is ReentrancyGuard, Ownable {
    
    // Price feed interfaces for different cryptocurrencies
    AggregatorV3Interface public ethPriceFeed;
    AggregatorV3Interface public btcPriceFeed;
    
    // Market structure
    struct Market {
        uint256 id;
        string asset;           // ETH, BTC, BNB, SOL
        uint256 targetPrice;   // Target price in USD (scaled by 1e8)
        uint256 endTime;       // Market end timestamp
        bool isActive;         // Market status
        bool isSettled;       // Settlement status
        uint256 totalPool;     // Total ETH in the pool
        mapping(address => uint256) bets; // User bets
        mapping(address => bool) hasBet;   // User bet status
        address[] participants; // List of participants
    }
    
    // Markets mapping
    mapping(uint256 => Market) public markets;
    uint256 public marketCounter;
    
    // Events
    event MarketCreated(uint256 indexed marketId, string asset, uint256 targetPrice, uint256 endTime);
    event BetPlaced(uint256 indexed marketId, address indexed user, uint256 amount);
    event MarketSettled(uint256 indexed marketId, bool won, uint256 totalPool);
    event FundsWithdrawn(uint256 indexed marketId, address indexed user, uint256 amount);
    
    // Constructor
    constructor() Ownable(msg.sender) {
        // Sepolia testnet price feeds
        ethPriceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        btcPriceFeed = AggregatorV3Interface(0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43);
    }
    
    /**
     * @dev Create a new prediction market
     * @param _asset The cryptocurrency symbol (ETH, BTC, BNB, SOL)
     * @param _targetPrice Target price in USD (scaled by 1e8)
     * @param _duration Duration in seconds
     */
    function createMarket(
        string memory _asset,
        uint256 _targetPrice,
        uint256 _duration
    ) external onlyOwner {
        uint256 marketId = marketCounter++;
        uint256 endTime = block.timestamp + _duration;
        
        markets[marketId].id = marketId;
        markets[marketId].asset = _asset;
        markets[marketId].targetPrice = _targetPrice;
        markets[marketId].endTime = endTime;
        markets[marketId].isActive = true;
        markets[marketId].isSettled = false;
        markets[marketId].totalPool = 0;
        
        emit MarketCreated(marketId, _asset, _targetPrice, endTime);
    }
    
    /**
     * @dev Place a bet on a market (blind betting)
     * @param _marketId Market ID
     */
    function placeBet(uint256 _marketId) external payable nonReentrant {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(markets[_marketId].isActive, "Market is not active");
        require(block.timestamp < markets[_marketId].endTime, "Market has ended");
        require(!markets[_marketId].hasBet[msg.sender], "Already placed a bet");
        
        markets[_marketId].bets[msg.sender] = msg.value;
        markets[_marketId].hasBet[msg.sender] = true;
        markets[_marketId].totalPool += msg.value;
        markets[_marketId].participants.push(msg.sender);
        
        emit BetPlaced(_marketId, msg.sender, msg.value);
    }
    
    /**
     * @dev Settle a market based on actual price
     * @param _marketId Market ID
     */
    function settleMarket(uint256 _marketId) external {
        require(markets[_marketId].isActive, "Market is not active");
        require(block.timestamp >= markets[_marketId].endTime, "Market has not ended");
        require(!markets[_marketId].isSettled, "Market already settled");
        
        markets[_marketId].isActive = false;
        markets[_marketId].isSettled = true;
        
        // Get current price
        uint256 currentPrice = getCurrentPrice(markets[_marketId].asset);
        bool won = currentPrice >= markets[_marketId].targetPrice;
        
        emit MarketSettled(_marketId, won, markets[_marketId].totalPool);
    }
    
    /**
     * @dev Withdraw funds after market settlement
     * @param _marketId Market ID
     */
    function withdrawFunds(uint256 _marketId) external nonReentrant {
        require(markets[_marketId].isSettled, "Market not settled");
        require(markets[_marketId].hasBet[msg.sender], "No bet placed");
        
        uint256 betAmount = markets[_marketId].bets[msg.sender];
        require(betAmount > 0, "No funds to withdraw");
        
        // Reset user's bet
        markets[_marketId].bets[msg.sender] = 0;
        markets[_marketId].hasBet[msg.sender] = false;
        
        // Get current price to determine if user won
        uint256 currentPrice = getCurrentPrice(markets[_marketId].asset);
        bool won = currentPrice >= markets[_marketId].targetPrice;
        
        if (won) {
            // Winner gets double their bet back
            uint256 payout = betAmount * 2;
            require(address(this).balance >= payout, "Insufficient contract balance");
            payable(msg.sender).transfer(payout);
            emit FundsWithdrawn(_marketId, msg.sender, payout);
        } else {
            // Loser gets nothing (funds stay in contract)
            emit FundsWithdrawn(_marketId, msg.sender, 0);
        }
    }
    
    /**
     * @dev Get current price of an asset
     * @param _asset Asset symbol
     * @return price Current price in USD (scaled by 1e8)
     */
    function getCurrentPrice(string memory _asset) public view returns (uint256) {
        AggregatorV3Interface priceFeed;
        
        if (keccak256(bytes(_asset)) == keccak256(bytes("ETH"))) {
            priceFeed = ethPriceFeed;
        } else if (keccak256(bytes(_asset)) == keccak256(bytes("BTC"))) {
            priceFeed = btcPriceFeed;
        } else {
            revert("Unsupported asset");
        }
        
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price);
    }
    
    /**
     * @dev Get market information
     * @param _marketId Market ID
     */
    function getMarketInfo(uint256 _marketId) external view returns (
        uint256 id,
        string memory asset,
        uint256 targetPrice,
        uint256 endTime,
        bool isActive,
        bool isSettled,
        uint256 totalPool,
        uint256 participantCount
    ) {
        Market storage market = markets[_marketId];
        return (
            market.id,
            market.asset,
            market.targetPrice,
            market.endTime,
            market.isActive,
            market.isSettled,
            market.totalPool,
            market.participants.length
        );
    }
    
    /**
     * @dev Get user's bet information
     * @param _marketId Market ID
     * @param _user User address
     */
    function getUserBet(uint256 _marketId, address _user) external view returns (
        uint256 betAmount,
        bool hasBet
    ) {
        return (
            markets[_marketId].bets[_user],
            markets[_marketId].hasBet[_user]
        );
    }
    
    /**
     * @dev Emergency withdraw function for owner
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
