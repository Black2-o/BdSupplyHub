"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

// Define the interface for the event, as it's not standard in all TS lib versions
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

const PwaInstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isPromptVisible, setIsPromptVisible] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault() // Prevent the default browser prompt
      setInstallPromptEvent(event as BeforeInstallPromptEvent)
      setIsPromptVisible(true) // Show our custom prompt
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsPromptVisible(false); // Hide the prompt once installed
      setInstallPromptEvent(null); // Clear the event
    };

    window.addEventListener('appinstalled', handleAppInstalled);


    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled);
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      return
    }
    // The prompt() method can only be called once.
    installPromptEvent.prompt()
    
    // We don't need to await the result here to hide the UI.
    // The browser handles the rest of the flow.
    
    // Hide the prompt and clear the event, as it can't be used again.
    setIsPromptVisible(false)
    setInstallPromptEvent(null)
  }

  const handleCancelClick = () => {
    setIsPromptVisible(false)
  }

  if (!isPromptVisible) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-4 shadow-lg animate-in slide-in-from-bottom-10 duration-500">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <p className="text-base font-medium sm:text-lg sm:font-semibold">Get our app for a better experience!</p>
        <div className="flex flex-shrink-0 gap-2">
          <Button onClick={handleInstallClick}>Install</Button>
          <Button variant="outline" onClick={handleCancelClick}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PwaInstallPrompt

