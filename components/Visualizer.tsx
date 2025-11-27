import React, { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, YAxis } from 'recharts';

interface VisualizerProps {
  isRecording: boolean;
  audioStream: MediaStream | null;
}

interface DataPoint {
  name: string;
  value: number;
}

const Visualizer: React.FC<VisualizerProps> = ({ isRecording, audioStream }) => {
  const [data, setData] = useState<DataPoint[]>(Array(20).fill({ name: '', value: 10 }));

  useEffect(() => {
    if (!isRecording || !audioStream) {
      setData(Array(20).fill({ name: '', value: 5 }));
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioStream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 64;
    source.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateInterval = setInterval(() => {
      analyzer.getByteFrequencyData(dataArray);
      
      // Map a subset of frequency bins to the 20 bars
      const newData: DataPoint[] = [];
      const step = Math.floor(bufferLength / 20);
      
      for (let i = 0; i < 20; i++) {
        const value = dataArray[i * step] || 0;
        newData.push({ name: i.toString(), value: Math.max(value, 5) }); 
      }
      setData(newData);

    }, 50);

    return () => {
      clearInterval(updateInterval);
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [isRecording, audioStream]);

  return (
    <div className="w-full h-32 opacity-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={2}>
          <YAxis hide domain={[0, 255]} />
          <Bar 
            dataKey="value" 
            fill="#ef4444" 
            radius={[4, 4, 0, 0]} 
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Visualizer;