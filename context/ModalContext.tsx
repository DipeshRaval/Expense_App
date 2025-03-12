import React, { createContext, useContext, useState, useCallback } from 'react';
import AddExpenseModal from '../components/expense-tracker/AddExpenseModal';

interface ModalContextType {
  showAddExpense: boolean;
  openAddExpense: () => void;
  closeAddExpense: () => void;
}

const ModalContext = createContext<ModalContextType>({
  showAddExpense: false,
  openAddExpense: () => {},
  closeAddExpense: () => {},
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showAddExpense, setShowAddExpense] = useState(false);

  const openAddExpense = useCallback(() => {
    setShowAddExpense(true);
  }, []);

  const closeAddExpense = useCallback(() => {
    setShowAddExpense(false);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        showAddExpense,
        openAddExpense,
        closeAddExpense,
      }}
    >
      {children}
      {showAddExpense && <AddExpenseModal onClose={closeAddExpense} />}
    </ModalContext.Provider>
  );
};

export default ModalContext; 