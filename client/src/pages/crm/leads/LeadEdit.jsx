import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

import { leadsAPI } from '@/api/leads.api'
import { settingsAPI } from '@/api/settings.api'
import { LEAD_STAGES } from '@/lib/constants'

const LEAD_SOURCES = [
    'Website',
    'Referral',
    'Social Media',
    'Email',
    'Cold Call',
    'Advertisement',
    'Other',
]

export default function LeadEdit() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm()

    // Load lead
    const { data: lead, isLoading } = useQuery({
        queryKey: ['lead', id],
        queryFn: () => leadsAPI.getById(id).then(res => res.data),
    })
    const { data: usersData } = useQuery({
        queryKey: ['users'],
        queryFn: () => settingsAPI.getUsers().then(res => res.data),
    })

    const users = usersData?.users || usersData || []

    // Load companies
    const { data: companiesData } = useQuery({
        queryKey: ['companies'],
        queryFn: () => settingsAPI.getCompanies().then(res => res.data),
    })

    const companies = companiesData?.companies || companiesData || []

    // Fill form when lead is loaded
    useEffect(() => {
        if (!lead) return

        reset({
            name: lead.name || '',
            email: lead.email || '',
            phone: lead.phone || '',
            companyId:
                lead.company?.id ||
                lead.Company?.id ||
                lead.companyId ||
                '',
            stage: lead.stage || 'New',
            value: lead.value || 0,
            source: lead.source || '',
            notes: lead.notes || '',
            assignedToId: lead.assignedToId || null,
        })
    }, [lead, reset])

    // Update lead
    const updateMutation = useMutation({
        mutationFn: (data) =>
            leadsAPI.update(id, {
                ...data,
                value: Number(data.value),
                companyId: data.companyId || null,
                assignedToId: data.assignedToId || null,
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lead', id] })
            queryClient.invalidateQueries({ queryKey: ['leads'] })

            toast.success('Lead updated successfully')

            navigate(`/crm/leads/${id}`)
        },

        onError: (err) => {
            console.error(err)
            toast.error(
                err?.response?.data?.message || 'Failed to update lead'
            )
        },
    })

    if (isLoading) {
        return <div className="p-6">Loading...</div>
    }

    return (
        <div className="p-6 max-w-3xl mx-auto animate-fade-in">

            <div className="flex items-center gap-3 mb-6">
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={16} />
                </button>

                <h1 className="text-xl font-bold">
                    Edit Lead
                </h1>
            </div>

            <form
                className="card p-6 flex flex-col gap-5"
                onSubmit={handleSubmit(data => updateMutation.mutate(data))}
            >

                <div className="grid grid-cols-2 gap-4">

                    <div className="form-group">
                        <label>Name *</label>

                        <input
                            className="input"
                            {...register('name', {
                                required: 'Name is required',
                            })}
                        />

                        {errors.name && (
                            <p className="text-red-500 text-xs">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            className="input"
                            {...register('email')}
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone</label>

                        <input
                            className="input"
                            {...register('phone')}
                        />
                    </div>

                    <div className="form-group">
                        <label>Assigned To</label>

                        <select
                            className="input"
                            {...register('assignedToId')}
                        >
                            <option value="">Select User</option>

                            {users.map(user => (
                                <option
                                    key={user.id}
                                    value={user.id}
                                >
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>


                    <div className="form-group">
                        <label>Stage</label>

                        <select
                            className="input"
                            {...register('stage')}
                        >
                            {LEAD_STAGES.map(stage => (
                                <option
                                    key={stage}
                                    value={stage}
                                >
                                    {stage}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Value</label>

                        <input
                            type="number"
                            className="input"
                            {...register('value')}
                        />
                    </div>

                    <div className="form-group">
                        <label>Source</label>

                        <select
                            className="input"
                            {...register('source')}
                        >
                            <option value="">
                                Select Source
                            </option>

                            {LEAD_SOURCES.map(source => (
                                <option
                                    key={source}
                                    value={source}
                                >
                                    {source}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group col-span-2">
                        <label>Company</label>

                        <select
                            className="input"
                            {...register('companyId')}
                        >
                            <option value="">
                                Select Company
                            </option>

                            {companies.map(company => (
                                <option
                                    key={company.id}
                                    value={company.id}
                                >
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group col-span-2">
                        <label>Notes</label>

                        <textarea
                            rows={4}
                            className="input"
                            {...register('notes')}
                        />
                    </div>

                </div>

                <div className="flex justify-end gap-3">

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending
                            ? 'Updating...'
                            : 'Update Lead'}
                    </button>

                </div>

            </form>

        </div>
    )
}