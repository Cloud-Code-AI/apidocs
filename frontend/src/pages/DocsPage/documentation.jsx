import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiUsage } from './apiUsage';
import { LightBulbIcon, ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';

const Badge = ({ children, color }) => (
  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${color} mr-2`}>
    {children}
  </span>
);

const MethodBadge = ({ method }) => {
  const colors = {
    get: 'bg-green-100 text-green-800',
    post: 'bg-blue-100 text-blue-800',
    put: 'bg-yellow-100 text-yellow-800',
    patch: 'bg-orange-100 text-orange-800',
    delete: 'bg-red-100 text-red-800',
  };

  return (
    <Badge color={colors[method.toLowerCase()] || 'bg-gray-100 text-gray-800'}>
      {method.toUpperCase()}
    </Badge>
  );
};

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

const EndpointSection = ({ id, method, servers, path, summary, description, parameters, requestBody, security, isProd, ...rest }) => (
  <section id={id} className="mb-8 flex flex-col lg:flex-row gap-6">
    <div className="lg:w-[65%] border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold mb-2">{summary}</h3>
        <p className="text-muted-foreground mb-2 flex items-center">
          <MethodBadge method={method} />
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
      
      {!isProd && rest.analysis_data && (
        <div className="p-6 border-t border-gray-200 bg-gradient-to-br from-teal-50 to-cyan-50">
          <h4 className="text-lg font-semibold mb-4 text-teal-700">Development Insights</h4>
          
          {rest.analysis_data.performance_insights && (
            <div className="mb-4 bg-white rounded-lg p-4 shadow-sm border border-teal-100">
              <h5 className="font-medium text-sm mb-2 flex items-center text-teal-600">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Performance Insights
              </h5>
              <p className="text-sm text-gray-700">{rest.analysis_data.performance_insights}</p>
            </div>
          )}
          
          {rest.analysis_data.optimization_suggestions && (
            <div className="mb-4 bg-white rounded-lg p-4 shadow-sm border border-teal-100">
              <h5 className="font-medium text-sm mb-2 flex items-center text-teal-600">
                <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                Optimization Suggestions
              </h5>
              <p className="text-sm text-gray-700">{rest.analysis_data.optimization_suggestions}</p>
            </div>
          )}
          
          {rest.analysis_data.general_recommendations && rest.analysis_data.general_recommendations.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-teal-100">
              <h5 className="font-medium text-sm mb-2 flex items-center text-teal-600">
                <LightBulbIcon className="h-5 w-5 mr-2" />
                General Recommendations
              </h5>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {rest.analysis_data.general_recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
    <div className="lg:w-[35%]">
      <ApiUsage apiSpec={{ servers: servers, paths: { [path]: { [method]: { parameters, requestBody } } } }} />
    </div>
  </section>
);

export function Documentation({ apiSpec, activeEndpoint, isProd, onSpecUpdate }) {
  const [activeTab, setActiveTab] = useState('formatted');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (activeEndpoint) {
      const element = document.getElementById(activeEndpoint);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [activeEndpoint]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = JSON.stringify(apiSpec, null, 2);
    }
  }, [apiSpec]);

  const handleEditSave = useCallback(() => {
    if (isEditing) {
      try {
        const updatedSpec = JSON.parse(textareaRef.current.value);
        onSpecUpdate(updatedSpec);
        setError(null);
        setIsEditing(false);
      } catch (err) {
        setError('Invalid JSON: ' + err.message);
      }
    } else {
      setIsEditing(true);
    }
  }, [isEditing, onSpecUpdate]);

  const EditSaveButton = () => (
    <button
      onClick={handleEditSave}
      className={`
        flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isEditing 
          ? 'bg-green-800 hover:bg-green-900 text-white focus:ring-green-800' 
          : 'bg-blue-800 hover:bg-blue-900 text-white focus:ring-blue-800'}
      `}
    >
      {isEditing ? (
        <>
          <CheckIcon className="h-5 w-5 mr-2" />
          Save Changes
        </>
      ) : (
        <>
          <PencilIcon className="h-5 w-5 mr-2" />
          Edit Raw
        </>
      )}
    </button>
  );

  const FormattedDocs = useCallback(() => (
    <>
      {Object.entries(apiSpec.paths).map(([path, methods]) => 
        Object.entries(methods).map(([method, details]) => (
          <EndpointSection 
            key={`${method}-${path}`}
            id={`${method}-${path}`}
            servers={apiSpec.servers}
            method={method}
            path={path}
            {...details}
            requestBody={details.requestBody && {
              content: {
                'application/json': {
                  schema: {
                    properties: apiSpec.components.schemas[details.requestBody.content['application/json'].schema.$ref.split('/').pop()].properties
                  }
                }
              }
            }}
            isProd={isProd}
          />
        ))
      )}
    </>
  ), [apiSpec, isProd]);

  const RawSpec = useCallback(() => (
    <div className="space-y-4">
      <textarea
        ref={textareaRef}
        className="w-full h-[70vh] p-4 font-mono text-sm bg-gray-100 rounded-lg resize-none"
        readOnly={!isEditing}
        defaultValue={JSON.stringify(apiSpec, null, 2)}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  ), [isEditing, error, apiSpec]);

  return (
    <div className="h-full overflow-y-auto pt-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{apiSpec.info.title}</h1>
                <Badge color="bg-blue-100 text-blue-800">v{apiSpec.info.version}</Badge>
              </div>
              {apiSpec.info.description && (
                <p className="text-gray-600 max-w-2xl">{apiSpec.info.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {activeTab === 'raw' && <EditSaveButton />}
              <TabsList>
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
                <TabsTrigger value="raw">Raw</TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>
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