import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const EndpointItem = ({ method, path, onClick }) => (
  <li
    className="pl-8 py-1 cursor-pointer hover:bg-gray-100"
    onClick={() => onClick(`${method}-${path}`)}
  >
    <span className={`mr-2 font-mono text-xs ${getMethodColor(method)}`}>
      {method.toUpperCase()}
    </span>
    <span className="text-sm">{path}</span>
  </li>
);

const getMethodColor = (method) => {
  switch (method.toLowerCase()) {
    case 'get': return 'text-green-600';
    case 'post': return 'text-blue-600';
    case 'put': return 'text-yellow-600';
    case 'patch': return 'text-orange-600';
    case 'delete': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export function Sidebar({ apiSpec, onEndpointClick }) {
  const [expandedPaths, setExpandedPaths] = useState({});

  const togglePath = (path) => {
    setExpandedPaths(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderEndpoints = () => {
    return Object.entries(apiSpec.paths).map(([path, methods]) => (
      <li key={path} className="mb-2">
        <div
          className="flex items-center cursor-pointer hover:bg-gray-100 py-1"
          onClick={() => togglePath(path)}
        >
          {expandedPaths[path] ? (
            <ChevronDownIcon className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 mr-2" />
          )}
          <span className="font-medium">{path}</span>
        </div>
        {expandedPaths[path] && (
          <ul>
            {Object.entries(methods).map(([method, details]) => (
              <EndpointItem
                key={`${method}-${path}`}
                method={method}
                path={path}
                onClick={onEndpointClick}
              />
            ))}
          </ul>
        )}
      </li>
    ));
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">{apiSpec.info.title}</h2>
      <ul>{renderEndpoints()}</ul>
    </div>
  );
}