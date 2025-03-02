
import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useSavings } from '@/context/SavingsContext';
import { formatCurrency } from '@/lib/savingsUtils';

interface MoneroWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

const MoneroWalletModal: React.FC<MoneroWalletModalProps> = ({ isOpen, onClose, amount }) => {
  const { completePayment } = useSavings();
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [showAddressInput, setShowAddressInput] = useState<boolean>(true);
  const [paymentConfirmationStep, setPaymentConfirmationStep] = useState<boolean>(false);
  
  // Load saved destination address from localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem('moneroDestinationAddress');
    if (savedAddress) {
      setDestinationAddress(savedAddress);
      setShowAddressInput(false);
    }
  }, []);
  
  // Placeholder conversion rate - in a production app this would come from an API
  const xmrRate = 0.005; // USD to XMR (fictional rate for example)
  const amountInXMR = (amount * xmrRate).toFixed(6);

  const handleSaveAddress = () => {
    if (!destinationAddress.trim()) {
      toast.error("Please enter the Monero address you want to contribute to");
      return;
    }
    
    // Save to localStorage for future use
    localStorage.setItem('moneroDestinationAddress', destinationAddress);
    
    setShowAddressInput(false);
    toast.success("Destination address saved");
  };

  const handleInitiatePayment = () => {
    // Move to confirmation step
    setPaymentConfirmationStep(true);
  };

  const handlePaymentConfirmation = () => {
    // In a real app, you would implement verification logic here
    completePayment();
    onClose();
    toast.success(`Payment of ${formatCurrency(amount)} confirmed!`);
    // Reset payment confirmation step for next time
    setPaymentConfirmationStep(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 mx-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-[#654321] mb-4">Monero Payment</h2>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-[#f5f6fa] rounded-lg">
            <p className="text-lg font-semibold">{formatCurrency(amount)}</p>
            <p className="text-sm text-gray-500">≈ {amountInXMR} XMR</p>
          </div>

          {showAddressInput ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="destinationAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Destination Monero Address
                </label>
                <input
                  id="destinationAddress"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#654321]"
                  placeholder="Enter the destination Monero address"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                />
                <p className="mt-2 text-xs text-gray-500">
                  This is the address where you want to receive Monero contributions for this savings goal.
                </p>
              </div>
              <button
                onClick={handleSaveAddress}
                className="w-full bg-[#654321] text-white px-4 py-2 rounded-md hover:bg-[#7c5a3c] transition-colors"
              >
                Save Address
              </button>
            </div>
          ) : paymentConfirmationStep ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md flex items-start gap-3">
                <Info size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">Important Note</h3>
                  <p className="text-sm text-yellow-700">
                    In a production app, this step would verify your transaction on the Monero blockchain. 
                    For demonstration purposes, we're trusting your confirmation.
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                Please confirm that you have sent exactly <span className="font-bold">{amountInXMR} XMR</span> to the destination address.
              </p>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handlePaymentConfirmation}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Confirm Payment Sent
                </button>
                <button
                  onClick={() => setPaymentConfirmationStep(false)}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Send {amountInXMR} XMR to this address:
                </p>
                <div className="bg-gray-100 p-3 rounded-md overflow-hidden text-xs break-all">
                  {destinationAddress}
                </div>
              </div>
              
              <div className="flex justify-center my-4">
                <div className="p-3 bg-white rounded-md border">
                  <img 
                    src="public/lovable-uploads/78f97d6a-3663-4812-920c-3adde48b1c76.png" 
                    alt="Monero payment QR code" 
                    className="w-40 h-40"
                  />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  After sending the payment from your Monero wallet, click the button below to proceed.
                </p>
                <button
                  onClick={handleInitiatePayment}
                  className="w-full bg-[#654321] text-white px-4 py-2 rounded-md hover:bg-[#7c5a3c] transition-colors"
                >
                  I've Sent the Payment
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoneroWalletModal;
