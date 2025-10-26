# FHEVM Prediction Market - Development Guide

## Project Overview

This is an FHEVM-based prediction market demo that implements blind betting functionality for cryptocurrency price predictions. The project uses Chainlink as the price oracle and Web3Modal for wallet integration.

## Tech Stack

### Backend (Contracts)
- **Solidity 0.8.19** - Smart contract development
- **Hardhat** - Development framework
- **Chainlink** - Price oracle
- **OpenZeppelin** - Security contract library

### Frontend (Frontend)
- **React 18** - Frontend framework
- **Vite** - Build tool
- **Web3Modal** - Wallet connection
- **Wagmi** - Ethereum React Hooks
- **Viem** - TypeScript Ethereum library

## Quick Start

### 1. Install Dependencies

```bash
# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

**Note**: The project uses stable versions of Web3Modal and other dependencies. FHEVM integration is prepared for future implementation when the official packages become available.

### 2. Environment Configuration

#### Contract Environment Variables
Copy `contracts/env.template` to `contracts/.env` and fill in:

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

#### Frontend Environment Variables
Copy `frontend/env.template` to `frontend/.env` and fill in:

```bash
VITE_PROJECT_ID=your_walletconnect_project_id_here
VITE_CONTRACT_ADDRESS=your_deployed_contract_address_here
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

### 3. Compile and Test

```bash
# Compile contracts
cd contracts
npm run compile

# Run tests
npm test
```

### 4. Deploy Contracts

```bash
# Deploy to Sepolia testnet
npm run deploy

# Deploy to local network
npm run deploy:local
```

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

## Features

### Core Features
1. **Blind Betting** - Uses FHEVM to implement encrypted betting, hiding the number of participants for each option
2. **Price Prediction** - Supports price predictions for major cryptocurrencies like ETH, BTC
3. **Chainlink Integration** - Uses Chainlink price oracle to get real-time prices
4. **Wallet Integration** - Supports mainstream wallets like MetaMask, WalletConnect

### Contract Features
- Create prediction markets
- Blind betting functionality
- Market settlement
- Fund withdrawal
- Price queries

### Frontend Features
- Wallet connection
- Market list display
- Betting interface
- Transaction status tracking

## Deploy to Sepolia

### 1. Get Test ETH
Visit [Sepolia Faucet](https://sepoliafaucet.com/) to get test ETH

### 2. Configure Environment Variables
Ensure all environment variables are properly configured

### 3. Deploy Contracts
```bash
cd contracts
npm run deploy
```

### 4. Update Frontend Configuration
Update the deployed contract address in frontend environment variables

### 5. Build and Deploy Frontend
```bash
cd frontend
npm run build
# Deploy the dist directory to your static hosting service
```

## Development Notes

### Contract Architecture
- `PredictionMarket.sol` - Main contract
- Uses Chainlink price oracle to get real-time prices
- Implements blind betting mechanism
- Supports multi-market management

### Frontend Architecture
- `App.jsx` - Main application component
- `Header.jsx` - Header component (wallet connection)
- `MarketList.jsx` - Market list component
- `MarketCard.jsx` - Individual market card component

### Security Considerations
- Uses ReentrancyGuard to prevent reentrancy attacks
- Uses Ownable for access control
- Price oracle verification ensures data accuracy

## Troubleshooting

### Common Issues

1. **Contract Deployment Failed**
   - Check RPC URL and private key configuration
   - Ensure account has sufficient ETH

2. **Frontend Connection Failed**
   - Check Web3Modal project ID
   - Confirm contract address is correct

3. **Price Fetch Failed**
   - Check Chainlink price oracle address
   - Confirm network connection is normal

## Contributing

1. Fork the project
2. Create a feature branch
3. Commit changes
4. Create a Pull Request

## License

MIT License