"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Plus, Trash2, Download, Building, DollarSign, BarChart, Megaphone, Info } from "lucide-react"
import { dynamicConfigSystem } from "@/lib/dynamic-config-system"
import type { DynamicConfigField, ConfigCategory } from "@/lib/types/dynamic-config"
import { toast } from "@/hooks/use-toast"

export default function DynamicConfigPage() {
  const [categories, setCategories] = useState<ConfigCategory[]>([])
  const [fields, setFields] = useState<DynamicConfigField[]>([])
  const [values, setValues] = useState<Record<string, any>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCreateFieldOpen, setIsCreateFieldOpen] = useState(false)
  const [editingField, setEditingField] = useState<DynamicConfigField | null>(null)
  const [loading, setLoading] = useState(true)

  // New field form state
  const [newField, setNewField] = useState({
    key: "",
    label: "",
    labelEn: "",
    type: "text" as const,
    category: "business" as const,
    required: false,
    description: "",
    descriptionEn: "",
    defaultValue: "",
    validation: {
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      pattern: "",
      options: [] as string[],
    },
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [categoriesData, fieldsData, valuesData] = await Promise.all([
        dynamicConfigSystem.getCategories(),
        dynamicConfigSystem.getFields(),
        dynamicConfigSystem.getAllValues(),
      ])

      setCategories(categoriesData)
      setFields(fieldsData)
      setValues(valuesData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load configuration data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveValue = async (fieldId: string, value: any) => {
    try {
      await dynamicConfigSystem.setValue(fieldId, value, "admin-001")

      // Update local state
      const field = fields.find((f) => f.id === fieldId)
      if (field) {
        setValues((prev) => ({
          ...prev,
          [field.key]: value,
        }))
      }

      toast({
        title: "Success",
        description: "Configuration value saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save value",
        variant: "destructive",
      })
    }
  }

  const handleCreateField = async () => {
    try {
      const fieldData = {
        ...newField,
        order: fields.length + 1,
        isActive: true,
        createdBy: "admin-001",
      }

      await dynamicConfigSystem.createField(fieldData)
      await loadData()

      setIsCreateFieldOpen(false)
      setNewField({
        key: "",
        label: "",
        labelEn: "",
        type: "text",
        category: "business",
        required: false,
        description: "",
        descriptionEn: "",
        defaultValue: "",
        validation: {
          min: undefined,
          max: undefined,
          pattern: "",
          options: [],
        },
      })

      toast({
        title: "Success",
        description: "New field created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create field",
        variant: "destructive",
      })
    }
  }

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm("Are you sure you want to delete this field?")) return

    try {
      await dynamicConfigSystem.deleteField(fieldId)
      await loadData()

      toast({
        title: "Success",
        description: "Field deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete field",
        variant: "destructive",
      })
    }
  }

  const handleExportConfig = async () => {
    try {
      const configJson = await dynamicConfigSystem.exportConfig()
      const blob = new Blob([configJson], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `config-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Configuration exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export configuration",
        variant: "destructive",
      })
    }
  }

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "business":
        return Building
      case "pricing":
        return DollarSign
      case "analytics":
        return BarChart
      case "technical":
        return Settings
      case "marketing":
        return Megaphone
      default:
        return Settings
    }
  }

  const renderFieldInput = (field: DynamicConfigField) => {
    const currentValue = values[field.key] ?? field.defaultValue ?? ""

    switch (field.type) {
      case "text":
      case "email":
      case "url":
        return (
          <Input
            type={field.type}
            value={currentValue}
            onChange={(e) => handleSaveValue(field.id, e.target.value)}
            placeholder={field.description}
          />
        )

      case "number":
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleSaveValue(field.id, Number(e.target.value))}
            min={field.validation?.min}
            max={field.validation?.max}
            placeholder={field.description}
          />
        )

      case "textarea":
        return (
          <Textarea
            value={currentValue}
            onChange={(e) => handleSaveValue(field.id, e.target.value)}
            placeholder={field.description}
            rows={3}
          />
        )

      case "boolean":
        return <Switch checked={currentValue} onCheckedChange={(checked) => handleSaveValue(field.id, checked)} />

      case "select":
        return (
          <Select value={currentValue} onValueChange={(value) => handleSaveValue(field.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select option..." />
            </SelectTrigger>
            <SelectContent>
              {field.validation?.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "date":
        return <Input type="date" value={currentValue} onChange={(e) => handleSaveValue(field.id, e.target.value)} />

      default:
        return (
          <Input
            value={currentValue}
            onChange={(e) => handleSaveValue(field.id, e.target.value)}
            placeholder={field.description}
          />
        )
    }
  }

  const filteredFields =
    selectedCategory === "all" ? fields : fields.filter((field) => field.category === selectedCategory)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dynamic Configuration</h1>
          <p className="text-gray-600 mt-1">Manage system settings and business parameters</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportConfig}>
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Dialog open={isCreateFieldOpen} onOpenChange={setIsCreateFieldOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Configuration Field</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="key">Field Key</Label>
                    <Input
                      id="key"
                      value={newField.key}
                      onChange={(e) => setNewField((prev) => ({ ...prev, key: e.target.value }))}
                      placeholder="camelCaseKey"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Field Type</Label>
                    <Select
                      value={newField.type}
                      onValueChange={(value: any) => setNewField((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="label">Label (Thai)</Label>
                    <Input
                      id="label"
                      value={newField.label}
                      onChange={(e) => setNewField((prev) => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="labelEn">Label (English)</Label>
                    <Input
                      id="labelEn"
                      value={newField.labelEn}
                      onChange={(e) => setNewField((prev) => ({ ...prev, labelEn: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newField.category}
                    onValueChange={(value: any) => setNewField((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="description">Description (Thai)</Label>
                    <Textarea
                      id="description"
                      value={newField.description}
                      onChange={(e) => setNewField((prev) => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionEn">Description (English)</Label>
                    <Textarea
                      id="descriptionEn"
                      value={newField.descriptionEn}
                      onChange={(e) => setNewField((prev) => ({ ...prev, descriptionEn: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="required"
                    checked={newField.required}
                    onCheckedChange={(checked) => setNewField((prev) => ({ ...prev, required: checked }))}
                  />
                  <Label htmlFor="required">Required Field</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateFieldOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateField}>Create Field</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.id)
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              These settings allow you to configure various aspects of your system without code changes. Values are
              validated and applied in real-time.
            </AlertDescription>
          </Alert>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFields.map((field) => (
              <Card key={field.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{field.label}</CardTitle>
                    <div className="flex items-center space-x-1">
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteField(field.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{field.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor={field.id}>{field.labelEn}</Label>
                    {renderFieldInput(field)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFields.length === 0 && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Configuration Fields</h3>
              <p className="text-gray-600 mb-4">
                {selectedCategory === "all"
                  ? "No configuration fields have been created yet."
                  : `No fields found in the ${categories.find((c) => c.id === selectedCategory)?.name} category.`}
              </p>
              <Button onClick={() => setIsCreateFieldOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Field
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
