import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {copied ? (
        <CheckIcon className="h-5 w-5 text-green-500" />
      ) : (
        <ClipboardIcon className="h-5 w-5" />
      )}
    </button>
  );
};

export function ApiUsage({ apiSpec }) {
  const { paths } = apiSpec;
  const [activeTab, setActiveTab] = useState('javascript');

  return (
    <div className="space-y-6">
      {Object.entries(paths).map(([path, methods]) => 
        Object.entries(methods).map(([method, details]) => (
          <Card key={`${method}-${path}`} className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{details.summary}</CardTitle>
                <Badge variant="outline" className="text-sm font-medium">
                  {method.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">{path}</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="javascript" onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-2">
                  <TabsList className="grid grid-cols-3 w-[300px]">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>
                  <CopyButton 
                    text={
                      activeTab === 'javascript'
                        ? generateJavaScriptCode(method, path, details.parameters, details.requestBody)
                        : activeTab === 'python'
                        ? generatePythonCode(method, path, details.parameters, details.requestBody)
                        : generateCurlCode(method, path, details.parameters, details.requestBody)
                    } 
                  />
                </div>
                <div className="max-w-full mt-4">
                  <TabsContent value="javascript">
                    <SyntaxHighlighter 
                      language="javascript" 
                      style={prism} 
                      customStyle={{
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        padding: '1rem',
                        backgroundColor: 'rgb(246, 248, 250)', // Light gray background
                      }}
                      wrapLines={true}
                      wrapLongLines={true}
                      lineProps={{style: {wordBreak: 'break-all', whiteSpace: 'pre-wrap'}}}
                    >
                      {generateJavaScriptCode(method, path, details.parameters, details.requestBody)}
                    </SyntaxHighlighter>
                  </TabsContent>
                  <TabsContent value="python">
                    <SyntaxHighlighter 
                      language="python" 
                      style={prism} 
                      customStyle={{
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        padding: '1rem',
                        backgroundColor: 'rgb(246, 248, 250)', // Light gray background
                      }}
                      wrapLines={true}
                      wrapLongLines={true}
                      lineProps={{style: {wordBreak: 'break-all', whiteSpace: 'pre-wrap'}}}
                    >
                      {generatePythonCode(method, path, details.parameters, details.requestBody)}
                    </SyntaxHighlighter>
                  </TabsContent>
                  <TabsContent value="curl">
                    <SyntaxHighlighter 
                      language="bash" 
                      style={prism} 
                      customStyle={{
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        padding: '1rem',
                        backgroundColor: 'rgb(246, 248, 250)', // Light gray background
                      }}
                      wrapLines={true}
                      wrapLongLines={true}
                      lineProps={{style: {wordBreak: 'break-all', whiteSpace: 'pre-wrap'}}}
                    >
                      {generateCurlCode(method, path, details.parameters, details.requestBody)}
                    </SyntaxHighlighter>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}