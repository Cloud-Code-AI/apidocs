import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Github, Loader2, Mail } from 'lucide-react'

export function Specification({ onSpecificationGenerated, isProd }) {
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://api.akiradocs.com/api/document_generation', {
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

  const sendEmail = async () => {
    if (!email) {
      setError('Please enter an email address.')
      return
    }

    setIsSendingEmail(true)
    setError(null)

    try {
      const response = await fetch('http://api.akiradocs.com/api/send_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          subject: 'Specification Changes',
          body: `Changes for repository: ${url}`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      alert('Email sent successfully!')
    } catch (error) {
      console.error('Failed to send email:', error)
      setError('Failed to send email. Please try again.')
    } finally {
      setIsSendingEmail(false)
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
      <div className="flex space-x-2">
        <Input
          type="email"
          placeholder="Enter your email..."
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-10 pl-4 pr-4 border-2 border-input focus:border-ring rounded-lg"
          disabled={isSendingEmail}
        />
        <Button 
          type="button"
          onClick={sendEmail}
          className="h-10 px-4 bg-secondary text-secondary-foreground hover:bg-secondary-light hover:text-secondary-dark transition-colors duration-200 ease-in-out rounded-lg"
          disabled={isSendingEmail}
        >
          {isSendingEmail ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </>
          )}
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  )
}