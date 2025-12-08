import { useState } from "react";
import axios from "axios";
import { Upload, ShoppingBag, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function QCommercePage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      
      toast.success("Screenshot uploaded! Ready to analyze.");
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please upload a screenshot first!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API}/qcommerce/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);
      toast.success("Analysis complete! Check your savings below.");
      
      // Add to shaadi fund
      if (response.data.total_savings > 0) {
        await axios.post(`${API}/shaadi-fund/add?amount=${response.data.total_savings}`);
      }
    } catch (error) {
      console.error("Error analyzing screenshot:", error);
      toast.error("Oops! Analysis failed. Please try with a clearer screenshot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12" data-testid="qcommerce-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-secondary rounded-2xl border-2 border-black shadow-brutal mb-4">
            <ShoppingBag className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4" data-testid="qcommerce-title">
            Q-Commerce Wizard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Apna Blinkit/Instamart ka screenshot upload karo, hum batayenge kahan se sasta milega!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <div className="bg-white rounded-xl border-2 border-black shadow-brutal-lg p-6" data-testid="qcommerce-upload-section">
              <h2 className="text-2xl font-heading font-semibold mb-6">Upload Your Receipt</h2>
              
              <label
                htmlFor="file-upload"
                className="block cursor-pointer"
              >
                <div className="border-4 border-dashed border-primary rounded-xl p-12 text-center hover:bg-accent transition-colors">
                  {preview ? (
                    <div className="space-y-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg border-2 border-black"
                      />
                      <p className="text-sm text-muted-foreground font-mono">Screenshot uploaded ✓</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
                      <p className="text-lg font-bold text-foreground mb-2">Drop screenshot here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                  )}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  data-testid="qcommerce-file-input"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              <Button
                onClick={handleAnalyze}
                disabled={!file || loading}
                data-testid="qcommerce-analyze-btn"
                className="w-full mt-6 bg-secondary text-white font-bold py-6 rounded-full shadow-brutal hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider font-mono text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Analyze Prices
                  </>
                )}
              </Button>

              <div className="mt-6 p-4 bg-accent border-2 border-dashed border-secondary rounded-lg">
                <p className="text-xs text-accent-foreground font-mono text-center">
                  💡 Tip: Upload a clear screenshot of your order with visible items and prices
                </p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div>
            {!result && !loading && (
              <div className="bg-accent border-2 border-dashed border-secondary rounded-xl p-12 text-center h-full flex flex-col items-center justify-center" data-testid="qcommerce-empty-state">
                <ShoppingBag className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-heading font-semibold mb-2">Ready to Save Money?</h3>
                <p className="text-muted-foreground">Upload your receipt and we'll find you the best deals!</p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-xl border-2 border-black shadow-brutal-lg p-12 flex flex-col items-center justify-center h-full">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="font-mono text-sm text-muted-foreground">Crunching numbers...</p>
              </div>
            )}

            {result && (
              <div className="space-y-6" data-testid="qcommerce-results">
                {/* Summary Card */}
                <div className="bg-success text-white rounded-xl border-2 border-black shadow-brutal-lg p-6">
                  <div className="text-sm font-mono uppercase tracking-wide mb-2">Potential Savings</div>
                  <div className="text-5xl font-heading font-bold mb-2" data-testid="qcommerce-total-savings">
                    ₹{result.total_savings.toLocaleString('en-IN')}
                  </div>
                  <p className="text-sm opacity-90">{result.recommendation}</p>
                </div>

                {/* Items Comparison */}
                <div className="bg-white rounded-xl border-2 border-black shadow-brutal-lg overflow-hidden">
                  <div className="p-4 bg-accent border-b-2 border-black">
                    <h3 className="font-heading font-semibold text-lg">Price Comparison</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted border-b-2 border-black">
                        <tr>
                          <th className="text-left p-3 font-mono text-xs uppercase">Item</th>
                          <th className="text-right p-3 font-mono text-xs uppercase">Blinkit</th>
                          <th className="text-right p-3 font-mono text-xs uppercase">Instamart</th>
                          <th className="text-right p-3 font-mono text-xs uppercase">Zepto</th>
                          <th className="text-center p-3 font-mono text-xs uppercase">Best</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.items.map((item, index) => (
                          <tr key={index} className="border-b border-border hover:bg-accent/50 transition-colors" data-testid={`qcommerce-item-${index}`}>
                            <td className="p-3">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground font-mono">{item.quantity}</div>
                            </td>
                            <td className="text-right p-3 font-mono">₹{item.blinkit_price}</td>
                            <td className="text-right p-3 font-mono">₹{item.instamart_price}</td>
                            <td className="text-right p-3 font-mono">₹{item.zepto_price}</td>
                            <td className="text-center p-3">
                              <span className="inline-block px-2 py-1 bg-success text-white rounded text-xs font-mono font-bold">
                                {item.best_platform}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-accent border-t-2 border-black">
                        <tr>
                          <td className="p-3 font-bold" colSpan="4">Total Original (Blinkit)</td>
                          <td className="text-right p-3 font-mono font-bold" data-testid="qcommerce-total-original">₹{result.total_blinkit.toLocaleString('en-IN')}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}