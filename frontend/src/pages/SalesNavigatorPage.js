import { useEffect, useState } from "react";
import axios from "axios";
import { TrendingUp, Calendar, Package, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SalesNavigatorPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async (platform = null) => {
    setLoading(true);
    try {
      const url = platform ? `${API}/sales/predictions?platform=${platform}` : `${API}/sales/predictions`;
      const response = await axios.get(url);
      setSales(response.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast.error("Couldn't fetch sales predictions");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (platform) => {
    setFilter(platform);
    fetchSales(platform === "All" ? null : platform);
  };

  const platforms = ["All", "Amazon", "Flipkart", "Myntra", "Ajio"];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysUntil = (dateStr) => {
    const today = new Date();
    const saleDate = new Date(dateStr);
    const diffTime = saleDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen py-12" data-testid="sales-navigator-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-success rounded-2xl border-2 border-black shadow-brutal mb-4">
            <TrendingUp className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4" data-testid="sales-navigator-title">
            Sales Navigator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sahi waqt pe sahi deal! Never miss a sale with AI-powered predictions.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <Filter className="w-6 h-6 text-muted-foreground" />
          {platforms.map((platform) => (
            <Button
              key={platform}
              data-testid={`sales-filter-${platform.toLowerCase()}`}
              onClick={() => handleFilter(platform)}
              className={`font-mono font-bold uppercase tracking-wider text-sm px-6 py-2 rounded-full border-2 border-black transition-all ${
                filter === platform
                  ? "bg-primary text-white shadow-brutal"
                  : "bg-white text-foreground hover:shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px]"
              }`}
            >
              {platform}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        )}

        {/* Sales Timeline */}
        {!loading && sales.length > 0 && (
          <div className="relative" data-testid="sales-timeline">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-border transform -translate-x-1/2 hidden md:block"></div>

            <div className="space-y-8">
              {sales.map((sale, index) => {
                const daysUntil = getDaysUntil(sale.start_date);
                const isUpcoming = daysUntil >= 0;
                const isImminent = daysUntil >= 0 && daysUntil <= 7;

                return (
                  <div
                    key={sale.id}
                    data-testid={`sales-event-${index}`}
                    className={`relative flex flex-col ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    } items-center gap-8`}
                  >
                    {/* Timeline dot */}
                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 border-background z-10"
                         style={{ backgroundColor: isImminent ? "#16A34A" : "#D93025" }}>
                    </div>

                    {/* Sale Card */}
                    <div className={`w-full md:w-5/12 ${
                      index % 2 === 0 ? "md:text-right" : "md:text-left"
                    }`}>
                      <div className="bg-white rounded-xl border-2 border-black shadow-brutal-lg p-6 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                        {/* Platform badge */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`inline-block px-4 py-2 rounded-full font-mono text-xs font-bold uppercase border-2 border-black ${
                            sale.platform === "Amazon" ? "bg-secondary text-white" :
                            sale.platform === "Flipkart" ? "bg-primary text-white" :
                            "bg-success text-white"
                          }`}>
                            {sale.platform}
                          </span>
                          {isUpcoming && (
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold ${
                              isImminent ? "bg-success text-white" : "bg-accent text-accent-foreground"
                            }`}>
                              {daysUntil === 0 ? "TODAY!" : `${daysUntil} days`}
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl font-heading font-bold mb-2">{sale.event_name}</h3>
                        
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                          <Calendar className="w-4 h-4" />
                          <span className="font-mono text-sm">
                            {formatDate(sale.start_date)} - {formatDate(sale.end_date)}
                          </span>
                        </div>

                        <div className="mb-4">
                          <div className="inline-block px-4 py-2 bg-success text-white rounded-lg font-heading font-bold text-lg border-2 border-black">
                            {sale.expected_discount} OFF
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-xs font-mono text-muted-foreground uppercase mb-2">Categories:</div>
                          <div className="flex flex-wrap gap-2">
                            {sale.categories.map((category) => (
                              <span key={category} className="px-3 py-1 bg-accent border border-secondary rounded-full text-xs font-mono font-bold">
                                <Package className="inline w-3 h-3 mr-1" />
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t-2 border-dashed border-border">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-mono">Confidence</span>
                            <span className="font-bold text-success">{sale.confidence}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && sales.length === 0 && (
          <div className="bg-accent border-2 border-dashed border-secondary rounded-xl p-12 text-center" data-testid="sales-empty-state">
            <TrendingUp className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h3 className="text-2xl font-heading font-semibold mb-2">No Sales Found</h3>
            <p className="text-muted-foreground">Try selecting a different platform filter</p>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-12 bg-white rounded-xl border-2 border-black shadow-brutal-lg p-6">
          <h3 className="text-xl font-heading font-semibold mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="font-bold mb-2">🧠 AI-Powered Predictions</div>
              <p className="text-muted-foreground">Our algorithm analyzes historical sale patterns to predict upcoming discounts</p>
            </div>
            <div>
              <div className="font-bold mb-2">📅 Plan Ahead</div>
              <p className="text-muted-foreground">Save money by waiting for the right sale instead of impulse buying</p>
            </div>
            <div>
              <div className="font-bold mb-2">🎯 High Confidence</div>
              <p className="text-muted-foreground">We show confidence scores so you know which predictions are most reliable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}