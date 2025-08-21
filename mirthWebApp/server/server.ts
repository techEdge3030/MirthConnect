import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import FormData from 'form-data';
import { buildAlertXml } from './templates/alertXml';
import { randomUUID } from 'crypto';
// Removed XML conversion import - using JSON only for create channel
// Removed XML parsing import - using JSON only for create channel

// Read the certificate and key
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

app.use(cors({
  origin: true, // Allow all origins for now, can be restricted later
  credentials: true // Allow credentials (cookies) to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.text({ type: 'application/xml' }));
app.use(express.raw({ type: 'application/xml' }));
// CRITICAL: Add middleware to handle text/plain for user preferences API
app.use(express.text({ type: 'text/plain' }));

// Add error handling for JSON parsing errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    console.log('JSON parsing error, treating as empty body:', error.message);
    req.body = undefined;
    next();
  } else {
    next(error);
  }
});

dotenv.config();

const BASE_URL = process.env.MIRTH_API_URL;

console.log({ BASE_URL });

const generalHandler = (request, response) => {
  const apiUrl = request.url;
  const httpMethod = request.method.toUpperCase();
  let body = request.body;

  // Debug preferences API calls
  if (apiUrl.includes('/preferences/')) {
    console.log('DEBUG - Server received preferences API call:', {
      url: apiUrl,
      method: httpMethod,
      contentType: request.headers['content-type'],
      body: body,
      bodyType: typeof body,
      headers: request.headers
    });
  }

  // Only send a body for methods that support it
  const methodsWithBody = ['POST', 'PUT', 'PATCH'];
  if (!methodsWithBody.includes(httpMethod)) {
    body = undefined;
  }
  
  // Handle empty bodies properly - don't send undefined or null
  if (body === '' || body === null || body === undefined) {
    body = undefined;
  }

  // Clean up headers
  let headers: any = {};
  try {
    if (request.headers.headers) {
      headers = JSON.parse(request.headers.headers);
    } else {
      headers = {
        'Accept': request.headers.accept || 'application/json',
        // IMPORTANT: Preserve explicitly set Content-Type (like text/plain for preferences)
        'Content-Type': request.headers['content-type'] || 'application/json',
        'X-Requested-With': request.headers['x-requested-with'] || 'OpenAPI',
      };
    }
  } catch (error) {
    console.warn('Failed to parse headers as JSON, using fallback:', error.message);
    headers = {
      'Accept': request.headers.accept || 'application/json',
      'Content-Type': request.headers['content-type'] || 'application/json',
      'X-Requested-With': request.headers['x-requested-with'] || 'OpenAPI',
    };
  }

  // Forward cookies from browser to Mirth API
  if (request.headers.cookie) {
    headers['Cookie'] = request.headers.cookie;
  }

  // Remove custom 'Headers' and 'multipart' keys if present
  delete headers.Headers;
  delete headers.multipart;

  // Special logging for logout requests
  if (apiUrl.includes('/_logout')) {
    console.log('DEBUG - Logout request:', {
      url: apiUrl,
      method: httpMethod,
      headers: headers,
      body: body,
      bodyType: typeof body,
      cookie: request.headers.cookie,
      contentType: request.headers['content-type']
    });
  }

  axios({
    url: `${BASE_URL}${apiUrl}`,
    headers,
    method: httpMethod,
    data: body
  })
    .then(res => {
      const statusCode = res.status;
      let responseData = res.data;

      // Forward Set-Cookie headers properly
      if (res.headers['set-cookie']) {
        response.set('Set-Cookie', res.headers['set-cookie']);
        
        // Log logout response details
        if (apiUrl.includes('/_logout')) {
          console.log('DEBUG - Logout response Set-Cookie:', res.headers['set-cookie']);
          console.log('DEBUG - Logout response status:', res.status);
        }
      }

      if (typeof responseData === 'string') {
        response.status(statusCode).send(responseData);
        return;
      } else if (responseData === null || responseData === undefined) {
        responseData = {};
      }
      if (typeof responseData === 'object' && responseData !== null) {
        responseData.headers = res.headers;
      }
      response.status(statusCode).send(responseData);
    })
    .catch(err => {
      console.error('@Error: ', err);
      
      // Enhanced error logging for logout requests
      if (apiUrl.includes('/_logout')) {
        console.error('DEBUG - Logout error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            data: err.config?.data,
            headers: err.config?.headers
          }
        });
      }
      
      const statusCode = err.response?.status || 500;
      
      // IMPORTANT: Forward Set-Cookie headers even on error responses
      // This is crucial for logout which may return redirects or other non-200 status codes
      if (err.response?.headers?.['set-cookie']) {
        response.set('Set-Cookie', err.response.headers['set-cookie']);
        
        // Log logout error response details
        if (apiUrl.includes('/_logout')) {
          console.log('DEBUG - Logout error response Set-Cookie:', err.response.headers['set-cookie']);
          console.log('DEBUG - Logout error status:', err.response.status);
        }
      }
      
      response.status(statusCode).send(err.response?.data || {});
    });
};

