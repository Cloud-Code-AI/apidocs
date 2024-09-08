import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Badge = ({ children, color }) => (
  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${color} mr-2`}>
    {children}
  </span>
);

const Parameter = ({ param }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <li className="mb-2">
      <div className="flex items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? (
          <ChevronDownIcon className="h-4 w-4 mr-1" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 mr-1" />
        )}
        <strong>{param.name}</strong>
        <span className="ml-2">
          <Badge color={param.in === 'query' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}>
            {param.in}
          </Badge>
          {param.required && (
            <Badge color="bg-red-100 text-red-800">required</Badge>
          )}
        </span>
      </div>
      {isExpanded && (
        <div className="mt-1 ml-5 text-sm text-gray-600">
          <p>{param.description}</p>
          {param.schema && param.schema.enum && (
            <p className="mt-1">Possible values: {param.schema.enum.join(', ')}</p>
          )}
          {param.schema && param.schema.default && (
            <p className="mt-1">Default: {param.schema.default}</p>
          )}
        </div>
      )}
    </li>
  );
};

const EndpointSection = ({ method, path, summary, description, parameters, requestBody, security }) => (
  <section className="mb-6">
    <h3 className="text-xl font-semibold mb-2">{summary}</h3>
    <p className="text-muted-foreground mb-2">
      <Badge color="bg-blue-100 text-blue-800">{method.toUpperCase()}</Badge>
      {path}
    </p>
    <p className="mb-2">{description}</p>
    
    {security && security.length > 0 && (
      <p className="mb-2"><Badge color="bg-yellow-100 text-yellow-800">Requires Authentication</Badge></p>
    )}
    
    {parameters && parameters.length > 0 && (
      <>
        <h4 className="font-semibold mt-3 mb-2">Parameters:</h4>
        <ul className="list-none pl-2 mb-2">
          {parameters.map((param, index) => (
            <Parameter key={index} param={param} />
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