import { useState, useEffect, useRef } from 'react';
import './App.css';
import { HashinalsWalletConnectSDK } from '@hashgraphonline/hashinal-wc';
import { TopicMessageSubmitTransaction, LedgerId } from '@hashgraph/sdk';
import { TestRunner } from './testRunner.js';
import { EdgeCaseTests } from './edgeCaseTests.js';
import { validateConnection, formatTestResults, TestLogger } from './testUtils.js';

// Get PROJECT_ID from environment variable or use a placeholder
const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID';

const APP_METADATA = {
  name: 'Hashinal WC Comprehensive Test Suite',
  description: 'Testing node account ID fix, signer validation, and multi-sig support',
  url: window.location.origin,
  icons: ['https://example.com/icon.png'],
};

function ImprovedApp() {
  const [sdk] = useState(() => HashinalsWalletConnectSDK.getInstance());
  const [accountId, setAccountId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState('');
  const [topicId, setTopicId] = useState('0.0.5196918');
  const [isConnecting, setIsConnecting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [activeTab, setActiveTab] = useState('connection');
  const [logs, setLogs] = useState([]);

  const testRunnerRef = useRef(null);
  const edgeCaseTestsRef = useRef(null);
  const loggerRef = useRef(new TestLogger('debug'));

  // Initialize test runner when connected
  useEffect(() => {
    if (accountId && !testRunnerRef.current) {
      testRunnerRef.current = new TestRunner(sdk);
      edgeCaseTestsRef.current = new EdgeCaseTests(sdk);
    }
  }, [accountId, sdk]);

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        if (PROJECT_ID === 'YOUR_WALLETCONNECT_PROJECT_ID') {
          setStatus('WARNING: Please set VITE_WALLETCONNECT_PROJECT_ID in .env file');
          return;
        }

        const savedAccount = await sdk.initAccount(
          PROJECT_ID,
          APP_METADATA,
          LedgerId.TESTNET
        );

        if (savedAccount) {
          setAccountId(savedAccount.accountId);
          setBalance(savedAccount.balance);
          setStatus(`Reconnected: ${savedAccount.accountId} - Balance: ${savedAccount.balance} HBAR`);
          loggerRef.current.info(`Reconnected to ${savedAccount.accountId}`);
        }
      } catch (error) {
        loggerRef.current.debug('No existing session found');
      }
    };

    checkExistingConnection();
  }, [sdk]);

  const connectWallet = async () => {
    if (PROJECT_ID === 'YOUR_WALLETCONNECT_PROJECT_ID') {
      setStatus('ERROR: Please set VITE_WALLETCONNECT_PROJECT_ID in .env file');
      return;
    }

    if (isConnecting) return;

    try {
      setIsConnecting(true);
      setStatus('Connecting wallet...');
      loggerRef.current.info('Starting wallet connection');

      const { accountId: connectedAccountId, balance: accountBalance, session } = await sdk.connectWallet(
        PROJECT_ID,
        APP_METADATA,
        LedgerId.TESTNET
      );

      setAccountId(connectedAccountId);
      setBalance(accountBalance);
      setStatus(`Connected: ${connectedAccountId} - Balance: ${accountBalance} HBAR`);
      loggerRef.current.info(`Connected to ${connectedAccountId}`);
    } catch (error) {
      const errorMessage = error?.message || String(error);
      loggerRef.current.error('Connection failed', error);
      setStatus(`Connection failed: ${errorMessage}`);
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
      setTestResults(null);
      testRunnerRef.current = null;
      setStatus('Disconnected');
      loggerRef.current.info('Disconnected from wallet');
    } catch (error) {
      setStatus(`Error disconnecting: ${error?.message || String(error)}`);
      loggerRef.current.error('Disconnect failed', error);
    }
  };

  const runAllTests = async () => {
    if (!accountId) {
      setStatus('Please connect wallet first');
      return;
    }

    try {
      setIsRunningTests(true);
      setStatus('Running comprehensive test suite...');
      setTestResults(null);
      loggerRef.current.info('Starting test suite');

      const results = await testRunnerRef.current.runAll(topicId);

      setTestResults(results);
      setStatus(`Tests complete! ${results.summary.passed}/${results.summary.total} passed`);
      loggerRef.current.info('Test suite completed', results.summary);
      setActiveTab('results');
    } catch (error) {
      setStatus(`Test error: ${error.message}`);
      loggerRef.current.error('Test suite failed', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const runConnectionTests = async () => {
    if (!accountId) {
      setStatus('Please connect wallet first');
      return;
    }

    try {
      setIsRunningTests(true);
      setStatus('Running connection tests...');
      loggerRef.current.info('Running connection tests');

      const results = await testRunnerRef.current.testConnection();

      const passed = results.filter(r => r.status === 'PASS').length;
      setStatus(`Connection tests: ${passed}/${results.length} passed`);
      loggerRef.current.info('Connection tests completed');
    } catch (error) {
      setStatus(`Test error: ${error.message}`);
      loggerRef.current.error('Connection tests failed', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const runNodeTests = async () => {
    if (!accountId) {
      setStatus('Please connect wallet first');
      return;
    }

    try {
      setIsRunningTests(true);
      setStatus('Running node account ID tests...');
      loggerRef.current.info('Running node account ID tests');

      const results = await testRunnerRef.current.testNodeAccountIDs(topicId);

      const passed = results.filter(r => r.status === 'PASS').length;
      setStatus(`Node tests: ${passed}/${results.length} passed`);
      loggerRef.current.info('Node tests completed');
    } catch (error) {
      setStatus(`Test error: ${error.message}`);
      loggerRef.current.error('Node tests failed', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const runEdgeCaseTests = async () => {
    if (!accountId) {
      setStatus('Please connect wallet first');
      return;
    }

    try {
      setIsRunningTests(true);
      setStatus('Running edge case tests...');
      loggerRef.current.info('Running edge case tests');

      const results = await edgeCaseTestsRef.current.runAll(topicId);

      const passed = results.filter(r => r.status === 'PASS').length;
      setStatus(`Edge case tests: ${passed}/${results.length} passed`);
      loggerRef.current.info('Edge case tests completed');
    } catch (error) {
      setStatus(`Test error: ${error.message}`);
      loggerRef.current.error('Edge case tests failed', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const validateCurrentConnection = () => {
    const validation = validateConnection(sdk);

    if (validation.valid) {
      setStatus(`Connection valid: ${validation.accountId} on ${validation.network} (${validation.signerCount} signer(s))`);
      loggerRef.current.info('Connection validated', validation);
    } else {
      setStatus(`Connection invalid: ${validation.error}`);
      loggerRef.current.warn('Connection validation failed', validation);
    }
  };

  const exportLogs = () => {
    const logsJson = loggerRef.current.export();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    loggerRef.current.info('Logs exported');
  };

  const exportResults = () => {
    if (!testResults) return;

    const resultsText = formatTestResults(testResults);
    const blob = new Blob([resultsText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    loggerRef.current.info('Results exported');
  };

  return (
    <div className="App">
      <h1>Hashinal WC - Comprehensive Test Suite</h1>

      {/* Tabs */}
      <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('connection')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'connection' ? '#4CAF50' : '#ddd',
            color: activeTab === 'connection' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Connection
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'tests' ? '#4CAF50' : '#ddd',
            color: activeTab === 'tests' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Tests
        </button>
        <button
          onClick={() => setActiveTab('results')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'results' ? '#4CAF50' : '#ddd',
            color: activeTab === 'results' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Results
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'manual' ? '#4CAF50' : '#ddd',
            color: activeTab === 'manual' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Manual Tests
        </button>
      </div>

      {/* Connection Tab */}
      {activeTab === 'connection' && (
        <>
          <div className="card">
            <h2>Connection</h2>
            {!accountId ? (
              <div>
                <button onClick={connectWallet} disabled={isConnecting}>
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
                {PROJECT_ID === 'YOUR_WALLETCONNECT_PROJECT_ID' && (
                  <p style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>
                    WARNING: You need to set your WalletConnect Project ID
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p>Connected: <strong>{accountId}</strong></p>
                {balance && <p>Balance: <strong>{balance} HBAR</strong></p>}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={validateCurrentConnection}>
                    Validate Connection
                  </button>
                  <button onClick={disconnectWallet}>
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tests Tab */}
      {activeTab === 'tests' && accountId && (
        <>
          <div className="card">
            <h2>Automated Tests</h2>
            <p>Run comprehensive test suites to validate all fixes and functionality</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                  Topic ID for tests:
                </label>
                <input
                  type="text"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  placeholder="Topic ID (e.g., 0.0.123456)"
                  style={{ width: '250px', padding: '8px' }}
                />
              </div>

              <button
                onClick={runAllTests}
                disabled={isRunningTests}
                style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold' }}
              >
                {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={runConnectionTests} disabled={isRunningTests}>
                  Test Connection
                </button>
                <button onClick={runNodeTests} disabled={isRunningTests}>
                  Test Node Auto-Config
                </button>
                <button onClick={runEdgeCaseTests} disabled={isRunningTests}>
                  Test Edge Cases
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Test Coverage</h2>
            <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
              <li>Connection & Reconnection</li>
              <li>Signer Null Check Fix (lines 221-223)</li>
              <li>Node Account ID Auto-Configuration (lines 228-244)</li>
              <li>Multi-Sig Support (HWC 2.0.4-canary)</li>
              <li>Error Handling & User-Friendly Messages</li>
              <li>Mirror Node API Calls</li>
              <li>Message Fetching</li>
              <li>Network Prefix Detection</li>
            </ul>
          </div>
        </>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="card">
          <h2>Test Results</h2>
          {testResults ? (
            <>
              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <h3>Summary</h3>
                <p><strong>Total Tests:</strong> {testResults.summary.total}</p>
                <p><strong>Passed:</strong> {testResults.summary.passed}</p>
                <p><strong>Failed:</strong> {testResults.summary.failed}</p>
                <p><strong>Duration:</strong> {testResults.summary.duration}ms ({(testResults.summary.duration / 1000).toFixed(2)}s)</p>
                <p><strong>Success Rate:</strong> {testResults.summary.successRate.toFixed(1)}%</p>
              </div>

              <button onClick={exportResults} style={{ marginBottom: '15px' }}>
                Export Results
              </button>

              <div style={{ maxHeight: '400px', overflow: 'auto', textAlign: 'left' }}>
                <h3>Detailed Results</h3>
                {testResults.results.map((result, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '10px',
                      margin: '10px 0',
                      border: `2px solid ${result.status === 'PASS' ? '#4CAF50' : '#ff4444'}`,
                      borderRadius: '4px',
                      backgroundColor: result.status === 'PASS' ? '#f0f8f0' : '#fff5f5'
                    }}
                  >
                    <p><strong>[{result.status}] {result.name}</strong></p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Duration: {result.duration}ms</p>
                    {result.error && (
                      <p style={{ fontSize: '12px', color: '#ff4444' }}>Error: {result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>No test results yet. Run tests first!</p>
          )}
        </div>
      )}

      {/* Manual Tests Tab (original functionality) */}
      {activeTab === 'manual' && accountId && (
        <>
          <ManualTestsSection
            sdk={sdk}
            topicId={topicId}
            setTopicId={setTopicId}
            setStatus={setStatus}
            logger={loggerRef.current}
          />
        </>
      )}

      {/* Status */}
      <div className="card status">
        <h3>Status:</h3>
        <p style={{ whiteSpace: 'pre-line' }}>{status || 'Waiting for action...'}</p>
      </div>

      {/* Actions */}
      <div className="card">
        <h2>Debug Tools</h2>
        <button onClick={exportLogs}>Export Logs</button>
        <button onClick={() => loggerRef.current.clear()}>Clear Logs</button>
      </div>
    </div>
  );
}

// Manual Tests Component
function ManualTestsSection({ sdk, topicId, setTopicId, setStatus, logger }) {
  const createTopic = async () => {
    try {
      setStatus('Creating new topic...');
      logger.info('Creating topic');

      const newTopicId = await sdk.createTopic('Test topic for comprehensive testing');

      setTopicId(newTopicId);
      setStatus(`Topic created: ${newTopicId}`);
      logger.info(`Topic created: ${newTopicId}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      logger.error('Topic creation failed', error);
    }
  };

  const submitMessage = async () => {
    try {
      setStatus('Submitting message...');
      logger.info('Submitting message to topic');

      const receipt = await sdk.submitMessageToTopic(topicId, `Manual test ${Date.now()}`);
      setStatus(`Message submitted! Sequence: ${receipt.topicSequenceNumber}`);
      logger.info(`Message submitted. Sequence: ${receipt.topicSequenceNumber}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      logger.error('Message submission failed', error);
    }
  };

  const manualTransaction = async () => {
    try {
      setStatus('Executing manual transaction...');
      logger.info('Creating manual transaction');

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(`Manual transaction ${Date.now()}`);

      const receipt = await sdk.executeTransaction(transaction);
      setStatus(`Transaction executed! Sequence: ${receipt.topicSequenceNumber}`);
      logger.info(`Transaction executed. Sequence: ${receipt.topicSequenceNumber}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      logger.error('Transaction execution failed', error);
    }
  };

  return (
    <>
      <div className="card">
        <h2>📝 Manual Topic Operations</h2>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Topic ID:</label>
          <input
            type="text"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            style={{ width: '250px', padding: '8px' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={createTopic}>Create New Topic</button>
          <button onClick={submitMessage}>Submit Message</button>
          <button onClick={manualTransaction}>Execute Manual Transaction</button>
        </div>
      </div>
    </>
  );
}

export default ImprovedApp;
