# Hashinal Wallet Connect - Test App

This is a test application for the Hashinal Wallet Connect SDK, specifically testing the node account ID fix.

## Quick Start

### 1. Get a WalletConnect Project ID

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Sign in or create an account
3. Create a new project
4. Copy your Project ID

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Replace `your_project_id_here` with your actual Project ID from step 1.

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run the Dev Server

```bash
pnpm dev
```

### 5. Connect Your Wallet

1. Click "Connect Wallet" in the app
2. Select your Hedera wallet (HashPack, Blade, etc.)
3. Approve the connection

## What This Tests

This app demonstrates the fix for the error:
```
"nodeAccountId must be set or client must be provided with freezeWith"
```

**Before the fix:** You had to manually set node account IDs on every transaction.

**After the fix:** The SDK automatically uses nodes from the wallet's network configuration.

## Features Tested

- ✅ Wallet connection via WalletConnect
- ✅ Automatic node account ID handling
- ✅ Topic message submission (`submitMessageToTopic()`)
- ✅ Manual transaction execution (`executeTransaction()`)

## Troubleshooting

### Error: "401 Unauthorized"
- Your WalletConnect Project ID is invalid or missing
- Make sure your `.env` file has the correct `VITE_WALLETCONNECT_PROJECT_ID`
- Restart your dev server after creating/updating `.env`

### Error: "Cannot convert undefined or null to object"
- Usually happens when PROJECT_ID is invalid
- Check that your `.env` file is in the project root
- Ensure you've restarted the dev server after creating `.env`

### Wallet Not Connecting
- Make sure you have a Hedera wallet installed (HashPack, Blade, etc.)
- Check that your wallet supports WalletConnect v2
- Try disconnecting and reconnecting

## Project Structure

```
test-hashinal-wc-fix/
├── src/
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Entry point
├── .env                 # Environment variables (create this)
├── .env.example         # Example env file
└── package.json         # Dependencies
```

## Dependencies

- `@hashgraphonline/hashinal-wc` - Hashinal Wallet Connect SDK
- `@hashgraph/sdk` - Hedera SDK
- `react` - React framework
- `vite` - Build tool

## License

See parent repository for license information.
