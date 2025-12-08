import { useState } from "react";
import axios from "axios";
import { CreditCard, TrendingUp, IndianRupee, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CCHelperPage() {
  const [profile, setProfile] = useState({
    grocery: 0,
    dining: 0,
    travel: 0,
    shopping: 0,
    utilities: 0,
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/cc-helper/recommend`, profile);
      setRecommendations(response.data);
      
      if (response.data.length === 0) {
        toast.info("Increase your spending amounts to get better recommendations!");
      } else {
        toast.success(`Found ${response.data.length} matching credit cards!`);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Oops! Couldn't fetch recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const spendingCategories = [
    { key: "grocery", label: "Grocery", icon: "🛒", placeholder: "5000" },
    { key: "dining", label: "Dining", icon: "🍽️", placeholder: "3000" },
    { key: "travel", label: "Travel", icon: "✈️", placeholder: "8000" },
    { key: "shopping", label: "Shopping", icon: "🛍️", placeholder: "10000" },
    { key: "utilities", label: "Utilities", icon: "💡", placeholder: "2000" },
  ];

  return (
    <div className="min-h-screen py-12" data-testid="cc-helper-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-primary rounded-2xl border-2 border-black shadow-brutal mb-4">
            <CreditCard className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4" data-testid="cc-helper-title">
            Credit Card Helper
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Apna monthly kharcha batao, hum best cashback card dhundh denge! Smart spending starts with the right card.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border-2 border-black shadow-brutal-lg p-6 sticky top-24" data-testid="cc-helper-form">
              <h2 className="text-2xl font-heading font-semibold mb-6">Your Monthly Spending</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {spendingCategories.map((category) => (
                  <div key={category.key}>
                    <Label htmlFor={category.key} className="font-mono text-sm uppercase tracking-wide mb-2 block">
                      {category.icon} {category.label}
                    </Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id={category.key}
                        type="number"
                        min="0"
                        placeholder={category.placeholder}
                        data-testid={`cc-helper-input-${category.key}`}
                        value={profile[category.key] || ""}
                        onChange={(e) => setProfile({ ...profile, [category.key]: parseInt(e.target.value) || 0 })}
                        className="pl-10 h-12 border-2 border-black font-mono"
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-4">
                  <div className="bg-accent border-2 border-dashed border-secondary rounded-lg p-4 mb-4">
                    <div className="text-sm font-mono text-accent-foreground">
                      <span className="font-bold">Total Monthly Spend:</span> ₹
                      {Object.values(profile).reduce((a, b) => a + b, 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    data-testid="cc-helper-submit-btn"
                    className="w-full bg-primary text-white font-bold py-6 rounded-full shadow-brutal hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider font-mono text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Finding Best Cards...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Find My Cards
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {recommendations.length === 0 && !loading && (
              <div className="bg-accent border-2 border-dashed border-secondary rounded-xl p-12 text-center" data-testid="cc-helper-empty-state">
                <Award className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-heading font-semibold mb-2">Waiting for Your Input!</h3>
                <p className="text-muted-foreground">Fill in your monthly spending to get personalized credit card recommendations.</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
            )}

            <div className="space-y-4" data-testid="cc-helper-results">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.card.id}
                  data-testid={`cc-card-result-${index}`}
                  className="bg-white rounded-xl border-2 border-black shadow-brutal-lg p-6 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-heading font-bold text-primary">#{index + 1}</span>
                        <div>
                          <h3 className="text-2xl font-heading font-semibold">{rec.card.name}</h3>
                          <p className="text-sm text-muted-foreground font-mono">{rec.card.bank}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-4 py-2 bg-success text-white rounded-full font-mono text-sm font-bold border-2 border-black">
                        {rec.match_score}% Match
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-accent rounded-lg p-3 border border-secondary">
                      <div className="text-xs font-mono text-muted-foreground uppercase mb-1">Cashback/Rewards</div>
                      <div className="font-bold text-foreground">{rec.card.cashback_rate}</div>
                    </div>
                    <div className="bg-accent rounded-lg p-3 border border-secondary">
                      <div className="text-xs font-mono text-muted-foreground uppercase mb-1">Annual Fee</div>
                      <div className="font-bold text-foreground">{rec.card.annual_fee}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs font-mono text-muted-foreground uppercase mb-2">Best For:</div>
                    <div className="flex flex-wrap gap-2">
                      {rec.card.best_for.map((category) => (
                        <span key={category} className="px-3 py-1 bg-white border-2 border-black rounded-full text-xs font-mono font-bold uppercase">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs font-mono text-muted-foreground uppercase mb-2">Features:</div>
                    <ul className="space-y-1">
                      {rec.card.features.map((feature, i) => (
                        <li key={i} className="text-sm flex items-start">
                          <span className="text-success mr-2">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t-2 border-dashed border-border pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-mono text-muted-foreground uppercase">Why This Card?</div>
                        <div className="text-sm text-foreground">{rec.reason}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono text-muted-foreground uppercase">Estimated Savings/Year</div>
                        <div className="text-2xl font-heading font-bold text-success">₹{rec.estimated_savings.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}