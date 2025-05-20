import { Tabs } from 'antd';
import RoastManual from './roastManual';
import RoastAuto from './roastAuto';

export default function Roast() {
  const items = [
    {
      key: 'manual',
      label: 'Manual Roast',
      children: <RoastManual />,
    },
    {
      key: 'auto',
      label: 'Auto Roast',
      children: <RoastAuto isReady={false}/>,
    },
  ];

  return (
    <div className="mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Coffee Roast Control Panel</h1>
      <Tabs 
        defaultActiveKey="manual" 
        items={items}
      />
    </div>
  );
}