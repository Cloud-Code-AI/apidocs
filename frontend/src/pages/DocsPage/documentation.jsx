import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const EndpointSection = ({ method, path, summary, description, parameters, requestBody, security }) => (
  <section className="mb-6">
    <h3 className="text-xl font-semibold mb-2">{summary}</h3>
    <p className="text-muted-foreground mb-2">{method.toUpperCase()} {path}</p>
    <p className="mb-2">{description}</p>
    
    {security && security.length > 0 && (
      <p className="mb-2"><strong>Note:</strong> Requires authentication</p>
    )}
    
    {parameters && parameters.length > 0 && (
      <>
        <h4 className="font-semibold mt-3 mb-2">Parameters:</h4>
        <ul className="list-disc pl-5 mb-2">
          {parameters.map((param, index) => (
            <li key={index}>
              <strong>{param.name}</strong> ({param.in}, {param.required ? 'required' : 'optional'}): 
              {param.description}
              {param.schema && param.schema.enum && (
                <span> ({param.schema.enum.join(', ')})</span>
              )}
              {param.schema && param.schema.default && (
                <span> (default: {param.schema.default})</span>
              )}
            </li>
          ))}
        </ul>
      </>
    )}
    
    {requestBody && (
      <>
        <h4 className="font-semibold mt-3 mb-2">Request Body:</h4>
        <p>JSON object containing: {Object.keys(requestBody.content['application/json'].schema.properties).join(', ')}</p>
      </>
    )}
  </section>
);

export function Documentation({ apiSpec }) {
  const { info, paths, components } = apiSpec;
  const [activeTab, setActiveTab] = useState('formatted');

  const FormattedDocs = () => (
    <>
      <h2 className="text-2xl font-semibold mb-4">{info.title} Documentation</h2>
      <p className="mb-4">{info.description}</p>
      
      {Object.entries(paths).map(([path, methods]) => 
        Object.entries(methods).map(([method, details]) => (
          <EndpointSection 
            key={`${method}-${path}`}
            method={method}
            path={path}
            {...details}
            requestBody={details.requestBody && {
              content: {
                'application/json': {
                  schema: {
                    properties: components.schemas[details.requestBody.content['application/json'].schema.$ref.split('/').pop()].properties
                  }
                }
              }
            }}
          />
        ))
      )}

      {components.securitySchemes && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Authentication</h3>
          {Object.entries(components.securitySchemes).map(([key, scheme]) => (
            <div key={key}>
              <p className="mb-2">Some endpoints require authentication using {scheme.type}.</p>
              <p className="mb-2">Include the {scheme.type} in the <strong>{scheme.name}</strong> {scheme.in} of your requests.</p>
            </div>
          ))}
        </section>
      )}
    </>
  );

  const RawSpec = () => (
    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
      {JSON.stringify(apiSpec, null, 2)}
    </pre>
  );

  return (
    <div className="h-full border border-border p-6 rounded-lg shadow-sm overflow-y-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="formatted">Formatted Documentation</TabsTrigger>
          <TabsTrigger value="raw">Raw Specification</TabsTrigger>
        </TabsList>
        <TabsContent value="formatted">
          <FormattedDocs />
        </TabsContent>
        <TabsContent value="raw">
          <RawSpec />
        </TabsContent>
      </Tabs>
    </div>
  );
}