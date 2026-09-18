"use client"

import { useState } from "react"
import { Palette, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function BrandKitPage() {
  const [formData, setFormData] = useState({
    companyName: "Segue IT",
    primaryColor: "#2563eb",
    secondaryColor: "#0f172a",
    accentColor: "#06b6d4",
    brandVoice: "Professional, innovative, and clear. We speak to enterprise clients with confidence but avoid overly dense jargon.",
    hashtags: "#SegueIT, #TechSolutions, #Innovation",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Brand Kit saved successfully!")
    }, 1000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Palette className="h-8 w-8 text-primary" /> Brand Kit
        </h1>
        <p className="text-muted-foreground mt-2">Configure your brand guidelines to personalize AI generations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Identity</CardTitle>
          <CardDescription>Basic information about your brand.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} />
          </div>
          
          <div className="space-y-3 pt-2">
            <Label>Brand Colors</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Primary</Label>
                <div className="flex gap-2">
                  <Input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="w-12 h-10 p-1" />
                  <Input name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="flex-1 font-mono text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Secondary</Label>
                <div className="flex gap-2">
                  <Input type="color" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} className="w-12 h-10 p-1" />
                  <Input name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} className="flex-1 font-mono text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Accent</Label>
                <div className="flex gap-2">
                  <Input type="color" name="accentColor" value={formData.accentColor} onChange={handleChange} className="w-12 h-10 p-1" />
                  <Input name="accentColor" value={formData.accentColor} onChange={handleChange} className="flex-1 font-mono text-sm" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Guidelines</CardTitle>
          <CardDescription>Rules for generating text and copy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brandVoice">Brand Voice & Tone</Label>
            <Textarea 
              id="brandVoice" 
              name="brandVoice" 
              value={formData.brandVoice} 
              onChange={handleChange} 
              className="min-h-[100px]"
              placeholder="Describe how your brand speaks..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hashtags">Default Hashtags</Label>
            <Input 
              id="hashtags" 
              name="hashtags" 
              value={formData.hashtags} 
              onChange={handleChange} 
              placeholder="Comma separated tags"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave} disabled={isSaving} className="ml-auto bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25">
            {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Brand Kit</>}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
