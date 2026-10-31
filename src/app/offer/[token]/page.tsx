import PatientOfferClient from './PatientOfferClient';

export function generateStaticParams() {
  return [
    { token: 'demo' },
    { token: 'preview' },
    { token: 'sc_demo' },
    { token: 'off_9981' },
    { token: 'off_9982' },
  ];
}

export default function PatientOfferPage() {
  return <PatientOfferClient />;
}
