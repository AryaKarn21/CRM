import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { List, Plus } from 'lucide-react'
import { opportunitiesAPI } from '@/api/opportunities.api'
import KanbanBoard from '@/components/shared/KanbanBoard'
import OpportunityFormModal from '@/components/shared/OpportunityFormModal'
import { formatCurrency } from '@/lib/utils'
import { OPPORTUNITY_STAGES } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function OpportunityKanban() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['opportunities-kanban'],
    queryFn: () => opportunitiesAPI.getAll({ limit: 200 }).then(r => r.data),
  })

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }) => opportunitiesAPI.updateStage(id, stage),
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: ['opportunities-kanban'] })
      const prev = queryClient.getQueryData(['opportunities-kanban'])
      queryClient.setQueryData(['opportunities-kanban'], (old) => ({
        ...old,
        opportunities: old.opportunities.map(o => o._id === id ? { ...o, stage } : o),
      }))
      return { prev }
    },
    onError: (_, __, ctx) => queryClient.setQueryData(['opportunities-kanban'], ctx.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['opportunities-kanban'] }),
  })

  const handleDragEnd = (result) => {
    if (!result.destination) return
    stageMutation.mutate({ id: result.draggableId, stage: result.destination.droppableId })
  }

  const columns = OPPORTUNITY_STAGES.map((stage) => {
    const stageCards = data?.opportunities?.filter(o => o.stage === stage) || []
    return {
      key: stage,
      label: stage,
      total: stageCards.reduce((sum, o) => sum + (o.value || 0), 0),
    }
  })

  const cardRenderer = (card) => (
    <div>
      <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{card.name}</p>
      {card.account?.name && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{card.account.name}</p>}
      {card.value > 0 && <p className="text-[13px] font-bold mt-2" style={{ color: 'var(--primary)' }}>{formatCurrency(card.value)}</p>}
      {card.probability !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex-1 h-1 rounded-full bg-[var(--border)]">
            <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${card.probability}%` }} />
          </div>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{card.probability}%</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Opportunity Pipeline</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{data?.total ?? 0} opportunities</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/crm/opportunities')}>
            <List size={14} /> List View
          </button>
<           button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Add Opportunity
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 px-6 pt-4 overflow-x-auto">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-[280px] h-[400px] rounded-xl bg-[var(--border)] animate-pulse flex-shrink-0" />
          ))}
        </div>
      ) : (
        <KanbanBoard
          columns={columns}
          cards={data?.opportunities || []}
          onDragEnd={handleDragEnd}
          onCardClick={(card) => navigate(`/crm/opportunities/${card._id}`)}
          cardRenderer={cardRenderer}
          
        />
        
      )}
      <OpportunityFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
      
    </div>
  )
}