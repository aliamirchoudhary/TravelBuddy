import useExpenseStore from '../../store/expenseStore';
import ExpenseCard     from './ExpenseCard';
import api             from '../../services/api';

export default function ExpenseFeed({ tripId }) {
  const { expenses, fetchExpenses, fetchSettlement } = useExpenseStore();

  const handleSettle = async (expenseId) => {
    try {
      await api.put(`/expenses/settle/${expenseId}`);
      fetchExpenses(tripId);
      fetchSettlement(tripId);
    } catch(e) {
      console.error(e);
    }
  };

  if (!expenses || !expenses.length)
    return <p style={{ color: 'var(--paper-dim)', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>No expenses added yet.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {expenses.map(exp => (
        <ExpenseCard key={exp.ExpenseID} expense={exp} onSettle={handleSettle} />
      ))}
    </div>
  );
}
