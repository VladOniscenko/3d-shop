import { ShoppingCart } from "lucide-react";

interface AddedToCartToastProps {
  visible: boolean;
  text: string;
  onClick: () => void;
}

export default function AddedToCartToast({
  visible,
  text,
  onClick,
}: AddedToCartToastProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <button
        onClick={onClick}
        className="bg-[#133827] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-emerald-400/30"
      >
        <ShoppingCart size={20} className="text-emerald-400" />
        <span className="font-bold text-sm">{text}</span>
      </button>
    </div>
  );
}
