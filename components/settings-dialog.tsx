"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { Moon, Sun, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [nebulaApiKey, setNebulaApiKey] = useState("")
  const [savedNebulaApiKey, setSavedNebulaApiKey] = useState("")
  const { theme, setTheme } = useTheme()

  // Load saved API keys from localStorage on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem("nebula-api-key")
    if (savedKey) {
      setNebulaApiKey(savedKey)
      setSavedNebulaApiKey(savedKey)
    }
  }, [])

  const saveSettings = () => {
    // Save API keys to localStorage
    localStorage.setItem("nebula-api-key", nebulaApiKey)
    setSavedNebulaApiKey(nebulaApiKey)

    toast.success("Settings saved", {
      description: "Your API keys have been saved.",
    })

    onOpenChange(false)
  }

  const resetSettings = () => {
    // Reset API keys
    setNebulaApiKey("")
    localStorage.removeItem("nebula-api-key")
    setSavedNebulaApiKey("")

    toast.success("Settings reset", {
      description: "Your API keys have been cleared.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure your API keys and application preferences.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nebula-api-key">Nebula API Key</Label>
            <Input
              id="nebula-api-key"
              type="password"
              value={nebulaApiKey}
              onChange={(e) => setNebulaApiKey(e.target.value)}
              placeholder="sk-..."
              className="col-span-3"
            />
            <p className="text-xs text-muted-foreground">Your API key is stored locally in your browser.</p>
          </div>

          <div className="grid gap-2 pt-4">
            <Label>Theme</Label>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex flex-col items-center justify-center rounded-md border-2 p-3 gap-2 transition-all",
                  theme === "light"
                    ? "border-primary bg-primary/10"
                    : "border-gray-200 dark:border-gray-800 hover:border-primary/50",
                )}
              >
                <Sun className={cn("h-5 w-5", theme === "light" ? "text-primary" : "text-muted-foreground")} />
                <span
                  className={cn("text-xs font-medium", theme === "light" ? "text-primary" : "text-muted-foreground")}
                >
                  Light
                </span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex flex-col items-center justify-center rounded-md border-2 p-3 gap-2 transition-all",
                  theme === "dark"
                    ? "border-primary bg-primary/10"
                    : "border-gray-200 dark:border-gray-800 hover:border-primary/50",
                )}
              >
                <Moon className={cn("h-5 w-5", theme === "dark" ? "text-primary" : "text-muted-foreground")} />
                <span
                  className={cn("text-xs font-medium", theme === "dark" ? "text-primary" : "text-muted-foreground")}
                >
                  Dark
                </span>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button type="button" variant="outline" size="sm" onClick={resetSettings} className="flex items-center gap-1">
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveSettings}>
              Save changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

