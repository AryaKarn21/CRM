import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'

export default function FormModal({ open, onClose, title, onSubmit, loading, children, size = 'md', submitLabel = 'Save' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                {submitLabel}...
              </span>
            ) : submitLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  )
}