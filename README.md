# Test Application for hashinal-wc Fixes

This application tests critical fixes and improvements made to the `@hashgraphonline/hashinal-wc` SDK.

## Overview

This test suite validates three primary fixes:

1. **Signer null check ordering** - Prevents crashes when signer is undefined
2. **Automatic node account ID configuration** - Eliminates manual node ID setup
3. **Multi-signature transaction support** - Upgraded to HWC 2.0.4-canary with frozen transaction signing fixes

## Fixes Being Tested

### 1. Signer Null Check Fix

**Location:** `hashinal-wc/src/index.ts:221-223`

The signer instance is now validated before use, preventing null reference errors.

**Before:**
```typescript
const signer = this.dAppConnector.signers.find(...);
// signer used here without validation
const network = signer.getNetwork(); // Could crash if signer is null
```

**After:**
```typescript
const signer = this.dAppConnector.signers.find(...);

if (!signer) {
  throw new Error('No signer available. Please ensure wallet is connected.');
}

const network = signer.getNetwork(); // Safe to use
```

### 2. Node Account ID Auto-Configuration

**Location:** `hashinal-wc/src/index.ts:228-244`

Transactions previously failed with:
```
nodeAccountId must be set or client must be provided with freezeWith
```

The SDK now automatically extracts and configures node account IDs from the signer's network configuration:

```typescript
const nodeAccountIds = tx.nodeAccountIds || [];
if (nodeAccountIds.length === 0) {
  const network = signer.getNetwork();
  const networkNodeIds = Object.values(network)
    .filter((value) => value instanceof AccountId)
    .slice(0, HashinalsWalletConnectSDK.MAX_NODE_ACCOUNT_IDS);

  tx.setNodeAccountIds(networkNodeIds);
}
```

The magic number `3` has been replaced with the constant `MAX_NODE_ACCOUNT_IDS` for maintainability.

### 3. Multi-Signature Support

**Version:** HWC 2.0.4-canary.3ca04e9.0

Includes the fix from [PR #608](https://github.com/hashgraph/hedera-wallet-connect/pull/608) which resolves a critical bug in frozen transaction signing for multi-signature workflows.

## Setup

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)
- Hedera testnet account with at least 5 HBAR

### Installation

```bash
pnpm install
```

### Configuration

Create a `.env` file in the project root:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Running the Application

```bash
pnpm dev
```

The application will be available at http://localhost:5173

## Test Suite

### Automated Tests

The test suite includes the following test categories:

**Connection Tests**
- Account information retrieval
- Balance fetching
- Network detection

**Signer Validation Tests**
- Null check enforcement
- Signer availability verification

**Node Account ID Tests**
- Automatic node configuration via `submitMessageToTopic()`
- Manual transaction creation without node IDs
- Network-based node selection

**Error Handling Tests**
- Invalid topic ID handling
- User-friendly error messages
- Transaction error wrapping

**Mirror Node Tests**
- Account data retrieval
- Token balance queries
- NFT listing

**Message Fetching Tests**
- Topic message retrieval
- Message pagination

**Network Prefix Tests**
- Mainnet/testnet detection
- Correct mirror node endpoint selection

### Running Tests

1. Navigate to the Connection tab and connect your wallet
2. Switch to the Tests tab
3. Enter a valid topic ID (or create a new topic)
4. Click "Run All Tests"
5. View results in the Results tab

Results can be exported as Markdown for documentation purposes.

### Manual Testing

The Manual Tests tab provides individual controls for:

- Topic creation
- Message submission
- Transaction execution

This allows for testing specific scenarios and edge cases.

## Project Structure

```
test-hashinal-wc-fix/
├── src/
│   ├── App.jsx              # Original test interface
│   ├── ImprovedApp.jsx      # Enhanced test interface with automation
│   ├── testRunner.js        # Automated test framework
│   ├── testUtils.js         # Testing utilities and helpers
│   ├── ErrorBoundary.jsx    # React error boundary component
│   └── main.jsx             # Application entry point
├── TEST_SCENARIOS.md        # Detailed test scenarios
├── TESTING_GUIDE.md         # Comprehensive testing documentation
├── README.md                # This file
└── package.json
```

## Test Results Example

```
Test Summary
Total Tests: 15
Passed: 15
Failed: 0
Duration: 3524ms
Success Rate: 100.0%
```

## Validation Matrix

| Component | Status | Test Method | Code Location |
|-----------|--------|-------------|---------------|
| Signer Null Check | Fixed | `testSignerValidation()` | index.ts:221-223 |
| Node Auto-Config | Fixed | `testNodeAccountIDs()` | index.ts:228-244 |
| Multi-Sig Support | Fixed | Version verification | HWC 2.0.4-canary |
| Magic Number Constant | Fixed | Code inspection | index.ts:66 |
| Error Messages | Improved | `testErrorHandling()` | Various |

## Troubleshooting

### Connection Issues

**Wallet not connecting**
- Verify WalletConnect Project ID is correct in `.env`
- Restart development server after changing `.env`
- Check that wallet supports WalletConnect v2
- Disable browser popup blockers

**"No signer available" error**
- Reconnect wallet through the UI
- Use the "Validate Connection" button to check state
- Review browser console for detailed error information

**"401 Unauthorized" error**
- WalletConnect Project ID is invalid or missing
- Recreate `.env` file with valid Project ID
- Restart development server

### Test Failures

**Tests timing out**
- Verify testnet network connectivity
- Check account has sufficient HBAR balance
- Ensure topic ID exists and is accessible

**"nodeAccountId must be set" error**
- This indicates the fix was not properly applied
- Verify yalc package is up to date
- Rebuild hashinal-wc package

## Dependencies

Key dependencies and their versions:

- `@hashgraphonline/hashinal-wc`: 1.0.119
- `@hashgraph/hedera-wallet-connect`: 2.0.4-canary.3ca04e9.0
- `@hashgraph/sdk`: ^2.76.0
- `react`: ^19.1.1

## Documentation

- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Complete testing procedures
- [TEST_SCENARIOS.md](./TEST_SCENARIOS.md) - Detailed test case documentation
- [Hashinal WC Documentation](https://docs.hashgraphonline.com)
- [Hedera Documentation](https://docs.hedera.com)

## Contributing

Report issues at: https://github.com/hashgraphonline/hashinal-wc/issues

## License

Apache-2.0
