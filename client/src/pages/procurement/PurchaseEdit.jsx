import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

import { procurementAPI } from '@/api/procurement.api'
import { formatCurrency } from '@/lib/utils'

export default function PurchaseEdit() {
    const { id } = useParams()

    const navigate = useNavigate()

    const queryClient = useQueryClient()

    // ---------------------------
    // Load Purchase Order
    // ---------------------------

    const { data, isLoading } = useQuery({
        queryKey: ['purchase-order', id],
        queryFn: () =>
            procurementAPI.getPurchaseOrder(id).then(res => res.data),
    })

    // ---------------------------
    // Load Vendors
    // ---------------------------

    const { data: vendorData } = useQuery({
        queryKey: ['vendors'],
        queryFn: () =>
            procurementAPI.getVendors().then(res => res.data),
    })

    const vendors = vendorData?.vendors || []

    // ---------------------------
    // Form
    // ---------------------------

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            vendorId: '',
            expectedDelivery: '',
            notes: '',
            items: [],
        },
    })

    // ---------------------------
    // Dynamic Line Items
    // ---------------------------

    const {
        fields,
        append,
        remove,
    } = useFieldArray({
        control,
        name: 'items',
    })

    const watchedItems = watch('items')

    const totalAmount =
        watchedItems?.reduce((sum, item) => {
            return (
                sum +
                Number(item.quantity || 0) *
                Number(item.unitPrice || 0)
            )
        }, 0) || 0

    // ---------------------------
    // Populate Form
    // ---------------------------

    useEffect(() => {
        if (!data) return

        reset({
            vendorId: data.vendorId,
            expectedDelivery: data.expectedDelivery?.substring(0, 10) || '',
            notes: data.notes || '',
            items:
                data.items?.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })) || [],
        })
    }, [data, reset])

    // ---------------------------
    // Update Mutation
    // ---------------------------

    const updateMutation = useMutation({
        mutationFn: (formData) => {

            const payload = {
                ...formData,
                totalAmount,
                items: formData.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    total:
                        Number(item.quantity) *
                        Number(item.unitPrice),
                })),
            }

            return procurementAPI.updatePO(id, payload);
        },

        onSuccess: () => {
            toast.success('Purchase Order Updated')


            queryClient.invalidateQueries({
                queryKey: ['purchase-orders'],
            })

            queryClient.invalidateQueries({
                queryKey: ['purchase-order', id],
            })

            navigate('/procurement')
        },

        onError: err => {
            toast.error(
                err?.response?.data?.message ||
                'Failed to update Purchase Order'
            )
        },
    })

    if (isLoading) {
        return (
            <div className="p-8">
                Loading Purchase Order...
            </div>
        )
    }
    if (isLoading) {
        return (
            <div className="p-8">
                Loading Purchase Order...
            </div>
        )
    }

    return (
        <div className="animate-fade-in">

            {/* Header */}
            <div className="page-header">

                <div className="flex items-center gap-3">

                    <button
                        className="btn btn-ghost"
                        onClick={() => navigate('/procurement/orders')}
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <div>
                        <h1
                            className="text-[18px] font-bold"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Edit Purchase Order
                        </h1>

                        <p
                            className="text-[12px] mt-1"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {data?.poNumber}
                        </p>
                    </div>

                </div>

            </div>

            <form
                className="card mx-6 p-6 flex flex-col gap-6"
                onSubmit={handleSubmit(d => updateMutation.mutate(d))}
            >

                {/* Vendor + Delivery */}

                <div className="grid grid-cols-2 gap-5">

                    <div className="form-group">

                        <label className="form-label">
                            Vendor
                        </label>

                        <select
                            className="input"
                            {...register('vendorId', {
                                required: 'Vendor is required',
                            })}
                        >

                            <option value="">
                                Select Vendor
                            </option>

                            {vendors.map(v => (

                                <option
                                    key={v.id}
                                    value={v.id}
                                >
                                    {v.name}
                                </option>

                            ))}

                        </select>

                        {errors.vendorId && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.vendorId.message}
                            </p>
                        )}

                    </div>

                    <div className="form-group">

                        <label className="form-label">
                            Expected Delivery
                        </label>

                        <input
                            type="date"
                            className="input"
                            {...register('expectedDelivery')}
                        />

                    </div>

                </div>

                {/* Items */}

                <div>

                    <div className="flex justify-between items-center mb-3">

                        <h3 className="font-semibold">
                            Purchase Items
                        </h3>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                append({
                                    name: '',
                                    quantity: 1,
                                    unitPrice: 0,
                                })
                            }
                        >

                            <Plus size={14} />

                            Add Item

                        </button>

                    </div>

                    <div className="flex flex-col gap-3">

                        {fields.map((field, index) => (

                            <div
                                key={field.id}
                                className="grid grid-cols-12 gap-3 items-center"
                            >

                                <input
                                    className="input col-span-5"
                                    placeholder="Item Name"
                                    {...register(`items.${index}.name`, {
                                        required: true,
                                    })}
                                />

                                <input
                                    type="number"
                                    className="input col-span-2"
                                    min={1}
                                    {...register(`items.${index}.quantity`, {
                                        required: true,
                                        min: 1,
                                    })}
                                />

                                <input
                                    type="number"
                                    className="input col-span-2"
                                    min={0}
                                    step="0.01"
                                    {...register(`items.${index}.unitPrice`, {
                                        required: true,
                                        min: 0,
                                    })}
                                />

                                <div className="col-span-2 font-semibold">

                                    {formatCurrency(

                                        (Number(
                                            watchedItems?.[index]?.quantity
                                        ) || 0)

                                        *

                                        (Number(
                                            watchedItems?.[index]?.unitPrice
                                        ) || 0)

                                    )}

                                </div>

                                <button
                                    type="button"
                                    className="text-red-500"
                                    onClick={() => remove(index)}
                                >

                                    <Trash2 size={16} />

                                </button>

                            </div>

                        ))}

                    </div>

                </div>

                {/* Notes */}

                <div className="form-group">

                    <label className="form-label">

                        Notes

                    </label>

                    <textarea
                        rows={4}
                        className="input"
                        {...register('notes')}
                    />

                </div>

                {/* Total */}

                <div className="flex justify-end border-t pt-5">

                    <div className="text-right">

                        <div
                            className="text-sm"
                            style={{
                                color: 'var(--text-muted)',
                            }}
                        >
                            Total Amount
                        </div>

                        <div className="text-xl font-bold">

                            {formatCurrency(totalAmount)}

                        </div>

                    </div>

                </div>

                {/* Footer */}

                <div className="flex justify-end gap-3">

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/procurement/orders')}
                    >

                        Cancel

                    </button>

                    <button
                        className="btn btn-primary"
                        disabled={updateMutation.isPending}
                    >

                        {updateMutation.isPending
                            ? 'Updating...'
                            : 'Update Purchase Order'}

                    </button>

                </div>

            </form>

        </div>
    )
}

