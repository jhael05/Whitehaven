import React, { useState } from 'react';
import { MenuItem, Customization } from '../types/cafe';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Flame, Check } from 'lucide-react';

interface DrinkCustomizerModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const SWEETNESS_OPTIONS: Customization['sweetness'][] = ['0%', '25%', '50%', '75%', '100%'];
const ICE_OPTIONS: Customization['iceLevel'][] = ['No Ice', 'Less Ice', 'Regular Ice', 'Extra Ice'];
const MILK_OPTIONS: Customization['milkType'][] = [
  'Whole Milk',
  'Oat Milk (+₱30)',
  'Almond Milk (+₱30)',
  'Soy Milk (+₱20)',
];

const AVAILABLE_ADDONS = [
  { label: 'Extra Espresso Shot (+₱30)', price: 30 },
  { label: 'Coffee Jelly (+₱20)', price: 20 },
  { label: 'Vanilla Syrup (+₱20)', price: 20 },
  { label: 'Caramel Drizzle (+₱20)', price: 20 },
  { label: 'Whipped Cream (+₱25)', price: 25 },
];

export const DrinkCustomizerModal: React.FC<DrinkCustomizerModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [temperature, setTemperature] = useState<'Iced' | 'Hot'>('Iced');
  const [size, setSize] = useState<'Regular (16oz)' | 'Grande (22oz) (+₱25)'>('Regular (16oz)');
  const [sweetness, setSweetness] = useState<Customization['sweetness']>('50%');
  const [iceLevel, setIceLevel] = useState<Customization['iceLevel']>('Regular Ice');
  const [milkType, setMilkType] = useState<Customization['milkType']>('Whole Milk');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  if (!isOpen || !item) return null;

  // Calculate live item unit price
  let unitPrice = item.price;
  if (size.includes('+₱25')) unitPrice += 25;
  if (milkType.includes('+₱30')) unitPrice += 30;
  if (milkType.includes('+₱20')) unitPrice += 20;
  selectedAddOns.forEach(addon => {
    if (addon.includes('+₱30')) unitPrice += 30;
    else if (addon.includes('+₱25')) unitPrice += 25;
    else if (addon.includes('+₱20')) unitPrice += 20;
  });

  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addonLabel: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addonLabel)
        ? prev.filter(a => a !== addonLabel)
        : [...prev, addonLabel]
    );
  };

  const handleAddToCart = () => {
    const customization: Customization = {
      temperature,
      size,
      sweetness,
      iceLevel: temperature === 'Hot' ? 'No Ice' : iceLevel,
      milkType,
      addOns: selectedAddOns,
      notes: notes.trim(),
    };
    addToCart(item, customization, quantity);
    onClose();
    // reset form
    setQuantity(1);
    setSelectedAddOns([]);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 rounded-3xl bg-[#FAF7F2] shadow-2xl border border-[#E0D5C7] overflow-hidden">
        {/* Top Header with Image & Title */}
        <div className="relative h-56 w-full bg-[#E8DCCF] overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover object-center brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#8C5332] px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2]">
                {item.category}
              </span>
              {item.isBestSeller && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-xs font-semibold text-white">
                  <Flame className="w-3 h-3 text-amber-200" /> Best Seller
                </span>
              )}
            </div>
            <h2 className="mt-1 font-serif-cafe text-2xl font-bold tracking-tight text-white">
              {item.name}
            </h2>
            <p className="mt-0.5 text-xs text-white/85 line-clamp-2">
              {item.description}
            </p>
          </div>
        </div>

        {/* Scrollable Customization Controls */}
        <div className="max-h-[55vh] overflow-y-auto p-6 space-y-6">
          {item.canCustomize !== false ? (
            <>
              {/* 1. Temperature: Hot or Iced */}
              <div>
                <label className="text-xs font-bold tracking-wider uppercase text-[#5D4037]">
                  1. Temperature
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTemperature('Iced')}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all border ${
                      temperature === 'Iced'
                        ? 'bg-[#3D2517] text-white border-[#3D2517] shadow-sm'
                        : 'bg-[#EFE8DF] text-[#4A2E1B] border-[#D8C7B6] hover:bg-[#E5DBCF]'
                    }`}
                  >
                    <span>🧊 Iced</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemperature('Hot')}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all border ${
                      temperature === 'Hot'
                        ? 'bg-[#3D2517] text-white border-[#3D2517] shadow-sm'
                        : 'bg-[#EFE8DF] text-[#4A2E1B] border-[#D8C7B6] hover:bg-[#E5DBCF]'
                    }`}
                  >
                    <span>☕ Hot</span>
                  </button>
                </div>
              </div>

              {/* 2. Cup Size */}
              <div>
                <label className="text-xs font-bold tracking-wider uppercase text-[#5D4037]">
                  2. Cup Size
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSize('Regular (16oz)')}
                    className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-3 border transition-all ${
                      size === 'Regular (16oz)'
                        ? 'bg-[#3D2517] text-white border-[#3D2517]'
                        : 'bg-[#EFE8DF] text-[#4A2E1B] border-[#D8C7B6] hover:bg-[#E5DBCF]'
                    }`}
                  >
                    <span className="text-sm font-semibold">Regular (16oz)</span>
                    <span className="text-xs opacity-75">Base Price</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSize('Grande (22oz) (+₱25)')}
                    className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-3 border transition-all ${
                      size === 'Grande (22oz) (+₱25)'
                        ? 'bg-[#3D2517] text-white border-[#3D2517]'
                        : 'bg-[#EFE8DF] text-[#4A2E1B] border-[#D8C7B6] hover:bg-[#E5DBCF]'
                    }`}
                  >
                    <span className="text-sm font-semibold">Grande (22oz)</span>
                    <span className="text-xs text-[#8C5332] font-semibold">+₱25</span>
                  </button>
                </div>
              </div>

              {/* 3. Sugar / Sweetness Level */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold tracking-wider uppercase text-[#5D4037]">
                    3. Sweetness Level
                  </label>
                  <span className="text-xs font-bold text-[#8C5332]">{sweetness}</span>
                </div>
                <div className="mt-2 grid grid-cols-5 gap-1.5">
                  {SWEETNESS_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSweetness(opt)}
                      className={`rounded-lg py-2 text-xs font-semibold transition-all border ${
                        sweetness === opt
                          ? 'bg-[#8C5332] text-white border-[#8C5332]'
                          : 'bg-[#EFE8DF] text-[#4A2E1B] border-[#D8C7B6] hover:bg-[#E5DBCF]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Ice Level (if iced) */}
              {temperature === 'Iced' && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold tracking-wider uppercase text-[#5D4037]">
                      4. Ice Level
                    </label>
                    <span className="text-xs font-bold text-[#8C5332]">{iceLevel}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {ICE_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setIceLevel(opt)}
                        className={`rounded-lg py-2 text-xs font-semibold transition-all border ${
                          iceLevel === opt
                            ? 'bg-[#8C5332] text-white border-[#8C5332]'
                            : 'bg-[#EFE8DF] text-[#4A2E1B] border-[#D8C7B6] hover:bg-[#E5DBCF]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Milk Selection */}
              <div>
                <label className="text-xs font-bold tracking-wider uppercase text-[#5D4037]">
                  5. Choice of Milk
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {MILK_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setMilkType(opt)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all border text-left ${
                        milkType === opt
                          ? 'bg-[#3D2517] text-white border-[#3D2517]'
                          : 'bg-[#EFE8DF] text-[#4A2E1B] border-[#D8C7B6] hover:bg-[#E5DBCF]'
                      }`}
                    >
                      <span>{opt.split(' (')[0]}</span>
                      {opt.includes('+') && (
                        <span className="text-[11px] opacity-80">
                          +{opt.split('+')[1].replace(')', '')}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Custom Add-ons */}
              <div>
                <label className="text-xs font-bold tracking-wider uppercase text-[#5D4037]">
                  6. Extra Add-ons (Optional)
                </label>
                <div className="mt-2 space-y-2">
                  {AVAILABLE_ADDONS.map(addon => {
                    const isChecked = selectedAddOns.includes(addon.label);
                    return (
                      <button
                        key={addon.label}
                        type="button"
                        onClick={() => toggleAddon(addon.label)}
                        className={`flex w-full items-center justify-between rounded-xl p-3 text-xs font-semibold transition-all border ${
                          isChecked
                            ? 'bg-[#FAF0E6] text-[#3D2517] border-[#8C5332]'
                            : 'bg-[#EFE8DF] text-[#4A2E1B] border-[#D8C7B6] hover:bg-[#E5DBCF]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded border ${
                              isChecked
                                ? 'bg-[#8C5332] border-[#8C5332] text-white'
                                : 'border-[#9E8B7A] bg-white'
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3" />}
                          </div>
                          <span>{addon.label.split(' (+')[0]}</span>
                        </div>
                        <span className="text-[#8C5332] font-bold">+₱{addon.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-[#EFE8DF] p-4 text-center text-xs text-[#5D4037]">
              This baked delicacy is prepared fresh daily and served warm with butter or dipping syrup.
            </div>
          )}

          {/* Special Instructions Note */}
          <div>
            <label className="text-xs font-bold tracking-wider uppercase text-[#5D4037]">
              Special Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please make extra hot, or pack milk separately..."
              className="mt-1.5 w-full rounded-xl border border-[#D8C7B6] bg-white p-3 text-xs text-[#2C1810] placeholder-[#A8988B] focus:border-[#5D4037] focus:outline-none focus:ring-1 focus:ring-[#5D4037]"
            />
          </div>
        </div>

        {/* Footer with Quantity & Add to Cart button */}
        <div className="border-t border-[#E0D5C7] bg-[#EFE8DF] px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center rounded-full bg-white border border-[#D8C7B6] p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 rounded-full flex items-center justify-center text-[#5D4037] hover:bg-[#FAF7F2] transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-9 text-center text-sm font-bold text-[#2C1810]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8 rounded-full flex items-center justify-center text-[#5D4037] hover:bg-[#FAF7F2] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 rounded-full bg-[#3D2517] hover:bg-[#2C1810] active:scale-[0.99] py-3.5 px-6 text-sm font-semibold text-[#FAF7F2] shadow-lg transition-all flex items-center justify-between cursor-pointer"
          >
            <span>Add to Order</span>
            <span className="font-bold text-amber-200">₱{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