const formHandler = (request, response) => {
  const apiUrl = request.url.replace('/form/', '/');
  const httpMethod = request.method;
  const body = request.body;

  // Handle headers properly - they might come as JSON string or as regular headers
  let headers: any = {};
  try {
    if (request.headers.headers) {
      headers = JSON.parse(request.headers.headers);
    } else {
      // Fallback: use regular headers from the request
      headers = {
        'Accept': request.headers.accept || 'application/json',
        'Content-Type': request.headers['content-type'] || 'application/json',
        'X-Requested-With': request.headers['x-requested-with'] || 'OpenAPI',
        'Cookie': request.headers.cookie || ''
      };
    }
  } catch (error) {
    console.warn('Failed to parse headers as JSON, using fallback:', error.message);
    headers = {
      'Accept': request.headers.accept || 'application/json',
      'Content-Type': request.headers['content-type'] || 'application/json',
      'X-Requested-With': request.headers['x-requested-with'] || 'OpenAPI',
      'Cookie': request.headers.cookie || ''
    };
  }

  const multipart = headers.multipart;

  //headers.Cookie = headers['cookie-data'];
  if (multipart) {
    const formData = new FormData();
    let index = 0;
    while (true) {
      const key = multipart.split(';')[index * 2];
      const options = multipart.split(';')[index * 2 + 1];
      if (!key) break;
      formData.append(
        key,
        JSON.stringify(body.length ? body[index] : body),
        options
      );
      index += 1;
    }
    axios({
      url: `${BASE_URL}${apiUrl}`,
      headers: {
        ...formData.getHeaders(),
        Accept: 'application/xml, application/json',
        Cookie: headers.Cookie,
        'X-Requested-With': 'OpenAPI'
      },
      method: httpMethod,
      data: formData
    })
      .then(res => {
        const statusCode = res.status;
        let responseData = res.data;

        // Handle different response types properly
        if (typeof responseData === 'string') {
          // For string responses, don't try to add headers - just return the string as-is
          response.status(statusCode).send(responseData);
          return;
        } else if (responseData === null || responseData === undefined) {
          responseData = {};
        }

        // Only add headers to object responses
        if (typeof responseData === 'object' && responseData !== null) {
          responseData.headers = res.headers;
        }

        response.status(statusCode).send(responseData);
      })
      .catch(err => {
        console.error('@Error: ', err);
        const statusCode = err.response?.status || 500;
        
        // IMPORTANT: Forward Set-Cookie headers even on error responses
        // This is crucial for logout which may return redirects or other non-200 status codes
        if (err.response?.headers?.['set-cookie']) {
          response.set('Set-Cookie', err.response.headers['set-cookie']);
        }
        
        response.status(statusCode).send(err.response?.data || {});
      });
  } else {
    response.status(400).send('Invalid multipart request');
  }
};

app.post('/api/alerts', async (req, res) => {
  try {
    console.log('--- ALERT CREATE REQUEST ---');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const alertJson = req.body;
    const alertId = alertJson.id || randomUUID();
    const alertXml = buildAlertXml({ ...alertJson, id: alertId });
    console.log('Generated alert XML:\n', alertXml);

    const mirthUrl = `${BASE_URL}/api/4.5.2/alerts/${alertId}`;
    // Forward the session cookie if present
    const cookie = req.headers.cookie;
    const headers = {
      'Content-Type': 'application/xml',
      'Accept': 'application/xml, application/json',
      'X-Requested-With': 'nextgen-connect-client',
      ...(cookie ? { 'Cookie': cookie } : {}),
    };
    console.log('Forwarding to:', mirthUrl);
    console.log('Outgoing headers:', headers);
    const response = await axios.put(mirthUrl, alertXml, {
      headers,
      validateStatus: () => true,
    });
    console.log('--- MIRTH RESPONSE ---');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    res.status(response.status).send(response.data);
  } catch (err) {
    console.error('--- ALERT CREATE ERROR ---');
    console.error(err);
    if (err.response) {
      console.error('Backend response data:', err.response.data);
      console.error('Backend response status:', err.response.status);
      console.error('Backend response headers:', err.response.headers);
    }
    console.error('Request body:', req.body);
    res.status(500).json({ error: err.message, stack: err.stack, backend: err.response?.data });
  }
});

