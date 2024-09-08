import { useState } from 'react'
import { Header } from "./header"
import { Specification } from "./specification"
import { Documentation } from "./documentation"
import { ApiUsage } from "./apiUsage"

function DocsGeneration() {
  const [specification, setSpecification] = useState('')

  return (
    <div className="w-full">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Specification
            specification={specification} 
            setSpecification={setSpecification} 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Documentation />
          <ApiUsage />
        </div>
      </main>
    </div>
  )
}

export default DocsGeneration