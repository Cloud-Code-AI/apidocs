import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const MethodBadge = ({ method }) => {
  const colors = {
    get: 'bg-green-100 text-green-800',
    post: 'bg-blue-100 text-blue-800',
    put: 'bg-yellow-100 text-yellow-800',
    patch: 'bg-orange-100 text-orange-800',
    delete: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[method.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
      {method.toUpperCase()}
    </span>
  );
};

const EndpointItem = ({ method, path, onClick }) => (
  <motion.li
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
    transition={{ duration: 0.2 }}
    className="pl-4 py-1 hover:bg-gray-100 rounded-md cursor-pointer"
    onClick={() => onClick(`${method}-${path}`)}
  >
    <div className="flex items-center space-x-2">
      <MethodBadge method={method} />
      <span className="text-xs font-medium text-gray-700">{path}</span>
    </div>
  </motion.li>
);

export function Sidebar({ apiSpec, onEndpointClick }) {
  const [expandedPaths, setExpandedPaths] = useState({});
  const [isApiExpanded, setIsApiExpanded] = useState(true);

  const togglePath = (path) => {
    setExpandedPaths(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const toggleApiExpansion = () => {
    setIsApiExpanded(!isApiExpanded);
  };

  const renderEndpoints = () => {
    if (!apiSpec || !apiSpec.paths) {
      return null; // Return null if there's no data to display
    }

    return Object.entries(apiSpec.paths).map(([path, methods]) => (
      <li key={path} className="mb-1">
        <div
          className="flex items-center cursor-pointer hover:bg-gray-100 p-1.5 rounded-md transition-colors duration-150"
          onClick={() => togglePath(path)}
        >
          <motion.div
            initial={false}
            animate={{ rotate: expandedPaths[path] ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRightIcon className="h-3 w-3 mr-1 text-gray-500" />
          </motion.div>
          <span className="text-sm font-medium text-gray-800">{path}</span>
        </div>
        <AnimatePresence>
          {expandedPaths[path] && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-0.5 ml-2 space-y-0.5"
            >
              {Object.entries(methods).map(([method, details]) => (
                <EndpointItem
                  key={`${method}-${path}`}
                  method={method}
                  path={path}
                  onClick={onEndpointClick}
                />
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </li>
    ));
  };

  if (!apiSpec || !apiSpec.info) {
    return (
      <div className="w-56 bg-white border-r border-gray-200 px-2 py-4 overflow-y-auto shadow-sm">
        <p className="text-sm text-gray-500 p-2">No API specification loaded</p>
      </div>
    );
  }

  return (
    <div className="w-56 bg-white border-r border-gray-200 px-2 py-4 overflow-y-auto shadow-sm">
      <div
        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-md transition-colors duration-150 mb-2"
        onClick={toggleApiExpansion}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isApiExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRightIcon className="h-3 w-3 text-gray-500" />
        </motion.div>
        <h2 className="text-sm font-bold text-gray-800">{apiSpec.info.title}</h2>
      </div>
      <AnimatePresence>
        {isApiExpanded && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1"
          >
            {renderEndpoints()}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}