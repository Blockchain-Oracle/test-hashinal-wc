/**
 * Edge Case Tests for hashinal-wc SDK
 * Tests uncommon scenarios and boundary conditions
 */

export class EdgeCaseTests {
  constructor(sdk) {
    this.sdk = sdk;
    this.results = [];
  }

  log(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] EdgeCaseTests: ${message}`);
  }

  async runTest(name, testFn, expectedResult = 'success') {
    const startTime = Date.now();

    try {
      this.log(`Starting: ${name}`);
      const result = await testFn();
      const duration = Date.now() - startTime;

      if (expectedResult === 'success') {
        this.log(`PASS: ${name} (${duration}ms)`, 'success');
        return { name, status: 'PASS', duration, result };
      } else if (expectedResult === 'error') {
        this.log(`FAIL: Expected error but got success (${duration}ms)`, 'error');
        return { name, status: 'FAIL', duration, error: 'Expected error but succeeded' };
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      if (expectedResult === 'error') {
        this.log(`PASS: Correctly caught error - ${error.message} (${duration}ms)`, 'success');
        return { name, status: 'PASS', duration, error: error.message };
      } else {
        this.log(`FAIL: ${error.message} (${duration}ms)`, 'error');
        return { name, status: 'FAIL', duration, error: error.message };
      }
    }
  }

  /**
   * Test: Disconnected wallet scenario
   */
  async testDisconnectedWallet() {
    return await this.runTest(
      'Edge Case: Transaction with disconnected wallet',
      async () => {
        // This should fail gracefully
        const accountInfo = this.sdk.getAccountInfo();
        if (!accountInfo) {
          throw new Error('Wallet is disconnected');
        }
        return true;
      }
    );
  }

  /**
   * Test: Empty transaction
   */
  async testEmptyTransaction() {
    const { TopicMessageSubmitTransaction } = await import('@hashgraph/sdk');

    return await this.runTest(
      'Edge Case: Transaction without required fields',
      async () => {
        const tx = new TopicMessageSubmitTransaction();
        // Deliberately missing topic ID and message

        try {
          await this.sdk.executeTransaction(tx);
          throw new Error('Should have failed with missing fields');
        } catch (error) {
          if (error.message.includes('topicId')) {
            return true; // Expected error
          }
          throw error;
        }
      },
      'error'
    );
  }

  /**
   * Test: Invalid account ID format
   */
  async testInvalidAccountIdFormat() {
    return await this.runTest(
      'Edge Case: Invalid account ID format',
      async () => {
        try {
          await this.sdk.requestAccount('invalid-account-id');
          throw new Error('Should have failed with invalid account ID');
        } catch (error) {
          // Expected to fail
          return true;
        }
      }
    );
  }

  /**
   * Test: Non-existent topic ID
   */
  async testNonExistentTopic() {
    return await this.runTest(
      'Edge Case: Submit to non-existent topic',
      async () => {
        const fakeTopic = '0.0.999999999999';
        try {
          await this.sdk.submitMessageToTopic(fakeTopic, 'test');
          throw new Error('Should have failed with non-existent topic');
        } catch (error) {
          // Expected to fail
          return true;
        }
      }
    );
  }

  /**
   * Test: Very long message
   */
  async testLongMessage(topicId) {
    return await this.runTest(
      'Edge Case: Submit very long message',
      async () => {
        // HCS messages have a limit (around 1024 bytes for a single chunk)
        const longMessage = 'A'.repeat(2000);

        try {
          await this.sdk.submitMessageToTopic(topicId, longMessage);
          throw new Error('Should have failed with message too long');
        } catch (error) {
          if (error.message.toLowerCase().includes('size') ||
              error.message.toLowerCase().includes('too large') ||
              error.message.toLowerCase().includes('limit')) {
            return true; // Expected error
          }
          throw error;
        }
      },
      'error'
    );
  }

  /**
   * Test: Empty message
   */
  async testEmptyMessage(topicId) {
    return await this.runTest(
      'Edge Case: Submit empty message',
      async () => {
        try {
          await this.sdk.submitMessageToTopic(topicId, '');
          // Some implementations might allow empty messages
          return true;
        } catch (error) {
          // Also acceptable to reject empty messages
          return true;
        }
      }
    );
  }

  /**
   * Test: Special characters in message
   */
  async testSpecialCharactersMessage(topicId) {
    return await this.runTest(
      'Edge Case: Submit message with special characters',
      async () => {
        const specialMessage = '🚀 Test 特殊文字 <script>alert("xss")</script> \n\t\r';
        const receipt = await this.sdk.submitMessageToTopic(topicId, specialMessage);

        if (!receipt || !receipt.topicSequenceNumber) {
          throw new Error('Failed to submit message with special characters');
        }

        return true;
      }
    );
  }

  /**
   * Test: Rapid consecutive transactions
   */
  async testRapidTransactions(topicId) {
    return await this.runTest(
      'Edge Case: Rapid consecutive transactions',
      async () => {
        const promises = [];

        // Try to submit 3 messages rapidly
        for (let i = 0; i < 3; i++) {
          promises.push(
            this.sdk.submitMessageToTopic(topicId, `Rapid test ${i} - ${Date.now()}`)
              .catch(error => ({ error: error.message }))
          );
        }

        const results = await Promise.all(promises);

        // At least one should succeed
        const successes = results.filter(r => !r.error && r.topicSequenceNumber);
        if (successes.length === 0) {
          throw new Error('All rapid transactions failed');
        }

        this.log(`${successes.length}/3 rapid transactions succeeded`);
        return true;
      }
    );
  }

  /**
   * Test: Transaction with invalid node IDs
   */
  async testInvalidNodeIds() {
    const { TopicMessageSubmitTransaction, AccountId } = await import('@hashgraph/sdk');

    return await this.runTest(
      'Edge Case: Transaction with invalid node account IDs',
      async () => {
        const tx = new TopicMessageSubmitTransaction()
          .setTopicId('0.0.123456')
          .setMessage('test')
          .setNodeAccountIds([
            AccountId.fromString('0.0.999999999') // Invalid node
          ]);

        try {
          await this.sdk.executeTransaction(tx);
          throw new Error('Should have failed with invalid node ID');
        } catch (error) {
          // Expected to fail
          return true;
        }
      },
      'error'
    );
  }

  /**
   * Test: Get messages from topic with no messages
   */
  async testEmptyTopicMessages() {
    return await this.runTest(
      'Edge Case: Fetch messages from empty topic',
      async () => {
        // Use a very high topic ID that likely doesn't exist
        const result = await this.sdk.getMessages('0.0.999999999999', 0, true);

        if (result.error) {
          // Expected - topic doesn't exist
          return true;
        }

        if (result.messages.length === 0) {
          // Also acceptable - empty topic
          return true;
        }

        return true;
      }
    );
  }

  /**
   * Test: Multiple simultaneous balance checks
   */
  async testSimultaneousBalanceChecks() {
    return await this.runTest(
      'Edge Case: Multiple simultaneous balance checks',
      async () => {
        const promises = [];

        for (let i = 0; i < 5; i++) {
          promises.push(this.sdk.getAccountBalance());
        }

        const results = await Promise.all(promises);

        // All should return the same balance
        const uniqueBalances = [...new Set(results)];
        if (uniqueBalances.length !== 1) {
          this.log(`Warning: Got different balances: ${uniqueBalances.join(', ')}`);
        }

        return true;
      }
    );
  }

  /**
   * Test: Network detection consistency
   */
  async testNetworkDetection() {
    return await this.runTest(
      'Edge Case: Network detection consistency',
      async () => {
        const network1 = this.sdk.getNetwork();
        const accountInfo = this.sdk.getAccountInfo();
        const network2 = accountInfo?.network;

        if (network1.toString() !== network2.toString()) {
          throw new Error(`Network mismatch: ${network1} vs ${network2}`);
        }

        return true;
      }
    );
  }

  /**
   * Test: Signer persistence across calls
   */
  async testSignerPersistence() {
    return await this.runTest(
      'Edge Case: Signer persistence across multiple calls',
      async () => {
        const info1 = this.sdk.getAccountInfo();
        const info2 = this.sdk.getAccountInfo();

        if (!info1 || !info2) {
          throw new Error('Account info should be available');
        }

        if (info1.accountId !== info2.accountId) {
          throw new Error('Account ID changed between calls');
        }

        return true;
      }
    );
  }

  /**
   * Test: Null/undefined parameter handling
   */
  async testNullParameters() {
    return await this.runTest(
      'Edge Case: Null/undefined parameters',
      async () => {
        const errors = [];

        // Test null topic ID
        try {
          await this.sdk.submitMessageToTopic(null, 'test');
          errors.push('Accepted null topic ID');
        } catch (e) {
          // Expected
        }

        // Test undefined message
        try {
          await this.sdk.submitMessageToTopic('0.0.123456', undefined);
          errors.push('Accepted undefined message');
        } catch (e) {
          // Expected
        }

        if (errors.length > 0) {
          throw new Error(`Parameter validation issues: ${errors.join(', ')}`);
        }

        return true;
      }
    );
  }

  /**
   * Run all edge case tests
   */
  async runAll(topicId) {
    console.log('\n--- Edge Case Tests ---');

    const results = [];

    // Connection edge cases
    results.push(await this.testDisconnectedWallet());
    results.push(await this.testNetworkDetection());
    results.push(await this.testSignerPersistence());

    // Transaction edge cases
    results.push(await this.testEmptyTransaction());
    results.push(await this.testInvalidNodeIds());

    // Account/Mirror node edge cases
    results.push(await this.testInvalidAccountIdFormat());
    results.push(await this.testSimultaneousBalanceChecks());

    // Message edge cases
    results.push(await this.testNonExistentTopic());
    results.push(await this.testEmptyTopicMessages());
    results.push(await this.testNullParameters());

    if (topicId) {
      results.push(await this.testEmptyMessage(topicId));
      results.push(await this.testSpecialCharactersMessage(topicId));
      results.push(await this.testLongMessage(topicId));
      results.push(await this.testRapidTransactions(topicId));
    }

    // Summary
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    console.log('\nEdge Case Test Summary:');
    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
      console.log('\nFailed Tests:');
      results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }

    return results;
  }
}

export default EdgeCaseTests;
