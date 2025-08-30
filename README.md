# H2Ledger - Green Hydrogen Credits Platform

A decentralized platform for managing Green Hydrogen Credits (GHC) on the blockchain. Built with Next.js, Hardhat, and MetaMask integration.

## Features

- 🔐 **MetaMask Wallet Integration** - Secure wallet connection and management
- 🏭 **GHC Token Management** - Issue, transfer, and retire Green Hydrogen Credits
- 📊 **Real-time Portfolio Dashboard** - View your GHC holdings and batch information
- 🔗 **Blockchain Integration** - Built on Ethereum with Hardhat local network
- 🎨 **Modern UI/UX** - Beautiful, responsive interface with Tailwind CSS

## Prerequisites

- Node.js 18+
- MetaMask browser extension
- Git

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd H2Ledger
npm install
```

### 2. Start Local Hardhat Network

In a new terminal, start the local Hardhat node:

```bash
npx hardhat node
```

**Keep this terminal running!** You'll see output like:

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
...
```

### 3. Deploy Smart Contract

In another terminal, deploy the GHC token contract:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

You'll see output like:

```
Deploying GHC Token contract...
GHC Token deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Creating initial batches...
Batch 1 created: 100,000 GHC
Batch 2 created: 50,000 GHC
...
```

**Note the contract address** - you'll need this for MetaMask setup.

### 4. Configure MetaMask

1. **Add Hardhat Network to MetaMask:**

   - Open MetaMask
   - Click the network dropdown (usually shows "Ethereum Mainnet")
   - Select "Add Network" → "Add Network Manually"
   - Fill in:
     - **Network Name:** Hardhat Local
     - **New RPC URL:** http://127.0.0.1:8545
     - **Chain ID:** 31337
     - **Currency Symbol:** ETH
     - **Block Explorer URL:** (leave empty)

2. **Import Test Account:**
   - In MetaMask, click the account icon → "Import Account"
   - Copy one of the private keys from the Hardhat node output
   - Paste it and import

### 5. Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Connect Wallet

1. Click "Connect Wallet" on the homepage
2. Approve the MetaMask connection
3. You'll be redirected to the dashboard
4. View your portfolio and GHC batches

## Project Structure

```
H2Ledger/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── explorer/          # Blockchain explorer
│   ├── issue/            # Issue credits page
│   ├── retire/           # Retire credits page
│   └── layout.tsx        # Root layout
├── blockchain/            # Blockchain configuration
│   ├── contracts/        # Smart contracts
│   ├── scripts/          # Deployment scripts
│   └── hardhat.config.ts # Hardhat configuration
├── components/            # React components
│   ├── ui/               # UI components
│   ├── HomePage.tsx      # Homepage component
│   └── Navigation.tsx    # Navigation component
├── contexts/              # React contexts
│   └── WalletContext.tsx # Wallet management
├── lib/                   # Utility libraries
│   ├── contractService.ts # Contract interaction
│   └── utils.ts          # General utilities
└── README.md             # This file
```

## Smart Contracts

### GHC Token Contract

The main contract (`GHCToken.sol`) implements:

- **ERC-1155 Multi-Token Standard** for GHC batches
- **Batch Management** - Create and track GHC batches
- **Token Operations** - Mint, transfer, and retire credits
- **Access Control** - Owner-only functions for batch creation

## Development

### Adding New Features

1. **Smart Contract Changes:**

   - Modify contracts in `blockchain/contracts/`
   - Update deployment scripts in `blockchain/scripts/`
   - Redeploy with `npx hardhat run scripts/deploy.ts --network localhost`

2. **Frontend Changes:**
   - Update React components in `components/`
   - Modify pages in `app/`
   - Update contract service in `lib/contractService.ts`

### Testing

```bash
# Run Hardhat tests
npx hardhat test

# Run frontend tests
npm test
```

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Troubleshooting

### Common Issues

1. **"MetaMask not installed"**

   - Install MetaMask browser extension
   - Refresh the page

2. **"Wrong network"**

   - Ensure MetaMask is connected to Hardhat Local (Chain ID: 31337)
   - Check that Hardhat node is running on port 8545

3. **"Contract not found"**

   - Verify the contract address in your components
   - Ensure the contract was deployed successfully
   - Check Hardhat node is running

4. **"Transaction failed"**
   - Ensure you have sufficient ETH in your test account
   - Check that you're the contract owner for admin functions

### Reset Everything

If you need to start fresh:

```bash
# Stop all processes
# Delete artifacts and cache
rm -rf artifacts cache

# Restart Hardhat node
npx hardhat node

# Redeploy contract
npx hardhat run scripts/deploy.ts --network localhost

# Restart frontend
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:

- Check the troubleshooting section above
- Review the code comments
- Open an issue on GitHub

## UI Snaps

**1. Main Dashboard**
![Dashboard](https://i.ibb.co/sdykL6LC/Screenshot-2025-08-30-170937.png)

---

**2. Issue New Credits**
![Issue New Credits](https://i.ibb.co/LhRrzrGN/issue-new.png)

---

**3. Live Ledger Feed**
![Live Ledger Feed](https://i.ibb.co/pBX6twxC/live-ledger-feed.png)

---

**4. Portfolio Details**
![Portfolio Details](https://i.ibb.co/nsk8wvV9/dashboard.png)

---

**5. Settings Page**
![Settings](https://i.ibb.co/gFTz6pWv/Settings.png)
---

**Made by Love by Team DireDevs! 🐺🚀**
