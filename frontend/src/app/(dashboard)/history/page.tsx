"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenerationCard } from "@/components/shared/GenerationCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { HistoryItem } from "@/types"

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.getHistory({
        type: activeTab === "all" ? undefined : activeTab,
        search: search || undefined,
        limit: 50,
      })
      setItems(res.items)
    } catch {
      // If backend is not running, use empty state
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, search])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleDelete = async (id: string) => {
    try {
      await api.deleteHistory(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      toast.success("Deleted successfully")
    } catch {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generation History</h1>
          <p className="text-muted-foreground mt-2">View and manage your past generations.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search generations..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="image">Images</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
        </TabsList>

        {["all", "text", "image", "video"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-xl bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <GenerationCard key={item.id} item={item} onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Clock className="h-8 w-8" />}
                title="No history found"
                description={
                  search
                    ? "No results match your search criteria."
                    : "You haven't generated anything yet. Head to a studio to get started!"
                }
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
