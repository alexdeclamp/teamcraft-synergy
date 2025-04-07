
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/landing/FooterSection';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mt-10">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/" className="flex items-center text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tight mb-8">Terms of Use</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground mb-4">Last updated: April 7, 2025</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Bra3n AI ("we," "our," or "us"), you agree to be bound by these Terms of Use. If you do not agree to all the terms and conditions, then you may not access the website or use any services.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. All changes are effective immediately when we post them and apply to all access to and use of the website thereafter. Your continued use of the website following the posting of revised Terms means that you accept and agree to the changes.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p>
            To access most features of the website, you must register for an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. User Content</h2>
          <p>
            The website may contain features that allow users to upload, post, submit, display, or transmit content. Any content you provide is provided at your own risk. We do not claim ownership of your content; however, by posting content, you grant us a worldwide, royalty-free, non-exclusive license to use, reproduce, modify, publish, translate, and distribute it in any existing or future media.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. Prohibited Uses</h2>
          <p>
            You may use the website only for lawful purposes and in accordance with these Terms. You agree not to:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>Use the website in any way that violates any applicable law or regulation.</li>
            <li>Use the website to transmit any material that is defamatory, obscene, indecent, abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable.</li>
            <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the website.</li>
            <li>Use the website in any manner that could disable, overburden, damage, or impair it.</li>
            <li>Use any robot, spider, or other automatic device, process, or means to access the website for any purpose.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">6. Intellectual Property Rights</h2>
          <p>
            The website and its entire contents, features, and functionality are owned by Bra3n AI, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">7. Disclaimer of Warranties</h2>
          <p>
            We cannot and do not guarantee or warrant that files available for downloading from the internet or the website will be free of viruses or other destructive code. You are responsible for implementing sufficient procedures and checkpoints to satisfy your particular requirements for anti-virus protection and accuracy of data input and output, and for maintaining a means external to our site for any reconstruction of any lost data.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
          <p>
            To the fullest extent provided by law, in no event will we, our affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the website, any websites linked to it, any content on the website or such other websites, including any direct, indirect, special, incidental, consequential, or punitive damages.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">9. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">10. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at terms@bra3n.ai.
          </p>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default TermsOfUse;
