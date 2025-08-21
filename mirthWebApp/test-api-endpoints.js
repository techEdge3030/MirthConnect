const axios = require('axios');

// Test script to verify Mirth Connect API endpoints
const BASE_URL = process.env.MIRTH_API_URL || 'http://172.23.33.179:8080';

// You'll need to set these values based on your Mirth Connect session
const COOKIE = process.env.MIRTH_COOKIE || 'JSESSIONID=node01i9iods678zid93o8dgeknvl71332.node0';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'OpenAPI',
    'Cookie': COOKIE,
    'cookie-data': COOKIE
  }
});

async function testBulkOperations() {
  console.log('\n=== Testing Bulk Operations ===');
  
  // Get channel IDs from the channels endpoint
  let channelIds = [];
  try {
    const channelsResponse = await apiClient.get('/api/channels');
    if (channelsResponse.data.list && channelsResponse.data.list.channel) {
      const channels = Array.isArray(channelsResponse.data.list.channel) 
        ? channelsResponse.data.list.channel 
        : [channelsResponse.data.list.channel];
      channelIds = channels.map(ch => ch.id);
      console.log('Found channel IDs:', channelIds);
    }
  } catch (error) {
    console.log('Failed to get channels:', error.response?.status);
    return;
  }

  if (channelIds.length === 0) {
    console.log('No channels found to test with');
    return;
  }

  // Test different formats for bulk pause
  console.log('\n--- Testing Bulk Pause Operations ---');
  
  // Test 1: JSON array in body
  try {
    console.log('Test 1: JSON array in body');
    const response = await apiClient.post('/api/channels/_pause', channelIds);
    console.log('✅ Success with JSON array - Status:', response.status);
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('❌ Failed with JSON array - Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  // Test 2: Query parameters
  try {
    console.log('Test 2: Query parameters');
    const queryParams = channelIds.map(id => `channelId=${id}`).join('&');
    const response = await apiClient.post(`/api/channels/_pause?${queryParams}`);
    console.log('✅ Success with query parameters - Status:', response.status);
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('❌ Failed with query parameters - Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  // Test 3: Empty body (affects all channels)
  try {
    console.log('Test 3: Empty body (all channels)');
    const response = await apiClient.post('/api/channels/_pause');
    console.log('✅ Success with empty body - Status:', response.status);
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('❌ Failed with empty body - Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  // Test 4: Object with channelIds property
  try {
    console.log('Test 4: Object with channelIds property');
    const response = await apiClient.post('/api/channels/_pause', { channelIds });
    console.log('✅ Success with channelIds object - Status:', response.status);
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('❌ Failed with channelIds object - Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  // Test 5: Object with channels property
  try {
    console.log('Test 5: Object with channels property');
    const response = await apiClient.post('/api/channels/_pause', { channels: channelIds });
    console.log('✅ Success with channels object - Status:', response.status);
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('❌ Failed with channels object - Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }
}

async function testEndpoints() {
  console.log('Testing Mirth Connect API endpoints...\n');
  console.log(`Using base URL: ${BASE_URL}`);
  console.log(`Using cookie: ${COOKIE}\n`);
  
  // Test statistics endpoints
  console.log('Testing statistics endpoints:');
  
  try {
    const statsResponse = await apiClient.get('/api/channels/statistics');
    console.log('✅ /api/channels/statistics - Status:', statsResponse.status);
    console.log('   Data keys:', Object.keys(statsResponse.data));
    if (statsResponse.data.list) {
      console.log('   List keys:', Object.keys(statsResponse.data.list));
    }
  } catch (error) {
    console.log('❌ /api/channels/statistics - Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  try {
    const oldStatsResponse = await apiClient.get('/api/statistics');
    console.log('✅ /api/statistics - Status:', oldStatsResponse.status);
  } catch (error) {
    console.log('❌ /api/statistics - Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  try {
    const dashboardStatsResponse = await apiClient.get('/api/dashboard/statistics');
    console.log('✅ /api/dashboard/statistics - Status:', dashboardStatsResponse.status);
  } catch (error) {
    console.log('❌ /api/dashboard/statistics - Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  try {
    const statusResponse = await apiClient.get('/api/channels/status');
    console.log('✅ /api/channels/status - Status:', statusResponse.status);
  } catch (error) {
    console.log('❌ /api/channels/status - Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  // Test channel statuses endpoint
  console.log('\nTesting channel statuses endpoint:');
  try {
    const statusesResponse = await apiClient.get('/api/channels/statuses');
    console.log('✅ /api/channels/statuses - Status:', statusesResponse.status);
    console.log('   Data keys:', Object.keys(statusesResponse.data));
    if (statusesResponse.data.list) {
      console.log('   List keys:', Object.keys(statusesResponse.data.list));
      if (statusesResponse.data.list.channelStatus) {
        const statusList = Array.isArray(statusesResponse.data.list.channelStatus) 
          ? statusesResponse.data.list.channelStatus 
          : [statusesResponse.data.list.channelStatus];
        console.log('   Channel statuses found:', statusList.length);
        statusList.forEach((status, index) => {
          console.log(`   Status ${index + 1}:`, {
            channelId: status.channelId,
            state: status.state,
            deployed: status.deployed,
            queued: status.queued
          });
        });
      }
    }
  } catch (error) {
    console.log('❌ /api/channels/statuses - Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  // Test channel endpoints
  console.log('\nTesting channel endpoints:');
  
  try {
    const channelsResponse = await apiClient.get('/api/channels');
    console.log('✅ /api/channels - Status:', channelsResponse.status);
    console.log('   Data keys:', Object.keys(channelsResponse.data));
    
    if (channelsResponse.data.list && channelsResponse.data.list.channel) {
      const channels = Array.isArray(channelsResponse.data.list.channel) 
        ? channelsResponse.data.list.channel 
        : [channelsResponse.data.list.channel];
      console.log('   Channels found:', channels.length);
      
      // Show first channel details
      if (channels.length > 0) {
        const firstChannel = channels[0];
        console.log('   First channel:', {
          id: firstChannel.id,
          name: firstChannel.name,
          state: firstChannel.state,
          revision: firstChannel.revision
        });
      }
    }
  } catch (error) {
    console.log('❌ /api/channels - Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  // Test bulk operations
  await testBulkOperations();

  console.log('\n--- /api/channels FULL RESPONSE ---');
  try {
    const fullResponse = await apiClient.get('/api/channels');
    console.log(JSON.stringify(fullResponse.data, null, 2));
  } catch (error) {
    console.log('Error getting full response:', error.message);
  }
  console.log('-----------------------------------\n');

  console.log('--- /api/channels/statuses FULL RESPONSE ---');
  try {
    const statusesFullResponse = await apiClient.get('/api/channels/statuses');
    console.log(JSON.stringify(statusesFullResponse.data, null, 2));
  } catch (error) {
    console.log('Error getting statuses full response:', error.message);
  }
  console.log('------------------------------------------\n');
}

// Run the test
testEndpoints().catch(console.error); 