// Channel create handler - JSON only, no XML conversion
app.post('/api/channels', async (req, res) => {
  try {
    console.log('--- CHANNEL CREATE REQUEST (JSON) ---');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const mirthUrl = `${BASE_URL}${req.path}`;
    const cookie = req.headers.cookie;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'OpenAPI',
      ...(cookie ? { 'Cookie': cookie } : {}),
    };
    console.log('Forwarding to:', mirthUrl);
    console.log('Outgoing headers:', headers);

    const response = await axios.post(mirthUrl, req.body, {
      headers,
      validateStatus: () => true,
    });

    if (response.headers['set-cookie']) {
      res.set('Set-Cookie', response.headers['set-cookie']);
    }

    console.log('--- MIRTH RESPONSE ---');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('--- CHANNEL CREATE ERROR ---');
    console.error(err);
    if (err.response) {
      console.error('Backend response data:', err.response.data);
      console.error('Backend response status:', err.response.status);
      console.error('Backend response headers:', err.response.headers);
    }
    console.error('Request body:', req.body);
    res.status(500).json({ error: err.message, stack: err.stack, backend: err.response?.data });
  }
});

// Channel update handler
app.put('/api/channels/:id', async (req, res) => {
  try {
    console.log('--- CHANNEL UPDATE REQUEST ---');
    console.log('Channel ID:', req.params.id);
    console.log('Query params:', req.query);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const channelJson = req.body;
    const channelXml = buildChannelXml(channelJson);
    console.log('Generated channel XML:\n', channelXml);

    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      queryParams.append(key, value.toString());
    }
    const queryString = queryParams.toString();
    const mirthUrl = `${BASE_URL}/api/channels/${req.params.id}${queryString ? '?' + queryString : ''}`;
    const cookie = req.headers.cookie;
    const headers = {
      'Content-Type': 'application/xml',
      'Accept': 'application/json, text/plain',
      'X-Requested-With': 'nextgen-connect-client',
      'User-Agent': 'Jersey/2.22.1 (Mirth Server Connection)',
      ...(cookie ? { 'Cookie': cookie } : {}),
    };
    console.log('Forwarding to:', mirthUrl);
    console.log('Outgoing headers:', headers);

    const xmlBuffer = Buffer.from(channelXml);
    headers['Content-Length'] = xmlBuffer.length;

    // First try with override=false
    let override = false;
    let response = await tryUpdate(mirthUrl.replace('override=true', 'override=false'), headers, xmlBuffer);
    if (response.status === 409) { // Conflict, retry with override=true
      console.log('Conflict detected, retrying with override=true');
      override = true;
      response = await tryUpdate(mirthUrl, headers, xmlBuffer);
    }

    // Helper function
    async function tryUpdate(url, headers, body) {
      return await axios.put(url, body, { headers, validateStatus: () => true });
    }

    let responseData = response.data;
    if (typeof responseData === 'string') {
      responseData = await parseStringPromise(responseData, { explicitArray: false });
    }

    if (response.headers['set-cookie']) {
      res.set('Set-Cookie', response.headers['set-cookie']);
    }

    console.log('--- MIRTH RESPONSE ---');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', responseData);

    res.status(response.status).json(responseData);
  } catch (err) {
    console.error('--- CHANNEL UPDATE ERROR ---');
    console.error(err);
    if (err.response) {
      console.error('Backend response data:', err.response.data);
      console.error('Backend response status:', err.response.status);
      console.error('Backend response headers:', err.response.headers);
    }
    console.error('Request body:', req.body);
    res.status(500).json({ error: err.message, stack: err.stack, backend: err.response?.data });
  }
});

app.all('/api/form/*', formHandler);
app.all('/api/*', generalHandler);

app.listen(8081, () => {
  console.log('Proxy server is running on port 8081');
});
