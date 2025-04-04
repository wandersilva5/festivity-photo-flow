
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  value, 
  size = 200 
}) => {
  const [hostname, setHostname] = useState('');

  useEffect(() => {
    // Get the current hostname and port for the QR code
    const host = window.location.hostname;
    const port = window.location.port;
    
    setHostname(`http://${host}${port ? ':'+port : ''}`);
  }, []);

  const qrValue = `${hostname}${value}`;

  return (
    <Card className="border-2 border-primary">
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        <div className="p-3 bg-white rounded-lg">
          <QRCodeSVG value={qrValue} size={size} />
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Scan to take photos!</p>
          <p className="text-xs mt-1">{qrValue}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
