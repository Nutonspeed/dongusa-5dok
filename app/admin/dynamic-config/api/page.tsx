"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Copy, AlertTriangle, Info, Key, Database, Shield } from "lucide-react"
import { dynamicConfigSystem } from "@/lib/dynamic-config-system"
import { toast } from "@/hooks/use-toast"

export default function DynamicConfigAPIPage() {
  const [apiKey, setApiKey] = useState("")
  const [testEndpoint, setTestEndpoint] = useState("/api/config/business")
  const [testResponse, setTestResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const generateApiKey = () => {
    const key = `dk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    setApiKey(key)
    toast({
      title: "API Key Generated",
      description: "New API key has been generated. Please save it securely.",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    })
  }

  const testApi = async () => {
    setLoading(true)
    try {
      // Simulate API call
      const mockResponse = await dynamicConfigSystem.getAllValues("business")
      setTestResponse(JSON.stringify(mockResponse, null, 2))
      toast({
        title: "API Test Successful",
        description: "Configuration data retrieved successfully",
      })
    } catch (error) {
      setTestResponse(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      toast({
        title: "API Test Failed",
        description: "Failed to retrieve configuration data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const apiExamples = {
    javascript: `// JavaScript/Node.js Example
const response = await fetch('/api/config/business', {
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  }
});

const config = await response.json();
console.log('Business Config:', config);`,

    curl: `# cURL Example
curl -X GET "https://yoursite.com/api/config/business" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`,

    python: `# Python Example
import requests

headers = {
    'Authorization': f'Bearer ${apiKey}',
    'Content-Type': 'application/json'
}

response = requests.get('https://yoursite.com/api/config/business', headers=headers)
config = response.json()
print('Business Config:', config)`,

    php: `<?php
// PHP Example
$headers = [
    'Authorization: Bearer ${apiKey}',
    'Content-Type: application/json'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://yoursite.com/api/config/business');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$config = json_decode($response, true);
curl_close($ch);

print_r($config);
?>`,
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuration API</h1>
        <p className="text-gray-600 mt-1">Access your dynamic configuration via REST API</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Management */}
        <div className="lg:col-span-1 space-y-6">
          {/* API Key Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiKey">Current API Key</Label>
                <div className="flex space-x-2">
                  <Input id="apiKey" type="password" value={apiKey} readOnly placeholder="No API key generated" />
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(apiKey)} disabled={!apiKey}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={generateApiKey} className="w-full">
                Generate New Key
              </Button>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Keep your API key secure. It provides access to your configuration data.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* API Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Test API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="endpoint">Test Endpoint</Label>
                <Input
                  id="endpoint"
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value)}
                  placeholder="/api/config/category"
                />
              </div>
              <Button onClick={testApi} disabled={loading || !apiKey} className="w-full">
                {loading ? "Testing..." : "Test API"}
              </Button>
              {testResponse && (
                <div>
                  <Label>Response</Label>
                  <Textarea value={testResponse} readOnly rows={8} className="font-mono text-sm" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documentation */}
        <div className="lg:col-span-2 space-y-6">
          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>Available Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">GET</Badge>
                      <code className="text-sm">/api/config</code>
                    </div>
                    <Badge variant="secondary">All Categories</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Get all configuration values</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">GET</Badge>
                      <code className="text-sm">/api/config/{"{category}"}</code>
                    </div>
                    <Badge variant="secondary">Category Specific</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Get configuration values for a specific category</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">PUT</Badge>
                      <code className="text-sm">/api/config/{"{key}"}</code>
                    </div>
                    <Badge variant="destructive">Admin Only</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Update a specific configuration value</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">POST</Badge>
                      <code className="text-sm">/api/config/validate</code>
                    </div>
                    <Badge variant="secondary">Validation</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Validate configuration values before saving</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Code Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="javascript" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                </TabsList>

                {Object.entries(apiExamples).map(([language, code]) => (
                  <TabsContent key={language} value={language}>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{code}</code>
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 bg-transparent"
                        onClick={() => copyToClipboard(code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Response Format */}
          <Card>
            <CardHeader>
              <CardTitle>Response Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Success Response</h4>
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`{
  "success": true,
  "data": {
    "businessName": "Your Business Name",
    "basePriceSofaCover": 1500,
    "googleAnalyticsId": "G-XXXXXXXXXX"
  },
  "meta": {
    "category": "business",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0"
  }
}`}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Error Response</h4>
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid configuration value",
    "details": {
      "field": "basePriceSofaCover",
      "reason": "Value must be greater than 0"
    }
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security & Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important Security Notes:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Always use HTTPS in production</li>
                      <li>Store API keys securely (environment variables)</li>
                      <li>Implement rate limiting on your server</li>
                      <li>Validate all input data before processing</li>
                      <li>Log API access for monitoring</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Best Practices:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Cache configuration values to reduce API calls</li>
                      <li>Use webhooks for real-time configuration updates</li>
                      <li>Implement fallback values for critical settings</li>
                      <li>Version your configuration schema</li>
                      <li>Monitor configuration changes</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
