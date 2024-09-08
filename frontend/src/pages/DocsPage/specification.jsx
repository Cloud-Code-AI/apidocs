import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Github, Loader2 } from 'lucide-react'
// import { Mail } from 'lucide-react'  // Commented out for now

export function Specification({ onSpecificationGenerated, isProd }) {
  const [searchParams] = useSearchParams()
  const [fileName, setFileName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  // const [email, setEmail] = useState('')  // Commented out for now
  // const [isSendingEmail, setIsSendingEmail] = useState(false)  // Commented out for now

  useEffect(() => {
    const fileNameParam = searchParams.get('file')
    if (fileNameParam) {
      setFileName(fileNameParam)
      handleSpecificationGeneration(fileNameParam)
    }
  }, [searchParams])

  const handleSpecificationGeneration = async (file) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://api.akiradocs.com/api/document_generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate specification')
      }

      onSpecificationGenerated(file)
    } catch (error) {
      console.error('Failed to generate specification:', error)
      setError('Failed to generate specification. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isProd) {
    return null; // Don't render anything in prod mode
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            value={fileName}
            placeholder="File name will be automatically populated..."
            className="w-full h-10 pl-10 pr-4 border-2 border-input focus:border-ring rounded-lg"
            disabled={true}
          />
          <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
        <Button 
          onClick={() => handleSpecificationGeneration(fileName)}
          className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary-light hover:text-primary-dark transition-colors duration-200 ease-in-out rounded-lg"
          disabled={isLoading || !fileName}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate'
          )}
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}