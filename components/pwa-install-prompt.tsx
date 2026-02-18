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
    // console.log("PWA Install Prompt: Component mounted. Waiting for beforeinstallprompt event...")

    const handleBeforeInstallPrompt = (event: Event) => {
      // console.log("PWA Install Prompt: 'beforeinstallprompt' event has been successfully fired and captured.")
      event.preventDefault() // Prevent the default browser prompt
      setInstallPromptEvent(event as BeforeInstallPromptEvent)
      setIsPromptVisible(true) // Show our custom prompt
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      // console.log("PWA Install Prompt: App was installed.")
      setIsPromptVisible(false) // Hide the prompt once installed
      setInstallPromptEvent(null) // Clear the event
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    // A timer to help debug if the event never fires.
    const timer = setTimeout(() => {
      if (installPromptEvent === null) {
        // console.log("PWA Install Prompt: 'beforeinstallprompt' event was not fired after 5 seconds. Common reasons: 1) Not on HTTPS, 2) App already installed, 3) Browser's user engagement criteria not met.")
      }
    }, 5000)

    return () => {
      // console.log("PWA Install Prompt: Component unmounted.")
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      )
      window.removeEventListener("appinstalled", handleAppInstalled)
      clearTimeout(timer)
    }
    // Only run this effect once on component mount
  }, [installPromptEvent])

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      return
    }
    installPromptEvent.prompt()
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
        <p className="text-base font-medium sm:text-lg sm:font-semibold">
          Get our app for a better experience!
        </p>
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


