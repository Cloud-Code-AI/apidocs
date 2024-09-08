import { useState } from "react"

export function Header() {
    const [isProd, setIsProd] = useState(false)
    // Custom Switch component
    const Switch = ({ checked, onChange }) => (
        <div
        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer ${
            checked ? 'bg-green-700' : 'bg-gray-400'
        }`}
        onClick={() => onChange(!checked)}
        >
        <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
        </div>
    )
  
    return (
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <div className="flex items-baseline space-x-2">
            <h1 className="text-xl font-bold">AkiraDocs</h1>
            <span className="text-xs opacity-70">Powered by Kaizen</span>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm">Generate API Docs in minutes.</p>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isProd}
                onChange={setIsProd}
              />
              <span className="text-sm">{isProd ? 'Prod' : 'Dev'}</span>
            </div>
          </div>
        </div>
      </header>
    )
  }