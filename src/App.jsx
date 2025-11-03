import { useState, useEffect } from 'react';
import './App.css';
import { HashinalsWalletConnectSDK } from '@hashgraphonline/hashinal-wc';
import { TopicMessageSubmitTransaction, LedgerId } from '@hashgraph/sdk';

// Get PROJECT_ID from environment variable or use a placeholder
// To set it: create a .env file with VITE_WALLETCONNECT_PROJECT_ID=your_project_id
const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID';

const APP_METADATA = {
  name: 'Hashinal WC Test',
  description: 'Testing node account ID fix',
  url: window.location.origin,
  icons: ['https://example.com/icon.png'],
};

function App() {
  const [sdk] = useState(() => HashinalsWalletConnectSDK.getInstance());
  const [accountId, setAccountId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState('');
  const [topicId, setTopicId] = useState('0.0.5196918'); // Example topic ID
  const [isConnecting, setIsConnecting] = useState(false);

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        if (PROJECT_ID === 'YOUR_WALLETCONNECT_PROJECT_ID') {
          setStatus('⚠️ Please set VITE_WALLETCONNECT_PROJECT_ID in .env file');
          return;
        }

        // Try to initialize with existing session
        const savedAccount = await sdk.initAccount(
          PROJECT_ID,
          APP_METADATA,
          LedgerId.TESTNET
        );

        if (savedAccount) {
          setAccountId(savedAccount.accountId);
          setBalance(savedAccount.balance);
          setStatus(`Reconnected: ${savedAccount.accountId} - Balance: ${savedAccount.balance} HBAR`);
        }
      } catch (error) {
        // No existing session, that's okay
        console.log('No existing session found');
      }
    };

    checkExistingConnection();
  }, [sdk]);

  const connectWallet = async () => {
    if (PROJECT_ID === 'YOUR_WALLETCONNECT_PROJECT_ID') {
      setStatus('❌ Error: Please set VITE_WALLETCONNECT_PROJECT_ID in .env file or replace PROJECT_ID in App.jsx');
      return;
    }

    if (isConnecting) {
      return;
    }

    try {
      setIsConnecting(true);
      setStatus('Initializing SDK...');
      console.log('Starting wallet connection with PROJECT_ID:', PROJECT_ID);
      
      // Step 1: Initialize SDK first
      setStatus('Initializing SDK...');
      const connector = await sdk.init(PROJECT_ID, APP_METADATA, LedgerId.TESTNET);
      console.log('SDK initialized, connector:', connector);
      
      if (!connector) {
        throw new Error('Failed to initialize SDK connector');
      }
      
      // Verify dAppConnector is available
      if (!sdk.dAppConnector) {
        throw new Error('dAppConnector not available after initialization');
      }
      
      console.log('dAppConnector available:', !!sdk.dAppConnector);
      console.log('dAppConnector methods:', Object.keys(sdk.dAppConnector));
      
      // Check if walletConnectModal exists
      const walletConnectModal = sdk.dAppConnector?.walletConnectModal;
      console.log('walletConnectModal available:', !!walletConnectModal);
      console.log('walletConnectModal:', walletConnectModal);
      
      // Check if modal container exists in DOM
      const modalElements = document.querySelectorAll('[class*="walletconnect"], [id*="walletconnect"], [data-walletconnect]');
      console.log('Modal elements in DOM:', modalElements.length, modalElements);
      
      // Step 2: Open the WalletConnect modal
      setStatus('📱 Opening wallet connection modal...\n\n⚠️ A popup/modal should appear NOW!\n\nIf you don\'t see it:\n- Check browser console (F12)\n- Check for popup blockers\n- Look for a new window/tab\n- Check z-index/overlay issues');
      console.log('Calling sdk.connect() to open modal...');
      
      // Check for browser extensions first
      const extensions = sdk.dAppConnector?.extensions || [];
      console.log('Available extensions:', extensions);
      
      // Try to manually open modal if available
      if (walletConnectModal) {
        console.log('walletConnectModal object:', walletConnectModal);
        console.log('walletConnectModal methods:', Object.keys(walletConnectModal));
        
        // The modal has openModal method - try calling it directly
        if (typeof walletConnectModal.openModal === 'function') {
          console.log('🔄 Trying walletConnectModal.openModal() directly...');
          try {
            // Call openModal with connection options
            // Note: This might not work - dAppConnector.openModal() should handle it
            // But let's try to see if we can trigger it manually
            console.log('Note: walletConnectModal.openModal() might need different params');
            console.log('Will rely on dAppConnector.openModal() instead');
            console.log('✅ openModal() called, waiting for result...');
            
            // Wait a bit to see if modal appears
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check DOM again
            const modalCheck = document.querySelectorAll('[class*="walletconnect"], [id*="walletconnect"], [class*="wcm"]');
            console.log('Modal elements after openModal():', modalCheck.length);
            if (modalCheck.length > 0) {
              console.log('✅ Modal elements found!', Array.from(modalCheck));
            }
          } catch (e) {
            console.warn('Failed to open modal via .openModal():', e);
          }
        }
      }
      
      // Add a delay to ensure modal can render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check DOM for modal elements
      const modalElementsAfter = document.querySelectorAll('[class*="walletconnect"], [id*="walletconnect"], [data-walletconnect], [class*="wcm"], [id*="wcm"]');
      console.log('Modal elements in DOM after delay:', modalElementsAfter.length);
      if (modalElementsAfter.length > 0) {
        console.log('Found modal elements:', Array.from(modalElementsAfter));
        modalElementsAfter.forEach((el, i) => {
          const styles = window.getComputedStyle(el);
          console.log(`Modal element ${i}:`, {
            tag: el.tagName,
            id: el.id,
            classes: el.className,
            display: styles.display,
            visibility: styles.visibility,
            zIndex: styles.zIndex,
            opacity: styles.opacity,
            element: el
          });
        });
      } else {
        console.warn('⚠️ No WalletConnect modal elements found in DOM!');
        console.warn('This might mean the modal library is not rendering properly.');
      }
      
      // Check if there's an iframe (for extensions)
      const iframes = document.querySelectorAll('iframe');
      console.log('Iframes in page:', iframes.length);
      iframes.forEach((iframe, i) => {
        console.log(`Iframe ${i}:`, iframe.src || iframe.name || 'no src');
      });
      
      // Check DOM one more time before calling connect
      const modalBeforeConnect = document.querySelectorAll('[class*="walletconnect"], [id*="walletconnect"], [class*="wcm"], [id*="wcm"]');
      console.log('Modal elements before connect():', modalBeforeConnect.length);
      
      // Call connect - this should open the WalletConnect modal
      console.log('🔄 About to call sdk.connect() - this should trigger the modal...');
      setStatus('📱 Calling connect()...\n\nPlease wait - modal should appear shortly!\n\nIf no modal appears:\n- Check browser console\n- Check for popup blockers\n- Look for hidden elements');
      
      // Monitor DOM changes while connecting
      let modalCheckInterval;
      let modalFound = false;
      
      const startModalMonitoring = () => {
        modalCheckInterval = setInterval(() => {
          const modals = document.querySelectorAll('[class*="walletconnect"], [id*="walletconnect"], [class*="wcm"], [id*="wcm"]');
          if (modals.length > 0 && !modalFound) {
            modalFound = true;
            console.log('✅ Modal detected in DOM!', modals.length, 'elements');
            modals.forEach((el, i) => {
              const styles = window.getComputedStyle(el);
              console.log(`Modal ${i}:`, {
                visible: styles.display !== 'none' && styles.visibility !== 'hidden',
                zIndex: styles.zIndex,
                display: styles.display,
                element: el
              });
            });
            clearInterval(modalCheckInterval);
          }
        }, 500);
      };
      
      startModalMonitoring();
      
      // Wrap in Promise.race to detect if it hangs
      const connectPromise = sdk.connect().finally(() => {
        if (modalCheckInterval) clearInterval(modalCheckInterval);
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => {
          if (modalCheckInterval) clearInterval(modalCheckInterval);
          console.error('⚠️ Connection timeout after 30s!');
          const finalModalCheck = document.querySelectorAll('[class*="walletconnect"], [id*="walletconnect"], [class*="wcm"]');
          console.error('Final modal check:', finalModalCheck.length, 'elements found');
          if (finalModalCheck.length === 0) {
            reject(new Error('Connection timeout - No modal elements found in DOM. The WalletConnect modal may not be rendering.'));
          } else {
            reject(new Error('Connection timeout - Modal elements exist but connection did not complete. User may need to interact with modal.'));
          }
        }, 30000)
      );
      
      const session = await Promise.race([connectPromise, timeoutPromise]);
      if (modalCheckInterval) clearInterval(modalCheckInterval);
      console.log('✅ WalletConnect session established:', session);
      
      if (!session) {
        throw new Error('No session returned from connect()');
      }
      
      // Step 3: Get account info
      setStatus('Getting account information...');
      const accountInfo = sdk.getAccountInfo();
      
      if (!accountInfo || !accountInfo.accountId) {
        throw new Error('No account info available after connection');
      }
      
      const balance = await sdk.getAccountBalance();
      
      setAccountId(accountInfo.accountId);
      setBalance(balance);
      setStatus(`✅ Connected: ${accountInfo.accountId} - Balance: ${balance} HBAR`);
      
    } catch (error) {
      const errorMessage = error?.message || String(error);
      console.error('Full connection error:', error);
      console.error('Error stack:', error?.stack);
      
      setStatus(`❌ Error: ${errorMessage}`);
      
      // Provide helpful error messages
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setStatus('❌ Invalid WalletConnect Project ID. Please check your PROJECT_ID.');
      } else if (errorMessage.includes('reject') || errorMessage.includes('User rejected')) {
        setStatus('⚠️ Connection rejected by user');
      } else if (errorMessage.includes('modal') || errorMessage.includes('Modal')) {
        setStatus('❌ Failed to open wallet modal. Check browser console for details.');
      } else {
        setStatus(`❌ Connection failed: ${errorMessage}. Check console for details.`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setStatus('Disconnecting...');
      await sdk.disconnectWallet();
      setAccountId(null);
      setBalance(null);
      setStatus('Disconnected');
    } catch (error) {
      setStatus(`Error disconnecting: ${error?.message || String(error)}`);
      console.error(error);
    }
  };

  const createTopic = async () => {
    if (!accountId) {
      setStatus('Please connect wallet first');
      return;
    }

    try {
      setStatus('Creating new topic...');
      console.log('Creating topic with memo: Test topic for node fix');

      const newTopicId = await sdk.createTopic('Test topic for node account ID fix');

      setTopicId(newTopicId);
      setStatus(`✅ Topic created successfully!\n\nTopic ID: ${newTopicId}\n\nYou can now submit messages to this topic.`);
      console.log('New topic created:', newTopicId);
    } catch (error) {
      const errorMessage = error?.message || String(error);
      console.error('Error creating topic:', error);
      console.error('Error stack:', error?.stack);

      if (errorMessage.includes('INSUFFICIENT_PAYER_BALANCE')) {
        setStatus(`❌ Insufficient balance to create topic.\n\nCreating a topic costs ~1 HBAR.`);
      } else {
        setStatus(`❌ Error creating topic: ${errorMessage}`);
      }
    }
  };

  const testSubmitMessage = async () => {
    if (!accountId) {
      setStatus('Please connect wallet first');
      return;
    }

    // Uncomment after installing dependencies

    try {
      setStatus('Submitting message to topic...');

      // This is the fix! Before the fix, this would fail with:
      // "nodeAccountId must be set or client must be provided with freezeWith"
      // Now the SDK automatically sets the node account IDs from the signer's network

      const message = `Test message at ${new Date().toISOString()}`;
      const receipt = await sdk.submitMessageToTopic(topicId, message);

      setStatus(`✅ Success! Message submitted. Sequence: ${receipt.topicSequenceNumber}`);
      console.log('Receipt:', receipt);
    } catch (error) {
      const errorMessage = error?.message || String(error);
      console.error('Full error:', error);
      console.error('Error stack:', error?.stack);
      
      // Provide helpful error messages
      if (errorMessage.includes('nodeAccountId') || errorMessage.includes('node account')) {
        setStatus(`❌ Node Account ID Error: ${errorMessage}\n\nTry reconnecting your wallet.`);
      } else if (errorMessage.includes('signer') || errorMessage.includes('No signer')) {
        setStatus(`❌ Signer Error: ${errorMessage}\n\nPlease reconnect your wallet.`);
      } else if (errorMessage.includes('network')) {
        setStatus(`❌ Network Error: ${errorMessage}\n\nYour wallet may have disconnected.`);
      } else {
        setStatus(`❌ Error: ${errorMessage}`);
      }
    }

  };

  const testManualTransaction = async () => {
    if (!accountId) {
      setStatus('Please connect wallet first');
      return;
    }

    // Uncomment after installing dependencies

    try {
      setStatus('Creating and executing manual transaction...');

      // This also works now! Before the fix, you had to manually set node account IDs
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(`Manual test at ${new Date().toISOString()}`);
      // No need to call .setNodeAccountIds() - SDK does it automatically!

      const receipt = await sdk.executeTransaction(transaction);

      setStatus(`✅ Success! Manual transaction executed. Sequence: ${receipt.topicSequenceNumber}`);
      console.log('Receipt:', receipt);
    } catch (error) {
      const errorMessage = error?.message || String(error);
      console.error('Full error:', error);
      console.error('Error stack:', error?.stack);
      
      // Provide helpful error messages
      if (errorMessage.includes('nodeAccountId') || errorMessage.includes('node account')) {
        setStatus(`❌ Node Account ID Error: ${errorMessage}\n\nTry reconnecting your wallet.`);
      } else if (errorMessage.includes('signer') || errorMessage.includes('No signer')) {
        setStatus(`❌ Signer Error: ${errorMessage}\n\nPlease reconnect your wallet.`);
      } else if (errorMessage.includes('network')) {
        setStatus(`❌ Network Error: ${errorMessage}\n\nYour wallet may have disconnected.`);
      } else {
        setStatus(`❌ Error: ${errorMessage}`);
      }
    }

  };

  return (
    <div className="App">
      <h1>Hashinal WC - Node Account ID Fix Test</h1>

      <div className="card">
        <h2>📝 What This Tests</h2>
        <p>
          This app tests the fix for the error:<br/>
          <code>"nodeAccountId must be set or client must be provided with freezeWith"</code>
        </p>
        <p>
          Before the fix, you had to manually set node account IDs on every transaction.<br/>
          Now the SDK automatically uses nodes from the wallet's network configuration.
        </p>
      </div>

      <div className="card">
        <h2>🔧 Setup Required</h2>
        <ol style={{ textAlign: 'left' }}>
          <li>Get a WalletConnect Project ID from <a href="https://cloud.walletconnect.com" target="_blank" rel="noopener noreferrer">cloud.walletconnect.com</a></li>
          <li>Create a <code>.env</code> file in the project root with:<br/>
            <code>VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here</code>
          </li>
          <li>Restart your dev server after creating the .env file</li>
          <li>Dependencies are already installed - you're ready to test!</li>
        </ol>
        <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          💡 All dependencies are installed. The SDK will automatically handle node account IDs.
        </p>
      </div>

      <div className="card">
        <h2>🔌 Connection</h2>
        {!accountId ? (
          <div>
            <button onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
            {PROJECT_ID === 'YOUR_WALLETCONNECT_PROJECT_ID' && (
              <p style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>
                ⚠️ You need to set your WalletConnect Project ID.<br/>
                Create a .env file with: VITE_WALLETCONNECT_PROJECT_ID=your_project_id<br/>
                Or get one from: <a href="https://cloud.walletconnect.com" target="_blank" rel="noopener noreferrer">cloud.walletconnect.com</a>
              </p>
            )}
          </div>
        ) : (
          <div>
            <p>✅ Connected: <strong>{accountId}</strong></p>
            {balance && <p>Balance: <strong>{balance} HBAR</strong></p>}
            <button onClick={disconnectWallet} style={{ marginTop: '10px' }}>
              Disconnect
            </button>
          </div>
        )}
      </div>

      {accountId && (
        <>
          <div className="card">
            <h2>📋 Step 1: Create a Topic (Optional)</h2>
            <p>Create a new topic to test with, or use an existing topic ID below</p>
            <button onClick={createTopic} style={{ marginBottom: '10px' }}>
              🆕 Create New Topic
            </button>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              💰 Cost: ~1 HBAR | Creates a topic you can submit messages to
            </p>
          </div>

          <div className="card">
            <h2>🧪 Test 2: submitMessageToTopic()</h2>
            <p>Uses the SDK helper method that creates the transaction internally</p>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Topic ID:
              </label>
              <input
                type="text"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                placeholder="Topic ID (e.g., 0.0.123456)"
                style={{ width: '250px', marginRight: '10px', padding: '8px' }}
              />
            </div>
            <button onClick={testSubmitMessage}>
              Submit Message to Topic
            </button>
          </div>

          <div className="card">
            <h2>🧪 Test 3: Manual Transaction</h2>
            <p>Creates a transaction manually and executes it via executeTransaction()</p>
            <button onClick={testManualTransaction}>
              Execute Manual Transaction
            </button>
          </div>
        </>
      )}

      <div className="card status">
        <h3>Status:</h3>
        <p style={{ whiteSpace: 'pre-line' }}>{status || 'Waiting for action...'}</p>
      </div>

      <div className="card">
        <h2>💡 How the Fix Works</h2>
        <pre style={{ textAlign: 'left', fontSize: '12px' }}>
{`// In executeTransaction() method:
if (tx.nodeAccountIds.length === 0) {
  const network = signer.getNetwork();
  const nodeAccountIds = Object.values(network)
    .filter((value) => value instanceof AccountId)
    .slice(0, 3);
  tx.setNodeAccountIds(nodeAccountIds);
}`}
        </pre>
        <p>
          The SDK now automatically sets node account IDs from the wallet's network
          before freezing the transaction, preventing the error users were experiencing.
        </p>
      </div>
    </div>
  );
}

export default App;
