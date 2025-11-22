import { useStatus } from '../contexts/StatusContext'

export default function StatusToggle() {
  const { status, toggleStatus } = useStatus()

  return (
    <div className="mt-8 flex flex-col items-center space-y-4">
      <p className="text-white/80 text-sm md:text-base">Endre status:</p>
      <button
        onClick={toggleStatus}
        className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        Sett til {status === 'yes' ? 'Nei' : 'Ja'}
      </button>
    </div>
  )
}

