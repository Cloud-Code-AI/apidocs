import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { Specification } from './specification'
import { Documentation } from './documentation'

// Remove these imports as they're not needed in the browser environment
// import fs from 'fs/promises'
// import path from 'path'

function DocsGeneration() {
  const [searchParams] = useSearchParams()
  const [parsedSpec, setParsedSpec] = useState(null)
  const [activeEndpoint, setActiveEndpoint] = useState(null)
  const [isProd, setIsProd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadSpecification = useCallback(async (fileName) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(fileName)
      const response = await fetch(`https://api.akiradocs.com/static/${fileName}`)
      if (!response.ok) {
        throw new Error('Failed to fetch specification')
      }
      const data = await response.json()
      console.log(data)
      setParsedSpec(data)
    } catch (error) {
      console.error('Failed to load specification:', error)
      setError('Failed to load specification. Please try again.')
      setParsedSpec(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const fileName = searchParams.get('file')
    if (fileName) {
      loadSpecification(fileName)
    }
  }, [searchParams, loadSpecification])

  const handleSpecificationGenerated = useCallback((repoName) => {
    loadSpecification(repoName)
  }, [loadSpecification])

  const handleEndpointClick = (endpointId) => {
    setActiveEndpoint(endpointId)
  }

  const handleSpecUpdate = useCallback((updatedSpec) => {
    setParsedSpec(updatedSpec)
  }, [])

  return (
    <div className="w-full h-screen flex flex-col">
      <Header isProd={isProd} setIsProd={setIsProd} />
      <main className="flex-1 flex overflow-hidden">
        <Sidebar apiSpec={parsedSpec} onEndpointClick={handleEndpointClick} />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <Specification 
              onSpecificationGenerated={handleSpecificationGenerated} 
              isProd={isProd}
            />
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-full">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600">Loading specification...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-xl text-red-600">{error}</p>
                </div>
              ) : parsedSpec ? (
                <Documentation 
                  apiSpec={parsedSpec} 
                  activeEndpoint={activeEndpoint} 
                  isProd={isProd}
                  onSpecUpdate={handleSpecUpdate}
                />
              ) : !isProd ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600">Enter a file name or use the URL parameter to generate API documentation.</p>
                  <p className="text-sm text-gray-400 mt-2">Once a valid file is specified, your API documentation will appear here.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DocsGeneration