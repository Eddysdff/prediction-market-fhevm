const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying PredictionMarket contract...");

  // Get the contract factory
  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");

  // Deploy the contract
  const predictionMarket = await PredictionMarket.deploy();

  // Wait for deployment to complete
  await predictionMarket.waitForDeployment();

  const contractAddress = await predictionMarket.getAddress();
  console.log("PredictionMarket deployed to:", contractAddress);

  // Save contract address and ABI for frontend
  const fs = require('fs');
  const path = require('path');
  
  const contractInfo = {
    address: contractAddress,
    network: "sepolia",
    deployedAt: new Date().toISOString()
  };

  // Write to contracts directory
  const contractsDir = path.join(__dirname, '..', 'frontend', 'public', 'contracts');
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, 'contract-info.json'),
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("Contract info saved to frontend/public/contracts/contract-info.json");

  // Create some sample markets
  console.log("Creating sample markets...");
  
  // ETH market: Will ETH be above $2000 in 1 hour?
  await predictionMarket.createMarket("ETH", ethers.parseUnits("2000", 8), 3600);
  console.log("Created ETH market");

  // BTC market: Will BTC be above $30000 in 1 hour?
  await predictionMarket.createMarket("BTC", ethers.parseUnits("30000", 8), 3600);
  console.log("Created BTC market");

  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
