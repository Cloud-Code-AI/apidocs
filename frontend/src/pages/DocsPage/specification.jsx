import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"

export function Specification({ specification, setSpecification }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setSpecification(e.target.result)
      reader.readAsText(file)
    }
  }

  return (
    <div className="flex items-start space-x-4">
      <Textarea
        placeholder="Enter your OpenAPI specification here..."
        value={specification}
        onChange={(e) => setSpecification(e.target.value)}
        onClick={() => setIsExpanded(true)}
        onBlur={() => setIsExpanded(false)}
        className={`flex-grow transition-all duration-300 ease-in-out border-2 border-input focus:border-ring rounded-lg ${
          isExpanded ? 'h-64' : 'h-12 overflow-hidden'
        }`}
      />
      <div className="flex-shrink-0">
        <Input
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button 
            variant="outline" 
            className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 ease-in-out"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Specification
          </Button>
        </label>
      </div>
    </div>
  )
}