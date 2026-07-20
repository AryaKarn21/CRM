import FilterBar from '@/components/shared/FilterBar'

export default function LedgerFilters({ values, onChange }) {
  return (
    <FilterBar
      searchPlaceholder="Search by description, reference..."
      filters={[
        {
          key: 'type',
          label: 'Type',
          options: ['debit', 'credit'].map((v) => ({ label: v, value: v })),
        },
      ]}
      values={values}
      onChange={onChange}
    />
  )
}