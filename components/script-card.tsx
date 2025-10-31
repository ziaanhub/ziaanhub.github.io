"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Eye, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ScriptCardProps {
  id: string
  title: string
  description?: string
  language: string
  viewsCount: number
  likesCount: number
  authorUsername: string
  tags?: string[]
}

export function ScriptCard({
  id,
  title,
  description,
  language,
  viewsCount,
  likesCount,
  authorUsername,
  tags,
}: ScriptCardProps) {
  return (
    <Link href={`/scripts/${id}`}>
      <Card className="p-6 border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all h-full cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded font-medium">
            {language}
          </span>
          {viewsCount > 100 && (
            <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">Trending</span>
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2 text-balance line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description || "No description provided"}</p>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 border-t border-border pt-3">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {viewsCount}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {likesCount}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">By {authorUsername}</p>
      </Card>
    </Link>
  )
}
