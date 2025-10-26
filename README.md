项目结构：
prediction-market-fhevm/
├── contracts/          # MacBook: Solidity + Hardhat 配置、脚本、测试
│   ├── src/            # 合约源代码 (e.g., FHEDPredictionMarket.sol)
│   ├── scripts/        # 部署脚本
│   ├── test/           # Hardhat 测试
│   ├── hardhat.config.js
│   └── package.json    # fhEVM 依赖
├── frontend/           # Windows: React app
│   ├── src/            # 组件、hooks (e.g., BetForm.jsx)
│   ├── public/         # ABI JSON、合约地址
│   ├── package.json    # ethers.js、@fhevm/react 等
│   └── vite.config.js  # 或 react-scripts
├── shared/             # 共享: ABI 类型定义、环境变量模板
│   └── types/          # e.g., contract-abi.json
└── README.md           # 开发指南