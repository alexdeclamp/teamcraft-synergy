
import React from 'react';
import { Check } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-muted/30 rounded-3xl">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <img src="/placeholder.svg" alt="Bra3n Benefits" className="rounded-xl shadow-lg w-full" width={500} height={400} />
        </div>
        <div className="space-y-6 order-1 md:order-2">
          <h2 className="text-3xl sm:text-4xl font-semibold">🎯 Why Choose Bra3n?</h2>
          <div className="space-y-4">
            {["AI-Powered Search – Retrieve any info in seconds.", 
              "Smart Summaries – No more reading endless PDFs.", 
              "Team Collaboration – Share & work together seamlessly.", 
              "Secure & Private – Your data stays yours."].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 bg-primary/10 rounded-full p-1">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <p>{benefit}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-lg font-medium">🔹 "Like Notion, but with an AI brain."</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
