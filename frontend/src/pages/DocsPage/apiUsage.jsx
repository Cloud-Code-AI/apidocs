import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const generateJavaScriptCode = (method, path, parameters, requestBody) => {
  const url = `http://api.example.com/v1${path}`;
  const queryParams = parameters?.filter(p => p.in === 'query').map(p => `${p.name}=${p.schema.default || '{value}'}`).join('&');
  const fullUrl = queryParams ? `${url}?${queryParams}` : url;
  
  let code = `fetch('${fullUrl}'`;
  if (method !== 'get') {
    code += `, {
  method: '${method.toUpperCase()}',
  headers: {
    'Content-Type': 'application/json'${requestBody ? ',\n    \'X-API-Key\': \'YOUR_API_KEY\'' : ''}
  }${requestBody ? `,
  body: JSON.stringify({
    // Add request body here
  })` : ''}
}`;
  }
  code += `)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;

  return code;
};

const generatePythonCode = (method, path, parameters, requestBody) => {
  const url = `http://api.example.com/v1${path}`;
  const queryParams = parameters?.filter(p => p.in === 'query').map(p => `'${p.name}': ${p.schema.default || "'{value}'"}`).join(', ');
  
  let code = `import requests

url = '${url}'
${queryParams ? `params = {${queryParams}}` : ''}
${requestBody ? "headers = {'X-API-Key': 'YOUR_API_KEY'}" : ''}
${requestBody ? `
data = {
    # Add request body here
}` : ''}

response = requests.${method}(url${queryParams ? ', params=params' : ''}${requestBody ? ', headers=headers, json=data' : ''})
print(response.json())`;

  return code;
};

const generateCurlCode = (method, path, parameters, requestBody) => {
  const url = `http://api.example.com/v1${path}`;
  const queryParams = parameters?.filter(p => p.in === 'query').map(p => `${p.name}=${p.schema.default || '{value}'}`).join('&');
  const fullUrl = queryParams ? `${url}?${queryParams}` : url;
  
  let code = `curl -X ${method.toUpperCase()} '${fullUrl}'`;
  if (requestBody) {
    code += ` \\\n  -H 'Content-Type: application/json' \\\n  -H 'X-API-Key: YOUR_API_KEY' \\\n  -d '{
    // Add request body here
  }'`;
  }

  return code;
};

export function ApiUsage({ apiSpec }) {
  const { paths } = apiSpec;

  return (
    <div className="border border-border p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">API Usage</h2>
      {Object.entries(paths).map(([path, methods]) => 
        Object.entries(methods).map(([method, details]) => (
          <div key={`${method}-${path}`} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{details.summary}</h3>
            <p className="text-muted-foreground mb-2">{method.toUpperCase()} {path}</p>
            <Tabs defaultValue="javascript">
              <TabsList className="mb-2">
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>
              <TabsContent value="javascript">
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{generateJavaScriptCode(method, path, details.parameters, details.requestBody)}</code>
                </pre>
              </TabsContent>
              <TabsContent value="python">
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{generatePythonCode(method, path, details.parameters, details.requestBody)}</code>
                </pre>
              </TabsContent>
              <TabsContent value="curl">
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{generateCurlCode(method, path, details.parameters, details.requestBody)}</code>
                </pre>
              </TabsContent>
            </Tabs>
          </div>
        ))
      )}
    </div>
  );
}