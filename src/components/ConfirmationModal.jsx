// src/components/ConfirmationModal.jsx
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center animate-slide-in">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <FaExclamationTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mt-5">Confirmar Acción</h3>
        <p className="text-sm text-gray-500 mt-2">{message}</p>
        <div className="mt-6 flex justify-center space-x-4">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-6 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;