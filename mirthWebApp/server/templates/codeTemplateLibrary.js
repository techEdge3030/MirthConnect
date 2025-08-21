const axios = require('axios');
const FormData = require('form-data');

const form = new FormData();
const data = {
  list: {
    codeTemplateLibrary: {
      '@version': '4.4.1',
      id: '5c9474dd-6678-4d54-81a9-ef1d072da492',
      name: 'CodyChristLibrary',
      revision: 1,
      description: 'CodyChristLibrary',
      includeNewChannels: false,
      enabledChannelIds: [], // [] breaks the whole MirthConnect
      disabledChannelIds: null,
      codeTemplates: null
    }
  }
};

form.append('libraries', JSON.stringify(data), 'libraries.json');

axios
  .post(
    'http://localhost:8080/api/codeTemplateLibraries/_bulkUpdate?override=true',
    form,
    {
      headers: {
        ...form.getHeaders(),
        Cookie: 'JSESSIONID=node010gwapaco13w0ej1nc4c1g45c11.node0',
        'X-Requested-With': 'OpenAPI'
      }
    }
  )
  .then(response => {
    console.log(response.data, response.status);
  })
  .catch(error => {
    console.log(error);
  });
