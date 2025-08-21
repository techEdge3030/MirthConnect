const axios = require('axios');

const data = {
  map: {
    entry: [
      {
        string: 'CODYCHRIST2',
        'com.mirth.connect.util.ConfigurationProperty': {
          value: 'HELLOWORLD',
          comment: 'GOODMORNING'
        }
      },
      {
        string: 'STRING1',
        'com.mirth.connect.util.ConfigurationProperty': {
          value: 'STRING2',
          comment: 'STRING3'
        }
      }
    ]
  }
};

axios
  .put('http://localhost:8080/api/server/configurationMap', data, {
    headers: {
      'Content-Type': 'application/json',
      Cookie: 'JSESSIONID=node01ba11l89sezma9q0sy198aou05.node0',
      'X-Requested-With': 'OpenAPI'
    }
  })
  .then(response => {
    console.log(response.data, response.status);
  })
  .catch(error => {
    console.log(error);
  });
