
import React, { useState } from 'react';
import { WaitlistLayout } from '@/components/waitlist/WaitlistLayout';
import { WaitlistForm } from '@/components/waitlist/WaitlistForm';
import { SuccessMessage } from '@/components/waitlist/SuccessMessage';

const WaitlistPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  
  return (
    <WaitlistLayout>
      {submitted ? (
        <SuccessMessage />
      ) : (
        <WaitlistForm onSuccess={() => setSubmitted(true)} />
      )}
    </WaitlistLayout>
  );
};

export default WaitlistPage;
