"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Copy, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ScriptShareButtonProps {
  scriptId: string
  title: string
}

export function ScriptShareButton({ scriptId, title }: ScriptShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/scripts/${scriptId}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareTwitter = () => {
    const text = `Check out "${title}" on ZiaanBlox - a community platform for sharing scripts!`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
    )
  }

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
  }

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <div className="flex items-center gap-2 w-full">
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareTwitter} className="cursor-pointer">
          <span>Share on Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareFacebook} className="cursor-pointer">
          <span>Share on Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareLinkedIn} className="cursor-pointer">
          <span>Share on LinkedIn</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
