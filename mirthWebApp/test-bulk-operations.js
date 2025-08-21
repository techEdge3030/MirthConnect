const axios = require('axios');

// Test script to verify Mirth Connect bulk operations
const BASE_URL = process.env.MIRTH_API_URL || 'http://172.23.33.179:8080';
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
  console.log('=== Testing Bulk Operations ===');
  console.log(`Using base URL: ${BASE_URL}`);
  console.log(`Using cookie: ${COOKIE}\n`);
  
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

  // Test individual channel operations first
  console.log('\n--- Testing Individual Channel Operations ---');
  const testChannelId = channelIds[0];
  
  try {
    console.log(`Testing individual pause for channel: ${testChannelId}`);
    const response = await apiClient.post(`/api/channels/${testChannelId}/_pause`);
    console.log('✅ Success with individual pause - Status:', response.status);
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('❌ Failed with individual pause - Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }

  // Test if bulk endpoints exist at all
  console.log('\n--- Testing if Bulk Endpoints Exist ---');
  
  try {
    console.log('Testing GET on bulk pause endpoint');
    const response = await apiClient.get('/api/channels/_pause');
    console.log('✅ GET on bulk pause - Status:', response.status);
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('❌ GET on bulk pause - Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
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

// Run the test
testBulkOperations().catch(console.error); 