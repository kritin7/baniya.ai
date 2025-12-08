import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { CreditCard, ShoppingBag, TrendingUp, Heart, ArrowRight, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HomePage() {
  const [shaadiFund, setShaadiFund] = useState({ total_saved: 0, transactions: 0 });

  useEffect(() => {
    fetchShaadiFund();
  }, []);

  const fetchShaadiFund = async () => {
    try {
      const response = await axios.get(`${API}/shaadi-fund`);
      setShaadiFund(response.data);
    } catch (e) {
      console.error("Error fetching shaadi fund:", e);
    }
  };

  const features = [
    {
      title: "CC Helper",
      subtitle: "Paisa bachao, points kamaao",
      description: "Find the best credit card that maximizes your cashback and rewards. Because every rupee saved is a rupee earned!",
      icon: CreditCard,
      color: "bg-primary",
      link: "/cc-helper",
      testId: "home-cc-helper-card"
    },
    {
      title: "Q-Commerce Wizard",
      subtitle: "Sabse sasta kahan hai?",
      description: "Upload your Blinkit receipt and discover which platform offers the best prices. Smart shopping starts here!",
      icon: ShoppingBag,
      color: "bg-secondary",
      link: "/qcommerce",
      testId: "home-qcommerce-card"
    },
    {
      title: "Sales Navigator",
      subtitle: "Sahi time pe sahi deal",
      description: "Never miss a sale again! Get predicted sale dates for Amazon, Flipkart, and more based on historical patterns.",
      icon: TrendingUp,
      color: "bg-success",
      link: "/sales-navigator",
      testId: "home-sales-navigator-card"
    },
  ];

  const fundGoal = 500000;
  const fundProgress = (shaadiFund.total_saved / fundGoal) * 100;

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-accent via-background to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6 px-4 py-2 bg-white border-2 border-black rounded-full shadow-brutal-sm">
              <span className="font-mono text-sm font-bold uppercase tracking-wider text-primary">Discount Made Easy</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-foreground mb-6" data-testid="home-hero-title">
              Save Like a{" "}
              <span className="text-primary relative inline-block">
                Baniya
                <Sparkles className="absolute -top-6 -right-8 w-8 h-8 text-secondary" />
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              The ultimate toolkit for discount hunters. Compare prices, find the best credit cards, and never miss a sale. 
              <span className="font-bold text-foreground"> Every rupee saved goes to your Shaadi Fund!</span>
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/cc-helper"
                data-testid="home-hero-cta-cc"
                className="bg-primary text-white font-bold px-8 py-3 rounded-full shadow-brutal hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider font-mono text-sm sm:text-base"
              >
                Shubh Aarambh
                <ArrowRight className="inline ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/qcommerce"
                data-testid="home-hero-cta-qcommerce"
                className="bg-white text-foreground border-2 border-black font-bold px-8 py-3 rounded-full shadow-brutal hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider font-mono text-sm sm:text-base"
              >
                Compare Prices
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-secondary rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary rounded-full opacity-10 blur-2xl"></div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4" data-testid="home-features-title">
              Bachat Ka Baap
            </h2>
            <p className="text-lg text-muted-foreground">Three powerful tools to maximize your savings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  to={feature.link}
                  data-testid={feature.testId}
                  className="group block"
                >
                  <div className="bg-card rounded-xl border-2 border-black shadow-brutal-lg p-6 h-full transition-all duration-300 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                    <div className={`w-16 h-16 ${feature.color} rounded-2xl border-2 border-black flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    
                    <h3 className="text-2xl font-heading font-medium mb-2">{feature.title}</h3>
                    <p className="font-mono text-sm text-secondary font-bold uppercase mb-3">{feature.subtitle}</p>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    
                    <div className="mt-4 flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform">
                      <span className="font-mono text-sm uppercase">Explore</span>
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shaadi Fund Tracker */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-accent to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border-2 border-black shadow-brutal-lg p-8" data-testid="home-shaadi-fund">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-2 flex items-center gap-3">
                  <Heart className="w-8 h-8 text-primary fill-primary" />
                  Shaadi Fund
                </h2>
                <p className="text-muted-foreground font-mono text-sm">All your bachat goes here!</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-heading font-bold text-primary" data-testid="shaadi-fund-amount">
                  ₹{shaadiF und.total_saved.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-muted-foreground font-mono">{shaadiF und.transactions} transactions</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-mono">
                <span className="text-muted-foreground">Goal: ₹{fundGoal.toLocaleString('en-IN')}</span>
                <span className="font-bold text-foreground">{fundProgress.toFixed(1)}% Complete</span>
              </div>
              <Progress value={fundProgress} className="h-4 border-2 border-black" />
            </div>
            
            <div className="mt-6 p-4 bg-accent border-2 border-dashed border-secondary rounded-lg">
              <p className="text-sm text-accent-foreground font-mono text-center">
                🎉 Keep saving! Every comparison and smart choice adds to your dream wedding fund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">Kaise Kaam Karta Hai?</h2>
            <p className="text-lg text-muted-foreground">Simple steps to maximize your savings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-heading font-bold mx-auto mb-4 border-2 border-black shadow-brutal-sm">
                1
              </div>
              <h3 className="text-xl font-heading font-medium mb-2">Choose Your Tool</h3>
              <p className="text-muted-foreground">Pick from CC Helper, Q-Commerce, or Sales Navigator based on what you need</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-heading font-bold mx-auto mb-4 border-2 border-black shadow-brutal-sm">
                2
              </div>
              <h3 className="text-xl font-heading font-medium mb-2">Get Smart Insights</h3>
              <p className="text-muted-foreground">Our AI analyzes and finds the best deals, cards, and sales for you</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-success text-white rounded-full flex items-center justify-center text-2xl font-heading font-bold mx-auto mb-4 border-2 border-black shadow-brutal-sm">
                3
              </div>
              <h3 className="text-xl font-heading font-medium mb-2">Start Saving!</h3>
              <p className="text-muted-foreground">Watch your Shaadi Fund grow with every smart purchase decision</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}