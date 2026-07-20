import { ArrowUpCircle, ArrowDownCircle, Scale } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function LedgerSummary({ entries = [] }) {
  const totalDebit = entries.reduce((sum, e) => sum + Number(e.debit || 0), 0)
  const totalCredit = entries.reduce((sum, e) => sum + Number(e.credit || 0), 0)
  const netBalance = totalCredit - totalDebit

  const cards = [
    {
      title: 'Total Debit',
      value: formatCurrency(totalDebit),
      icon: ArrowDownCircle,
      color: 'bg-red-600',
    },
    {
      title: 'Total Credit',
      value: formatCurrency(totalCredit),
      icon: ArrowUpCircle,
      color: 'bg-green-600',
    },
    {
      title: 'Net Balance',
      value: formatCurrency(netBalance),
      icon: Scale,
      color: netBalance >= 0 ? 'bg-blue-600' : 'bg-orange-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-6 mb-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.title} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {card.title}
                </p>
                <h2 className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                  {card.value}
                </h2>
              </div>
              <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}