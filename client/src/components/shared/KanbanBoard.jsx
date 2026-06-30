import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { cn, formatCurrency, classifyStatus } from '@/lib/utils'

export default function KanbanBoard({ columns, cards, onDragEnd, onCardClick, onAddCard, cardRenderer }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 px-6 pt-4" style={{ minHeight: 'calc(100vh - 180px)' }}>
        {columns.map((col) => {
          const colCards = cards.filter(c => c.stage === col.key || c.status === col.key)
          return (
            <div key={col.key} className="kanban-column flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{col.label}</span>
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                    {colCards.length}
                  </span>
                </div>
                {col.total !== undefined && (
                  <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {formatCurrency(col.total)}
                  </span>
                )}
              </div>

              {/* Cards */}
              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn('flex-1 overflow-y-auto p-2 flex flex-col gap-2 transition-colors', snapshot.isDraggingOver && 'bg-[var(--primary-light)]')}
                  >
                    {colCards.map((card, index) => (
                      <Draggable key={card._id} draggableId={card._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn('kanban-card', snapshot.isDragging && 'shadow-lg ring-2 ring-[var(--primary)]')}
                            onClick={() => onCardClick?.(card)}
                          >
                            {cardRenderer ? cardRenderer(card) : <DefaultCard card={card} />}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {onAddCard && (
                      <button
                        onClick={() => onAddCard(col.key)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] w-full transition-colors hover:bg-[var(--surface-2)]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Plus size={13} /> Add card
                      </button>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}

function DefaultCard({ card }) {
  return (
    <div>
      <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{card.name || card.title}</p>
      {card.value && <p className="text-[12px] font-semibold" style={{ color: 'var(--primary)' }}>{formatCurrency(card.value)}</p>}
      {card.status && <Badge variant={classifyStatus(card.status)} className="mt-2">{card.status}</Badge>}
    </div>
  )
}