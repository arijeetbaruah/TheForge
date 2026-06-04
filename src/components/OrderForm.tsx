import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";
import type { SheetItem, SheetEnchantment } from "../types";
import { Scroll, Swords, ShieldAlert, Check } from "lucide-react";

class Currency {
  PriceAmount: number;
  PriceUnit: string;

  constructor(priceAmount: number, priceUnit: string) {
    this.PriceAmount = priceAmount;
    this.PriceUnit = priceUnit;

    this.convertAllToGP();
  }

  convertAllToGP(){
    switch(this.PriceUnit){
      case "pp":
        this.PriceAmount *= 10;
        break;
      case "ep":
        this.PriceAmount /= 2;
        break;
      case "sp":
        this.PriceAmount /= 10;
        break;
      case "cp":
        this.PriceAmount /= 100;
        break;
    }

    this.PriceUnit = "gp";
  }

  Add(amount: Currency): Currency{
    const newVal = this.PriceAmount + amount.PriceAmount;
    return new Currency(newVal, "gp");
  }

  multiply(amount: number):Currency {
    return new Currency(this.PriceAmount * amount, this.PriceUnit);
  }

  toString(): string{
    // 1. Convert everything to total copper first
    const cpRates: Record<string, number> = {
      "pp": 1000,
      "gp": 100,
      "ep": 50,
      "sp": 10,
      "cp": 1
    };

    let totalCopper = Math.round(this.PriceAmount * cpRates[this.PriceUnit]);

    // 2. Extract whole Gold Pieces (1 gp = 100 cp)
    const gp = Math.floor(totalCopper / 100);
    totalCopper %= 100; // Remainder is 50 cp

    // 3. Extract whole Silver Pieces (1 sp = 10 cp)
    const sp = Math.floor(totalCopper / 10); // 50 / 10 = 5 sp
    totalCopper %= 10; // Remainder is 0 cp

    // 4. Whatever is left is Copper
    const cp = totalCopper;

    // 5. Format output dynamically based on what has value
    const result: string[] = [];
    if (gp > 0) result.push(`${gp} gp`);
    if (sp > 0) result.push(`${sp} sp`);
    if (cp > 0) result.push(`${cp} cp`);

    return result.length > 0 ? result.join(", ") : "0 gp";
  }
}

const OrderForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [category, setCategory] = useState<string>("Weapon");
  const [baseItemName, setBaseItemName] = useState<string>("");
  const [enchantmentName, setEnchantmentName] = useState<string>("");
  const [character, setCharacter] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");
  const [providingBase, setProvidingBase] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  // Sheet data states
  const [items, setItems] = useState<SheetItem[]>([]);
  const [enchantments, setEnchantments] = useState<SheetEnchantment[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Submit states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdTaskId, setCreatedTaskId] = useState<string>("");

  // Sync Discord ID from authenticated user
  useEffect(() => {
    if (user) {
      setDiscordId(user.discordId || "");
    }
  }, [user]);

  // Fetch sheet data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      setFetchError(null);
      try {
        const res = await fetch("https://the-forge-mu-seven.vercel.app/api/sheet-data");
        if (!res.ok) {
          throw new Error("The scroll of materials could not be fetched.");
        }
        const data = await res.json();
        setItems(data.items || []);
        setEnchantments(data.enchantments || []);
      } catch (err: any) {
        console.error(err);
        setFetchError("Failed to fetch blacksmith resources. Defaulting to empty catalog.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Cascading lists derived from category
  const filteredItems = items.filter(
    (item) => item.Category.toLowerCase() === category.toLowerCase()
  );
  const filteredEnchantments = enchantments.filter(
    (ench) => ench.Category.toLowerCase() === category.toLowerCase()
  );

  // Auto-select first items on category change
  useEffect(() => {
    if (filteredItems.length > 0) {
      setBaseItemName(filteredItems[0].ItemName);
    } else {
      setBaseItemName("");
    }

    if (filteredEnchantments.length > 0) {
      setEnchantmentName(filteredEnchantments[0].Name);
    } else {
      setEnchantmentName("");
    }
  }, [category, items, enchantments]);

  // Find selected item metadata for pricing preview
  const selectedItem = filteredItems.find((i) => i.ItemName === baseItemName);
  const selectedEnchantment = filteredEnchantments.find((e) => e.Name === enchantmentName);

  // Calculate price

  const basePrice:Currency = new Currency(selectedItem ? selectedItem.PriceAmount : 0, selectedItem ? selectedItem.PriceUnit : "gp")
  const enchantmentPrice:Currency = new Currency(selectedEnchantment ? selectedEnchantment.PriceAmount : 0, selectedEnchantment ? selectedEnchantment.PriceUnit : "gp")

  const totalPrice:Currency =
      (providingBase ? new Currency(0, "gp") : basePrice)
          .Add(enchantmentPrice)
          .multiply(quantity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const token = await auth.currentUser?.getIdToken();
      const payload = {
        discordId,
        character,
        category,
        baseItem: baseItemName,
        enchantment: enchantmentName || "None",
        providingBase,
        quantity: quantity.toString(),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "The guild masters rejected the order sheet.");
      }

      const responseData = await res.json();
      setCreatedTaskId(responseData.taskId);
      setSubmitSuccess(true);

      // Reset form variables (except Discord ID)
      setCharacter("");
      setQuantity(1);
      setProvidingBase(false);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Failed to submit commission.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-md py-4">
      <div className="row g-4">
        {/* Left Side: Order Form */}
        <div className="col-lg-7">
          <div className="parchment-scroll">
            <div className="d-flex align-items-center gap-3 mb-4">
              <Scroll className="text-primary" size={36} />
              <h1 className="h2 font-medieval mb-0">Commission Request</h1>
            </div>

            {submitSuccess && (
              <div className="alert alert-success border-success mb-4" role="alert">
                <div className="d-flex align-items-center gap-2">
                  <Check size={20} />
                  <strong>Order Lodged Successfully!</strong>
                </div>
                <p className="small mb-0 mt-2">
                  Thy order is registered with Task ID: <code className="fw-bold">{createdTaskId}</code>. 
                  View details in your <Link to="/orders" className="alert-link text-decoration-underline">Order History</Link>.
                </p>
              </div>
            )}

            {submitError && (
              <div className="alert alert-danger border-danger mb-4" role="alert">
                <div className="d-flex align-items-center gap-2">
                  <ShieldAlert size={20} />
                  <strong>Forge Error:</strong>
                </div>
                <p className="small mb-0 mt-1">{submitError}</p>
              </div>
            )}

            {fetchError && (
              <div className="alert alert-warning border-warning mb-4" role="alert">
                <p className="small mb-0">{fetchError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Category */}
              <div className="mb-3">
                <label className="form-label" htmlFor="category">Category</label>
                <select
                  id="category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Weapon">⚔ Weapon</option>
                  <option value="Armor">🛡 Armor</option>
                  <option value="Poison">🧪 Poison</option>
                  <option value="Consumable">🍺 Consumable</option>
                </select>
              </div>

              {/* Base Item */}
              <div className="mb-3">
                <label className="form-label" htmlFor="baseItem">Base Item</label>
                <select
                  id="baseItem"
                  className="form-select"
                  value={baseItemName}
                  onChange={(e) => setBaseItemName(e.target.value)}
                  disabled={loadingData || filteredItems.length === 0}
                >
                  {loadingData ? (
                    <option>Fetching from the forge...</option>
                  ) : filteredItems.length === 0 ? (
                    <option>No items available for this category</option>
                  ) : (
                    filteredItems.map((item) => (
                      <option key={item.ItemName} value={item.ItemName}>
                        {item.ItemName} ({item.PriceAmount} {item.PriceUnit})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Enchantment */}
              <div className="mb-3">
                <label className="form-label" htmlFor="enchantment">Enchantment (Optional)</label>
                <select
                  id="enchantment"
                  className="form-select"
                  value={enchantmentName}
                  onChange={(e) => setEnchantmentName(e.target.value)}
                  disabled={loadingData || filteredEnchantments.length === 0}
                >
                  {loadingData ? (
                    <option>Fetching from the forge...</option>
                  ) : filteredEnchantments.length === 0 ? (
                    <option value="">None (Mundane)</option>
                  ) : (
                    <>
                      <option value="">None (Mundane)</option>
                      {filteredEnchantments.map((ench) => (
                        <option key={ench.Name} value={ench.Name}>
                          {ench.Name} (Tier {ench.Tier})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Character Name */}
              <div className="mb-3">
                <label className="form-label" htmlFor="character">Character Name</label>
                <input
                  type="text"
                  id="character"
                  className="form-control"
                  placeholder="e.g. Aldric the Bold"
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                  required
                />
              </div>

              {/* Discord ID */}
              <div className="mb-3">
                <label className="form-label" htmlFor="discordId">Discord ID (for updates)</label>
                <input
                  type="text"
                  id="discordId"
                  className="form-control"
                  placeholder="e.g. user#1234 or nickname"
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                  required
                />
              </div>

              {/* Quantity */}
              <div className="row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label" htmlFor="quantity">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    className="form-control"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                  />
                </div>

                {/* Providing Base Item */}
                <div className="col-md-6 d-flex align-items-end pb-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="providingBase"
                      checked={providingBase}
                      onChange={(e) => setProvidingBase(e.target.checked)}
                    />
                    <label className="form-check-label text-ink font-monospace small" htmlFor="providingBase">
                      Providing Base Item
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-4">
                {user ? (
                  <button
                    type="submit"
                    className="btn btn-wax-seal w-100"
                    disabled={submitting}
                  >
                    {submitting ? "Writing in Ledger..." : "Commission Item"}
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-iron w-100 text-center text-decoration-none">
                    🔑 Enter Tavern to Lodge Commission
                  </Link>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Invoice Receipt Live Preview */}
        <div className="col-lg-5">
          <div className="parchment-scroll h-100 d-flex flex-column justify-content-between text-ink border-primary">
            <div>
              <div className="text-center mb-4">
                <Swords className="text-primary mb-2" size={32} />
                <h3 className="font-medieval text-uppercase">Forge Estimate</h3>
                <div className="small text-muted font-monospace">Official Bill of Sale</div>
                <div className="medieval-divider my-2"><span className="divider-symbol">⚜</span></div>
              </div>

              <div className="font-monospace small">
                <div className="d-flex justify-content-between mb-2">
                  <span>Client Name:</span>
                  <span className="fw-bold">{character || "Unknown Hero"}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Guild Raven (Discord):</span>
                  <span>{discordId || "None"}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Category:</span>
                  <span className="text-uppercase fw-bold">{category}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Chosen Material:</span>
                  <span>{baseItemName || "None Selection"}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Enchantment:</span>
                  <span>
                    {selectedEnchantment ? `${selectedEnchantment.Name} (Tier ${selectedEnchantment.Tier})` : "Mundane (None)"}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Quantity Ordered:</span>
                  <span>{quantity}x</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Supplying Materials:</span>
                  <span>{providingBase ? "Yes (Deducted)" : "No"}</span>
                </div>
              </div>

              <div className="medieval-divider"><span className="divider-symbol">⚒</span></div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="font-medieval h5 mb-0">Base Item Unit Cost:</span>
                <span className="font-monospace fw-bold">
                  {providingBase ? "0 gp" : basePrice.toString()}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="font-medieval h5 mb-0">Enchantment Cost:</span>
                <span className="font-monospace fw-bold">
                  {enchantmentPrice.toString()}
                </span>
              </div>
            </div>

            <div>
              <div className="card p-3 border-secondary mb-3 bg-opacity-10 bg-dark">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="font-medieval h4 mb-0 text-primary">Total Est. Cost</span>
                  <span className="font-medieval h3 mb-0 text-danger fw-bold">
                    {totalPrice.toString()}
                  </span>
                </div>
              </div>
              
              <div className="text-center text-muted font-monospace small">
                * All items are handmade. Delivery speeds depend on stoking of fire.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
