import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Heart, Code2 } from "lucide-react"

interface ScriptStatsProps {
  viewsCount: number
  likesCount: number
  scriptCount: number
}

export function ScriptStats({ viewsCount, likesCount, scriptCount }: ScriptStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            Total Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{viewsCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Heart className="w-4 h-4 text-muted-foreground" />
            Total Likes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{likesCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Code2 className="w-4 h-4 text-muted-foreground" />
            Scripts Shared
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scriptCount}</div>
        </CardContent>
      </Card>
    </div>
  )
}
