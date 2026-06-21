import React from 'react';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import {useForm, UseFormReturn, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {CreateOrderInput, useCreateOrder} from '../../hooks/useOrders';
import {Hammer} from 'lucide-react';
import {UseMutationResult} from '@tanstack/react-query';
import api from '../../lib/api';
import { CurrencyAmount } from '../../lib/Currency'

// ─── Schema ───────────────────────────────────────────────────────────────────

const requestSchema = z.object({
  discordId: z.string().min(2, 'Enter Discord Id'),
  character: z.string().min(2, 'Enter Character'),
  category: z.enum(['Weapon', 'Armor', 'Consumable', 'Poison']),
  baseItem: z.string(),
  enchantment: z.string(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  providingBaseItem: z.boolean(),
  specialRequests: z.string().optional().transform(v => v || null),
});

type RequestFormData = z.infer<typeof requestSchema>;
type Category = RequestFormData['category'];

// ─── Sheet Data Types ─────────────────────────────────────────────────────────

interface SheetDataItem {
  Category: string;
  ItemName: string;
  PriceAmount: number;
  PriceUnit: string;
}

interface SheetDataEnchantment {
  Category: string;
  Name: string;
  Tier: string;
  PriceAmount: number;
  PriceUnit: string;
}

interface SheetDataResponse {
  items: SheetDataItem[];
  enchantments: SheetDataEnchantment[];
}

// ─── Props & State ────────────────────────────────────────────────────────────

interface RequestFormProps {
  navigate: NavigateFunction;
  form: UseFormReturn<RequestFormData>;
  createOrderMutation: UseMutationResult<void, Error, CreateOrderInput>;
  selectedCategory: Category;
  watchedValues: {
    baseItem: string;
    enchantment: string;
    quantity: number;
    providingBaseItem: boolean;
    discordId: string;
    character: string;
  };
}

interface RequestFormState {
  sheetData: SheetDataResponse;
}

// ─── Class Component ──────────────────────────────────────────────────────────

class RequestFormClass extends React.Component<RequestFormProps, RequestFormState> {

  constructor(props: RequestFormProps) {
    super(props);
    this.state = {
      sheetData: { items: [], enchantments: [] },
    };
  }

  async componentDidMount() {
    try {
      const response = await api.get('/sheetdata');
      this.setState({ sheetData: response.data as SheetDataResponse });
    } catch (err) {
      console.error('Failed to load sheet data:', err);
    }
  }

  // When category changes, reset baseItem and enchantment so stale
  // values from the previous category don't silently persist
  componentDidUpdate(prevProps: RequestFormProps) {
    if (prevProps.selectedCategory !== this.props.selectedCategory) {
      this.props.form.setValue('baseItem', '');
      this.props.form.setValue('enchantment', '');
    }
  }

  private handleSubmit = (data: RequestFormData) => {
    const { navigate, createOrderMutation } = this.props;
    createOrderMutation.mutate(data as unknown as CreateOrderInput, {
      onSuccess: () => {},
    });
  };

  getCurrency(value:number, unit:string): CurrencyAmount {
    switch (unit) {
      case 'cp':
        return CurrencyAmount.fromVector([value, 0, 0, 0, 0]);
      case 'sp':
        return CurrencyAmount.fromVector([0, value, 0, 0, 0]);
      case 'ep':
        return CurrencyAmount.fromVector([0, 0, value, 0, 0]);
      case 'gp':
        return CurrencyAmount.fromVector([0, 0, 0, value, 0]);
      case 'pp':
        return CurrencyAmount.fromVector([0, 0, 0, 0, value]);

      default:
        return CurrencyAmount.fromCp(0);
    }
  }

  render() {
    const { form, createOrderMutation, selectedCategory } = this.props;
    const { register, handleSubmit, formState: { errors } } = form;
    const { items, enchantments } = this.state.sheetData;

    const selectableItems = items.filter(item => item.Category === selectedCategory);
    const selectableEnchantments = enchantments.filter(e => e.Category === selectedCategory);

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Form */}
          <div
              className="bg-card text-card-foreground p-8 md:p-12 border-2 border-border shadow-[4px_6px_20px_rgba(58,35,12,0.25)] relative"
              style={{ borderRadius: '4px 6px 3px 7px' }}
          >
            <div className="absolute inset-1 border border-dashed border-border/40 pointer-events-none rounded-sm" />

            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex p-3 rounded-full bg-primary/5 border border-primary/25 mb-4">
                <Hammer className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-widest text-[#1a0f00]">
                COMMISSION A NEW CRAFT
              </h1>
              <p className="text-sm italic text-muted-foreground mt-2">
                "Inscribe thy requirements onto this contract. The Guild Artisans shall review and forge it."
              </p>
            </div>

            <form onSubmit={handleSubmit(this.handleSubmit)} className="space-y-8">

              {/* Discord ID & Character */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 flex flex-col">
                  <label className="font-heading text-xs tracking-widest text-[#1a0f00] mb-2 uppercase">
                    Discord Id
                  </label>
                  <input
                      type="text"
                      placeholder="e.g. DragonSlayer@1234"
                      {...register('discordId')}
                      className="bg-transparent text-foreground border-b-2 border-border py-2 px-1 focus:outline-none focus:border-accent font-body text-md placeholder-muted-foreground/60 transition-colors"
                  />
                  {errors.discordId && (
                      <span className="text-xs text-primary mt-1 italic">{errors.discordId.message}</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="font-heading text-xs tracking-widest text-[#1a0f00] mb-2 uppercase">
                    Character
                  </label>
                  <input
                      type="text"
                      placeholder="e.g. Astora"
                      {...register('character')}
                      className="bg-transparent text-foreground border-b-2 border-border py-2 px-1 focus:outline-none focus:border-accent font-body text-md placeholder-muted-foreground/60 transition-colors"
                  />
                  {errors.character && (
                      <span className="text-xs text-primary mt-1 italic">{errors.character.message}</span>
                  )}
                </div>
              </div>

              {/* Category & Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 flex flex-col">
                  <label className="font-heading text-xs tracking-widest text-[#1a0f00] mb-2 uppercase">
                    Category
                  </label>
                  <select
                      {...register('category')}
                      className="bg-transparent text-foreground border-b-2 border-border py-2 px-1 focus:outline-none focus:border-accent font-body text-md cursor-pointer transition-colors"
                  >
                    <option value="Weapon">Weapon (Swords, Axes, Bows)</option>
                    <option value="Armor">Armour (Shields, Plates, Leather)</option>
                    <option value="Consumable">Consumable (Flame on Balm, Singer's Ale, Raptor Jerky)</option>
                    <option value="Poison">Poison (Basic Poison, Assassin's Blood, Truth Serum)</option>
                  </select>
                  {errors.category && (
                      <span className="text-xs text-primary mt-1 italic">{errors.category.message}</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="font-heading text-xs tracking-widest text-[#1a0f00] mb-2 uppercase">
                    Quantity
                  </label>
                  <input
                      type="number"
                      min="1"
                      {...register('quantity')}
                      className="bg-transparent text-foreground border-b-2 border-border py-2 px-1 focus:outline-none focus:border-accent font-body text-md transition-colors"
                  />
                  {errors.quantity && (
                      <span className="text-xs text-primary mt-1 italic">{errors.quantity.message}</span>
                  )}
                </div>
              </div>

              {/* Base Item & Enchantment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 flex flex-col">
                  <label className="font-heading text-xs tracking-widest text-[#1a0f00] mb-2 uppercase">
                    Base Item
                  </label>
                  <select
                      {...register('baseItem')}
                      className="bg-transparent text-foreground border-b-2 border-border py-2 px-1 focus:outline-none focus:border-accent font-body text-md cursor-pointer transition-colors"
                  >
                    <option value="">— Select an item —</option>
                    {selectableItems.map(item => (
                        <option key={item.ItemName} value={item.ItemName}>
                          {item.ItemName} ({item.PriceAmount} {item.PriceUnit})
                        </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="font-heading text-xs tracking-widest text-[#1a0f00] mb-2 uppercase">
                    Enchantment
                  </label>
                  <select
                      {...register('enchantment')}
                      className="bg-transparent text-foreground border-b-2 border-border py-2 px-1 focus:outline-none focus:border-accent font-body text-md cursor-pointer transition-colors"
                  >
                    <option value="">-</option>
                    {selectableEnchantments.map(enchantment => (
                        <option key={enchantment.Name} value={enchantment.Name}>
                          {enchantment.Name} — T{enchantment.Tier} ({enchantment.PriceAmount} {enchantment.PriceUnit})
                        </option>
                    ))}
                  </select>
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <input
                      type="checkbox"
                      {...register('providingBaseItem')}
                      className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <label className="font-heading text-xs tracking-widest text-[#1a0f00] uppercase">
                    Providing Base Item
                  </label>
                </div>
              </div>

              {/* Special Requests */}
              <div className="flex flex-col">
                <label className="font-heading text-xs tracking-widest text-[#1a0f00] mb-2 uppercase">
                  Special Requests (Optional)
                </label>
                <textarea
                    rows={3}
                    placeholder="e.g. Infuse with fire resistance if possible, deliver before winter solstice..."
                    {...register('specialRequests')}
                    className="bg-transparent text-foreground border-b-2 border-border py-2 px-1 focus:outline-none focus:border-accent font-body text-md placeholder-muted-foreground/60 transition-colors resize-none"
                />
                {errors.specialRequests && (
                    <span className="text-xs text-primary mt-1 italic">{errors.specialRequests.message}</span>
                )}
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                    type="submit"
                    disabled={createOrderMutation.isPending}
                    className="w-full py-3 bg-primary text-primary-foreground font-heading tracking-widest text-sm rounded-sm hover:scale-[1.01] hover:bg-primary/95 transition-all shadow-[2px_4px_8px_rgba(58,35,12,0.3)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-none"
                    style={{ textShadow: '0 1px 0 rgba(0,0,0,0.4)' }}
                >
                  {createOrderMutation.isPending ? 'STAMPING CONTRACT...' : 'SEAL & SUBMIT COMMISSION'}
                </button>
              </div>

            </form>
          </div>

          {/* Estimate Card */}
          <div
              className="bg-card text-card-foreground p-8 md:p-12 border-2 border-border shadow-[4px_6px_20px_rgba(58,35,12,0.25)] relative"
              style={{ borderRadius: '4px 6px 3px 7px' }}
          >
            <div className="absolute inset-1 border border-dashed border-border/40 pointer-events-none rounded-sm" />

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-primary/5 border border-primary/25 mb-3">
                <Hammer className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold tracking-widest text-[#1a0f00]">
                FORGE ESTIMATE
              </h2>
              <p className="text-xs italic text-muted-foreground mt-1">Official Bill of Sale</p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-accent text-xs">✦</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Line Items */}
            {(() => {
              const { baseItem, enchantment, quantity, providingBaseItem, discordId, character } = this.props.watchedValues;
              const { items, enchantments } = this.state.sheetData;

              const foundItem = items.find(i => i.ItemName === baseItem);
              const foundEnchantment = enchantments.find(e => e.Name === enchantment);

              const baseUnitCost = providingBaseItem ? 0 : (foundItem?.PriceAmount ?? 0);
              const enchantCost = foundEnchantment?.PriceAmount ?? 0;
              const baseItemPriceUnit = foundItem?.PriceUnit ?? 'gp';
              const enchantpriceUnit = foundEnchantment?.PriceUnit ?? 'gp';

              const baseItemPrice:CurrencyAmount = this.getCurrency(baseUnitCost, baseItemPriceUnit);
              const enchantmentPrice:CurrencyAmount = this.getCurrency(enchantCost, enchantpriceUnit);

              let totalCost:CurrencyAmount = baseItemPrice.add(enchantmentPrice).multiply(quantity);
              totalCost = totalCost.normalize();

              const rows: [string, string][] = [
                ['Client Name',        character     || 'Unknown Hero'],
                ['Guild Raven (Discord)', discordId  || 'None'],
                ['Category',           selectedCategory?.toUpperCase() ?? '—'],
                ['Chosen Material',    baseItem      || '—'],
                ['Enchantment',        foundEnchantment
                    ? `${foundEnchantment.Name} (Tier ${foundEnchantment.Tier})`
                    : 'None'],
                ['Quantity Ordered',   `${quantity || 1}x`],
                ['Supplying Materials', providingBaseItem ? 'Yes (Deducted)' : 'No'],
              ];

              return (
                  <>
                    <div className="space-y-3 mb-6">
                      {rows.map(([label, value]) => (
                          <div key={label} className="flex justify-between items-baseline gap-4">
                            <span className="font-body text-sm text-muted-foreground whitespace-nowrap">{label}:</span>
                            <span className="font-body text-sm text-foreground font-semibold text-right">{value}</span>
                          </div>
                      ))}
                    </div>

                    {/* Mid Divider */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-accent text-xs">✦</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between items-baseline">
            <span className="font-heading text-xs tracking-widest text-[#1a0f00] uppercase">
              Base Item Unit Cost:
            </span>
                        <span className="font-body text-sm text-foreground">
              {baseUnitCost * (quantity || 1)} {baseItemPriceUnit}
            </span>
                      </div>
                      <div className="flex justify-between items-baseline">
            <span className="font-heading text-xs tracking-widest text-[#1a0f00] uppercase">
              Enchantment Cost:
            </span>
                        <span className="font-body text-sm text-foreground">
              {enchantCost} {enchantpriceUnit}
            </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-2 border-border rounded-sm px-4 py-3 flex justify-between items-center bg-secondary/30">
          <span className="font-heading text-sm tracking-widest text-primary uppercase">
            Total Est. Cost
          </span>
                      <span className="font-heading text-xl text-primary font-bold">
            {totalCost.toString().toUpperCase()}
          </span>
                    </div>

                    {/* Footer note */}
                    <p className="text-xs italic text-muted-foreground text-center mt-4">
                      * All items are handmade. Delivery speeds depend on stoking of fire.
                    </p>
                  </>
              );
            })()}
          </div>
        </div>
    );
  }
}

// ─── HOC Wrapper ──────────────────────────────────────────────────────────────
// useWatch subscribes to category changes and passes the current value down
// as a prop, which triggers componentDidUpdate in the class component.

const RequestForm: React.FC = () => {
  const navigate = useNavigate();
  const createOrderMutation = useCreateOrder();
  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      discordId: '',
      character: '',
      category: 'Weapon',
      baseItem: '',
      enchantment: '',
      quantity: 1,
      providingBaseItem: false,
      specialRequests: '',
    },
  });

  // useWatch re-renders the wrapper whenever category changes,
  // passing the fresh value down to the class as a prop
  const [selectedCategory, baseItem, enchantment, quantity, providingBaseItem, discordId, character] = useWatch({
    control: form.control,
    name: ['category', 'baseItem', 'enchantment', 'quantity', 'providingBaseItem', 'discordId', 'character'],
  });

  return (
      <RequestFormClass
          navigate={navigate}
          form={form}
          createOrderMutation={createOrderMutation}
          selectedCategory={selectedCategory}
          watchedValues={{ baseItem, enchantment, quantity, providingBaseItem, discordId, character }}
      />
  );
};

export default RequestForm;