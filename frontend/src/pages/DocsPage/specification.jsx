import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Github, Loader2 } from 'lucide-react'

export function Specification({ onSpecificationGenerated, isProd }) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/document_generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate specification')
      }

      const repoName = url.split('/').pop().replace('.git', '')
      onSpecificationGenerated(repoName)
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
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <Input
            type="url"
            placeholder="Enter GitHub URL of your codebase..."
            onChange={(e) => setUrl(e.target.value)}
            className="w-full h-10 pl-10 pr-4 border-2 border-input focus:border-ring rounded-lg"
            disabled={isLoading}
          />
          <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
        <Button 
          type="submit"
          className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary-light hover:text-primary-dark transition-colors duration-200 ease-in-out rounded-lg"
          disabled={isLoading}
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
    </form>
  )
}