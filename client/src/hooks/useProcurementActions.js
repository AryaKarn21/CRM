import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { procurementAPI } from '@/api/procurement.api'

export function useProcurementActions(invalidateKeys = [['purchase-orders']]) {
  const queryClient = useQueryClient()
  const invalidate = () => invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))

  const submitMutation = useMutation({
    mutationFn: (id) => procurementAPI.submitForApproval(id),
    onSuccess: () => { invalidate(); toast.success('Submitted for approval') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to submit for approval'),
  })

  const approveMutation = useMutation({
    mutationFn: (id) => procurementAPI.approvePO(id),
    onSuccess: () => { invalidate(); toast.success('PO approved') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to approve PO'),
  })

  const receiveMutation = useMutation({
    mutationFn: (id) => procurementAPI.receivePO(id),
    onSuccess: () => { invalidate(); toast.success('PO marked as received') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to mark PO as received'),
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => procurementAPI.cancelPO(id),
    onSuccess: () => { invalidate(); toast.success('Purchase order cancelled') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to cancel purchase order'),
  })

  return { submitMutation, approveMutation, receiveMutation, cancelMutation, invalidate }
}