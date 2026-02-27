import { Heart, User } from 'lucide-react'
import { Report } from '@/lib/types'

interface ReportCardProps {
  report: Report
}

export function ReportCard({ report }: ReportCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 hover:border-emerald-500 transition-colors">
      {/* FPS */}
      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-emerald-400">
          {report.fps_avg} FPS
        </div>
        <div className="text-sm text-zinc-400">
          1% Low: {report.fps_1low} FPS
        </div>
      </div>

      {/* Game */}
      <h3 className="text-xl font-semibold text-zinc-100 mb-4">{report.game}</h3>

      {/* Hardware Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-zinc-800 text-emerald-400 px-2 py-1 rounded text-sm">
          {report.cpu}
        </span>
        <span className="bg-zinc-800 text-emerald-400 px-2 py-1 rounded text-sm">
          {report.gpu}
        </span>
        <span className="bg-zinc-800 text-emerald-400 px-2 py-1 rounded text-sm">
          {report.ram_gb}GB RAM
        </span>
        <span className="bg-zinc-800 text-emerald-400 px-2 py-1 rounded text-sm">
          {report.resolution}
        </span>
      </div>

      {/* Preset and Tweaks */}
      <div className="mb-4">
        <div className="text-sm text-zinc-300">
          <strong>Preset:</strong> {report.preset}
        </div>
        <div className="text-sm text-zinc-400 mt-1">
          {report.tweaks}
        </div>
      </div>

      {/* Stability */}
      <div className="mb-4">
        <div className="text-sm text-zinc-300">
          <strong>Estabilidade:</strong> {report.stability_note}
        </div>
      </div>

      {/* Images */}
      {report.images && report.images.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            {report.images.slice(0, 4).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Screenshot ${index + 1}`}
                className="w-full h-20 object-cover rounded border border-zinc-700"
              />
            ))}
          </div>
          {report.images.length > 4 && (
            <p className="text-xs text-zinc-500 mt-1">+{report.images.length - 4} mais imagens</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-zinc-400" />
          <span className="text-sm text-zinc-400">
            {report.profile?.full_name || report.profile?.email || 'Anônimo'}
          </span>
          <span className="text-sm text-zinc-500">
            {formatDate(report.created_at)}
          </span>
        </div>
        <button className="flex items-center space-x-1 text-zinc-400 hover:text-red-400 transition-colors">
          <Heart className="w-4 h-4" />
          <span className="text-sm">{report.likes}</span>
        </button>
      </div>
    </div>
  )
}