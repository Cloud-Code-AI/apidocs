import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ApiUsage() {
  return (
    <div className="border border-border p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">API Usage</h2>
      <Tabs defaultValue="javascript">
        <TabsList className="mb-4">
          <TabsTrigger value="javascript" className="px-4 py-2">JavaScript</TabsTrigger>
          <TabsTrigger value="python" className="px-4 py-2">Python</TabsTrigger>
          <TabsTrigger value="curl" className="px-4 py-2">cURL</TabsTrigger>
        </TabsList>
        <TabsContent value="javascript">JavaScript code example</TabsContent>
        <TabsContent value="python">Python code example</TabsContent>
        <TabsContent value="curl">cURL code example</TabsContent>
      </Tabs>
    </div>
  )
}