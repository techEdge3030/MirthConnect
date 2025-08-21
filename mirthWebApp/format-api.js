const fs = require('fs');

try {
    // Read the API file
    const content = fs.readFileSync('API', 'utf8');
    
    // Parse the JSON
    const parsed = JSON.parse(content);
    
    // Write back with proper formatting
    fs.writeFileSync('API', JSON.stringify(parsed, null, 2));
    
    console.log('API file has been formatted successfully!');
} catch (error) {
    console.error('Error formatting API file:', error.message);
} 