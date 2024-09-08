import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Badge = ({ children, color }) => (
  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${color} mr-2`}>
    {children}
  </span>
);

const Parameter = ({ param }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasDetails = param.description || (param.schema && (param.schema.enum || param.schema.default));
  
  const renderContent = () => (
    <div className="flex items-center">
      <strong className="mr-2">{param.name}</strong>
      <Badge color={param.in === 'query' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}>
        {param.in}
      </Badge>
      {param.required && (
        <Badge color="bg-red-100 text-red-800">required</Badge>
      )}
    </div>
  );

  if (!hasDetails) {
    return (
      <li className="mb-2 border border-gray-200 rounded-md p-3">
        {renderContent()}
      </li>
    );
  }

  return (
    <motion.li 
      className="mb-2 border border-gray-200 rounded-md overflow-hidden"
      initial={false}
      animate={{ backgroundColor: isExpanded ? "rgb(249, 250, 251)" : "white" }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {renderContent()}
        {isExpanded ? (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
        )}
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={{
              expanded: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.3 }}
            className="px-3 pb-3 text-sm text-gray-600"
          >
            {param.description && <p>{param.description}</p>}
            {param.schema && param.schema.enum && (
              <p className="mt-2">
                <span className="font-semibold">Possible values:</span> 
                <span className="ml-2">
                  {param.schema.enum.map((value, index) => (
                    <Badge key={index} color="bg-blue-100 text-blue-800">{value}</Badge>
                  ))}
                </span>
              </p>
            )}
            {param.schema && param.schema.default && (
              <p className="mt-2">
                <span className="font-semibold">Default:</span> 
                <span className="ml-2">
                  <Badge color="bg-yellow-100 text-yellow-800">{param.schema.default}</Badge>
                </span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
};

const EndpointSection = ({ method, path, summary, description, parameters, requestBody, security }) => (
  <section className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
    <div className="bg-gray-50 p-4 border-b border-gray-200">
      <h3 className="text-xl font-semibold mb-2">{summary}</h3>
      <p className="text-muted-foreground mb-2 flex items-center">
        <Badge color="bg-blue-100 text-blue-800">{method.toUpperCase()}</Badge>
        <code className="ml-2 text-sm bg-gray-200 px-2 py-1 rounded">{path}</code>
      </p>
      <p className="text-sm text-gray-600">{description}</p>
      {security && security.length > 0 && (
        <p className="mt-2"><Badge color="bg-yellow-100 text-yellow-800">Requires Authentication</Badge></p>
      )}
    </div>
    
    {parameters && parameters.length > 0 && (
      <div className="p-4">
        <h4 className="font-semibold mb-3">Parameters:</h4>
        <ul className="space-y-2">
          {parameters.map((param, index) => (
            <Parameter key={index} param={param} />
          ))}
        </ul>
      </div>
    )}
    
    {requestBody && (
      <div className="p-4 border-t border-gray-200">
        <h4 className="font-semibold mb-2">Request Body:</h4>
        <p className="text-sm">JSON object containing:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          {Object.entries(requestBody.content['application/json'].schema.properties).map(([key, value]) => (
            <li key={key} className="text-sm">
              <code className="bg-gray-100 px-1 py-0.5 rounded">{key}</code>
              {value.type && <span className="text-gray-600 ml-2">({value.type})</span>}
              {value.description && <span className="text-gray-600 ml-2">- {value.description}</span>}
            </li>
          ))}
        </ul>
      </div>
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
    <div className="h-full overflow-y-auto">
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