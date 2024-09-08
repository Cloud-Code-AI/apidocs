import { useState, useEffect } from 'react'
import { Header } from './header'
import { Specification } from './specification'
import { Documentation } from './documentation'
import { Sidebar } from './sidebar'

// Sample OpenAPI specification
const sampleSpec = {
  "openapi": "3.0.3",
  "info": {
    "title": "Enhanced Planets API",
    "version": "1.1.0",
    "description": "An API for retrieving and managing information about planets"
  },
  "servers": [
    {
      "url": "http://api.example.com/v1"
    }
  ],
  "paths": {
    "/planets": {
      "get": {
        "summary": "List planets",
        "description": "Retrieve a list of planets, with optional filtering",
        "parameters": [
          {
            "name": "type",
            "in": "query",
            "description": "Filter planets by type",
            "required": false,
            "schema": {
              "type": "string",
              "enum": ["terrestrial", "gas giant", "ice giant", "dwarf"]
            }
          },
          {
            "name": "limit",
            "in": "query",
            "description": "Maximum number of planets to return",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Planet"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Create a new planet",
        "description": "Add a new planet to the database",
        "security": [
          {
            "ApiKeyAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/NewPlanet"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Planet created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Planet"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        }
      }
    },
    "/planets/{id}": {
      "get": {
        "summary": "Get a specific planet",
        "description": "Retrieve details of a specific planet by its ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "include-moons",
            "in": "query",
            "description": "Include detailed moon information",
            "required": false,
            "schema": {
              "type": "boolean",
              "default": false
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Planet"
                }
              }
            }
          },
          "404": {
            "description": "Planet not found"
          }
        }
      },
      "patch": {
        "summary": "Update a planet",
        "description": "Modify details of an existing planet",
        "security": [
          {
            "ApiKeyAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PlanetUpdate"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Planet updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Planet"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          },
          "404": {
            "description": "Planet not found"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Planet": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer"
          },
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": ["terrestrial", "gas giant", "ice giant", "dwarf"]
          },
          "moons": {
            "type": "integer"
          },
          "hasRings": {
            "type": "boolean"
          }
        },
        "required": ["id", "name", "type"]
      },
      "NewPlanet": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": ["terrestrial", "gas giant", "ice giant", "dwarf"]
          },
          "moons": {
            "type": "integer"
          },
          "hasRings": {
            "type": "boolean"
          }
        },
        "required": ["name", "type"]
      },
      "PlanetUpdate": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "moons": {
            "type": "integer"
          },
          "hasRings": {
            "type": "boolean"
          }
        }
      }
    },
    "securitySchemes": {
      "ApiKeyAuth": {
        "type": "apiKey",
        "in": "header",
        "name": "X-API-Key"
      }
    }
  }
}

function DocsGeneration() {
  const [spec, setSpec] = useState(JSON.stringify(sampleSpec, null, 2))
  const [parsedSpec, setParsedSpec] = useState(sampleSpec)
  const [activeEndpoint, setActiveEndpoint] = useState(null)

  const handleSpecificationChange = (newSpec) => {
    setSpec(newSpec)
    try {
      const parsed = JSON.parse(newSpec)
      setParsedSpec(parsed)
    } catch (error) {
      console.error('Failed to parse specification:', error)
      setParsedSpec(null)
    }
  }

  const handleEndpointClick = (endpointId) => {
    setActiveEndpoint(endpointId)
    // You might want to scroll to the selected endpoint in the Documentation component
  }

  useEffect(() => {
    // Initialize with sample data
    handleSpecificationChange(spec)
  }, [])

  return (
    <div className="w-full h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        <Sidebar apiSpec={parsedSpec} onEndpointClick={handleEndpointClick} />
        <div className="flex-1 overflow-y-auto px-12 py-8">
          <div className="mb-6">
            <Specification 
              specification={spec} 
              setSpecification={handleSpecificationChange} 
            />
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-full">
              {parsedSpec ? (
                <Documentation apiSpec={parsedSpec} activeEndpoint={activeEndpoint} />
              ) : (
                <p>Enter a valid OpenAPI specification to generate documentation.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DocsGeneration