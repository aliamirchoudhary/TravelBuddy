import { useEffect, useState } from 'react';
import useExpenseStore          from '../../store/expenseStore';
import SettlementSummary        from './SettlementSummary';
import ExpenseFeed              from './ExpenseFeed';
import AddExpenseModal          from './AddExpenseModal';
import CurrencyToggle           from './CurrencyToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpensePanel({ tripId, participants, isOpen, onClose }) {
  const { fetchExpenses, fetchSettlement, isLoading } = useExpenseStore();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (isOpen && tripId) {
      fetchExpenses(tripId);
      fetchSettlement(tripId);
    }
  }, [isOpen, tripId, fetchExpenses, fetchSettlement]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            width: '320px', 
            borderLeft: '1px solid var(--border)', 
            display: 'flex',
            flexDirection: 'column', 
            height: '100%', 
            background: 'var(--surface)',
            flexShrink: 0
          }}
        >
          {/* Header */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--paper)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>💸 Trip Expenses</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--paper-muted)' }}>✕</button>
          </div>

          {/* Currency Toggle */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <CurrencyToggle />
          </div>

          {/* Settlement Summary — always at top */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <SettlementSummary tripId={tripId} />
          </div>

          {/* Add Expense Button */}
          <div style={{ padding: '14px 16px' }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
            >
              + Add Expense
            </button>
          </div>

          {/* Expense Feed */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
            {isLoading ? <p style={{color: 'var(--paper-dim)', fontSize: 13, textAlign: 'center'}}>Loading...</p> : <ExpenseFeed tripId={tripId} />}
          </div>

          {/* Add Expense Modal */}
          {showAddModal && (
            <AddExpenseModal
              tripId={tripId}
              participants={participants}
              onClose={() => setShowAddModal(false)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
