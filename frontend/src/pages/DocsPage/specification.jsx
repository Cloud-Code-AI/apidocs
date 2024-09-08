import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Github } from 'lucide-react'

export function Specification({ specification, setSpecification }) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setSpecification(url)
    // Here you would typically fetch the specification from the GitHub URL
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <div className="relative flex-grow">
        <Input
          type="url"
          placeholder="Enter GitHub URL of your codebase..."
          onChange={(e) => setUrl(e.target.value)}
          className="w-full h-10 pl-10 pr-4 border-2 border-input focus:border-ring rounded-lg"
        />
        <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>
      <Button 
        type="submit"
        className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary-light hover:text-primary-dark transition-colors duration-200 ease-in-out rounded-lg"
      >
        Generate
      </Button>
    </form>
  )
}